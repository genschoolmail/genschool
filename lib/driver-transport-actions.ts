"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDriverActiveTrip, closeAllDriverTrips } from "./transport-helper";
import { ensureTenantId } from "./tenant";
import { Prisma } from '@prisma/client';

type StudentWithTransport = Prisma.StudentGetPayload<{
    include: {
        user: true;
        class: true;
        transport: true;
        transportMapping: {
            include: {
                pickupStop: true;
                dropStop: true;
            };
        };
    };
}>;

// Get students assigned to a route for driver
export async function getRouteStudents(routeId: string) {
    const schoolId = await ensureTenantId();
    try {
        const route = await prisma.transportRoute.findFirst({
            where: { id: routeId, schoolId },
            include: {
                stops: {
                    where: { schoolId },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!route) return { success: false, error: "Route not found", students: [], allStudents: [] };

        // Fetch students related to this route - scoping by schoolId
        const students = await prisma.student.findMany({
            where: {
                schoolId,
                OR: [
                    { transportId: routeId },
                    { transportMapping: { pickupStop: { routeId: routeId } } },
                    { transportMapping: { dropStop: { routeId: routeId } } }
                ]
            } as any,
            include: {
                user: true,
                class: true,
                transportMapping: {
                    include: {
                        pickupStop: true,
                        dropStop: true
                    }
                }
            }
        }) as StudentWithTransport[];

        // Get all students with their names from user relation
        const allStudents = students.map(s => ({
            id: s.id,
            name: s.user?.name || 'Unknown Student',
            admissionNo: s.admissionNo,
            phone: s.phone,
            className: s.class?.name || 'No Class',
            pickupStop: s.transportMapping?.pickupStop?.name || null,
            dropStop: s.transportMapping?.dropStop?.name || null,
            hasStopMapping: !!s.transportMapping
        }));

        // Group students by their pickup stop (for stop-wise view)
        const studentsByStop = route.stops.map(stop => ({
            stop,
            pickupStudents: students
                .filter(s => s.transportMapping?.pickupStopId === stop.id)
                .map(s => ({
                    id: s.id,
                    name: s.user?.name || 'Unknown',
                    admissionNo: s.admissionNo,
                    className: s.class?.name
                })),
            dropStudents: students
                .filter(s => s.transportMapping?.dropStopId === stop.id)
                .map(s => ({
                    id: s.id,
                    name: s.user?.name || 'Unknown',
                    admissionNo: s.admissionNo,
                    className: s.class?.name
                }))
        }));

        const unassignedStudents = students
            .filter(s => !s.transportMapping?.pickupStopId && !s.transportMapping?.dropStopId)
            .map(s => ({
                id: s.id,
                name: s.user?.name || 'Unknown',
                admissionNo: s.admissionNo,
                className: s.class?.name
            }));

        return {
            success: true,
            route: {
                id: route.id,
                routeNo: route.routeNo,
                name: route.name
            },
            students: students,
            allStudents,
            studentsByStop,
            unassignedStudents,
            totalStudents: students.length
        };
    } catch (error) {
        console.error("Error fetching route students:", error);
        return { success: false, error: "Failed to fetch students", students: [], allStudents: [] };
    }
}


// ==================== HELPER ====================
async function resolveDriverId(providedId?: string) {
    if (providedId) return providedId;

    const schoolId = await ensureTenantId();
    const { auth } = await import("@/auth");
    const session = await auth();
    if (session?.user?.id && (session.user as any).role === 'DRIVER') {
        const driver = await prisma.driver.findFirst({
            where: { userId: session.user.id, schoolId }
        });
        if (driver) {
            console.log(`[Auto-Detect] Driver ID resolved from session: ${driver.id}`);
            return driver.id;
        }
    }
    return null;
}

// Export for Client use
export async function getCurrentDriverId() {
    return await resolveDriverId();
}


// Mark student as picked up
export async function markStudentPickup(studentId: string, routeId: string, driverId: string, lat?: number, lng?: number) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, error: "Unauthorized: Driver ID missing" };

        // Check for active trip using centralized helper
        const activeTrip = await getDriverActiveTrip(resolvedDriverId);

        if (!activeTrip) {
            return {
                success: false,
                error: "Trip not started. Start trip first.",
                noActiveTrip: true
            };
        }

        // Validate student assignment to this route - scoping by schoolId
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId },
            include: {
                transportMapping: {
                    include: {
                        pickupStop: true
                    }
                }
            }
        }) as (Prisma.StudentGetPayload<{ include: { transportMapping: { include: { pickupStop: true } } } }> | null);

        if (!student) {
            return { success: false, error: "Student is Not Assigned" };
        }

        // Check if student belongs to this route (either direct or via mapping)
        const isAssignedToRoute =
            (student as any).transportId === (activeTrip as any).routeId ||
            (student as any).transportMapping?.pickupStop?.routeId === (activeTrip as any).routeId;

        if (!isAssignedToRoute) {
            return {
                success: false,
                error: "Student is Not Assigned",
                notAssigned: true
            };
        }

        const checkStartTime = (activeTrip as any).startTime || (activeTrip as any).createdAt;

        const existingPickup = await prisma.transportAttendance.findFirst({
            where: {
                studentId,
                routeId: (activeTrip as any).routeId, // Use active trip route
                type: 'PICKUP',
                timestamp: {
                    gte: checkStartTime
                },
                schoolId
            }
        });

        if (existingPickup) {
            return {
                success: false,
                error: "Student already picked up in this trip",
                alreadyPickedUp: true
            };
        }

        // Create transport attendance record - scoping by schoolId
        await prisma.transportAttendance.create({
            data: {
                studentId,
                routeId: (activeTrip as any).routeId, // Ensure we use the trip's route ID
                type: 'PICKUP',
                status: 'BOARDED',
                timestamp: new Date(),
                latitude: lat, // Save location
                longitude: lng, // Save location
                schoolId
            }
        });

        // Update trip stats - scoping by schoolId
        await prisma.driverTrip.update({
            where: { id: activeTrip.id, schoolId } as any,
            data: { pickedStudents: { increment: 1 } }
        });

        revalidatePath('/driver');
        revalidatePath('/student/transport');
        return {
            success: true,
            message: "Student marked as picked up",
            notification: {
                type: 'PICKUP',
                studentId,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("Error marking pickup:", error);
        return { success: false, error: "Failed to mark pickup" };
    }
}

// Mark student as dropped
export async function markStudentDrop(studentId: string, routeId: string, driverId: string, lat?: number, lng?: number) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, error: "Unauthorized: Driver ID missing" };

        // Check for active trip use centralized helper
        const activeTrip = await getDriverActiveTrip(resolvedDriverId);

        if (!activeTrip) {
            return {
                success: false,
                error: "Trip not started. Start trip first.",
                noActiveTrip: true
            };
        }

        // Validate student assignment to this route
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                transportMapping: {
                    include: {
                        pickupStop: true
                    }
                }
            }
        });

        if (!student) {
            return { success: false, error: "Student is Not Assigned" };
        }

        const isAssignedToRoute =
            student.transportId === activeTrip.routeId ||
            student.transportMapping?.pickupStop?.routeId === activeTrip.routeId;

        if (!isAssignedToRoute) {
            return {
                success: false,
                error: "Student is Not Assigned",
                notAssigned: true
            };
        }

        const checkStartTime = activeTrip.startTime || activeTrip.createdAt;

        // Check if student was picked up in this trip
        const existingPickup = await prisma.transportAttendance.findFirst({
            where: {
                studentId,
                routeId: activeTrip.routeId,
                type: 'PICKUP',
                timestamp: {
                    gte: checkStartTime // Must be picked up during this trip
                }
            }
        });

        if (!existingPickup) {
            return {
                success: false,
                error: "Student needs to be picked up first",
                needsPickup: true
            };
        }

        // Check if already dropped in this trip
        const existingDrop = await prisma.transportAttendance.findFirst({
            where: {
                studentId,
                routeId: activeTrip.routeId,
                type: 'DROP',
                timestamp: {
                    gte: checkStartTime // Check drop timestamp against trip start
                }
            }
        });

        if (existingDrop) {
            return {
                success: false,
                error: "Student already dropped in this trip",
                alreadyDropped: true
            };
        }

        // Create transport attendance record
        await prisma.transportAttendance.create({
            data: {
                studentId,
                routeId: activeTrip.routeId,
                type: 'DROP',
                status: 'ALIGHTED',
                timestamp: new Date(),
                latitude: lat, // Save location
                longitude: lng // Save location
            }
        });

        // Update trip stats
        await prisma.driverTrip.update({
            where: { id: activeTrip.id },
            data: { droppedStudents: { increment: 1 } }
        });

        revalidatePath('/driver');
        revalidatePath('/student/transport');
        return {
            success: true,
            message: "Student marked as dropped",
            notification: {
                type: 'DROP',
                studentId,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("Error marking drop:", error);
        return { success: false, error: "Failed to mark drop" };
    }
}

// Get today's transport attendance for a route
// Get today's transport attendance for a route
export async function getTodayAttendance(routeId: string, driverId?: string) {
    const schoolId = await ensureTenantId();
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let queryStartTime = today;

        if (driverId) {
            // Priority 1: Check for Active Trip - scoping by schoolId
            const activeTrip = await prisma.driverTrip.findFirst({
                where: {
                    driverId: driverId,
                    status: 'ACTIVE',
                    schoolId
                }
            });

            if (activeTrip) {
                // If there's an active trip, ONLY show attendance from this trip's start
                queryStartTime = (activeTrip as any).startTime;
            } else {
                // Priority 2: Check for Last Trip (Completed/Cancelled) today - scoping by schoolId
                const lastTrip = await prisma.driverTrip.findFirst({
                    where: {
                        driverId: driverId,
                        date: {
                            gte: today,
                            lt: tomorrow
                        },
                        schoolId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                if (lastTrip && (lastTrip as any).startTime) {
                    queryStartTime = (lastTrip as any).startTime;
                }
            }
        }

        const attendance = await prisma.transportAttendance.findMany({
            where: {
                routeId,
                timestamp: {
                    gte: queryStartTime,
                },
                schoolId
            },
            include: {
                student: {
                    include: {
                        user: true,
                        class: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        const pickedUpIds = attendance.filter(a => a.type === 'PICKUP').map(a => a.studentId);
        const droppedOffIds = attendance.filter(a => a.type === 'DROP').map(a => a.studentId);

        // Students currently on bus (picked but not dropped)
        const onBusStudentIds = pickedUpIds.filter(id => !droppedOffIds.includes(id));

        // Get detailed list of picked students with their info
        // We map from the attendance record itself to preserve the exact pickup time of THIS trip
        const pickedStudentsDetails = attendance
            .filter(a => a.type === 'PICKUP' && !droppedOffIds.includes(a.studentId))
            .map(a => ({
                id: a.studentId,
                name: a.student?.user?.name || 'Unknown',
                className: a.student?.class?.name || '',
                photo: a.student?.user?.image || null,
                pickupTime: a.timestamp
            }));

        return {
            success: true,
            attendance,
            pickedUp: pickedUpIds,
            droppedOff: droppedOffIds,
            onBusStudents: onBusStudentIds,
            pickedStudentsDetails
        };
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return { success: false, attendance: [], pickedUp: [], droppedOff: [], onBusStudents: [], pickedStudentsDetails: [] };
    }
}

// Get student by QR code (admission number or ID)
export async function getStudentByQR(qrCode: string, driverId?: string) {
    const schoolId = await ensureTenantId();
    try {
        // Safe Driver Resolution
        const resolvedDriverId = await resolveDriverId(driverId);

        // ... (student fetch logic remains same) ...

        // Try to find by admission number first - scoping by schoolId
        let student = await prisma.student.findFirst({
            where: { admissionNo: qrCode, schoolId },
            include: {
                user: true,
                class: true,
                transport: true,
                transportMapping: {
                    include: {
                        pickupStop: true,
                        dropStop: true
                    }
                }
            }
        }) as StudentWithTransport | null;

        // If not found, try by ID - scoping by schoolId
        if (!student) {
            student = await prisma.student.findFirst({
                where: { id: qrCode, schoolId },
                include: {
                    user: true,
                    class: true,
                    transport: true,
                    transportMapping: {
                        include: {
                            pickupStop: true,
                            dropStop: true
                        }
                    }
                }
            }) as StudentWithTransport | null;
        }

        // If still not found, try parsing QR format STUDENT:id:...
        if (!student && qrCode.includes(":")) {
            const parts = qrCode.split(":");
            const potentialId = parts[1];
            if (potentialId) {
                student = await prisma.student.findFirst({
                    where: { id: potentialId, schoolId },
                    include: {
                        user: true,
                        class: true,
                        transport: true,
                        transportMapping: {
                            include: {
                                pickupStop: true,
                                dropStop: true
                            }
                        }
                    }
                }) as StudentWithTransport | null;
            }
        }

        // Try parsing JSON QR code format (from ID card)
        if (!student && qrCode.startsWith('{')) {
            try {
                const qrJson = JSON.parse(qrCode);
                if (qrJson.admissionNo) {
                    student = await prisma.student.findFirst({
                        where: { admissionNo: qrJson.admissionNo, schoolId },
                        include: {
                            user: true,
                            class: true,
                            transport: true,
                            transportMapping: {
                                include: {
                                    pickupStop: true,
                                    dropStop: true
                                }
                            }
                        }
                    }) as StudentWithTransport | null;
                } else if (qrJson.studentId) {
                    student = await prisma.student.findFirst({
                        where: { id: qrJson.studentId, schoolId },
                        include: {
                            user: true,
                            class: true,
                            transport: true,
                            transportMapping: {
                                include: {
                                    pickupStop: true,
                                    dropStop: true
                                }
                            }
                        }
                    }) as StudentWithTransport | null;
                }
            } catch (e) {
                // Not valid JSON, continue
            }
        }

        if (!student) {
            return { success: false, error: "Student not found", student: null };
        }

        // Get routeId from transportId or transportMapping relations
        const routeId = student.transportId ||
            student.transportMapping?.pickupStop?.routeId ||
            student.transportMapping?.dropStop?.routeId ||
            null;

        // Get attendance status (Scoped to active trip if driverId provided)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let checkStartTime = today; // Default fallback

        if (resolvedDriverId) {
            // Find the CURRENT active trip for this driver
            const activeTrip = await getDriverActiveTrip(resolvedDriverId);

            if (activeTrip) {
                checkStartTime = activeTrip.startTime || activeTrip.createdAt;
                console.log(`[Attendance Scope] Active Trip Found: ${activeTrip.id}. Checking scans after: ${checkStartTime.toISOString()}`);
            } else {
                console.log(`[Attendance Scope] No Active Trip for driver ${resolvedDriverId}. Falling back to TODAY: ${today.toISOString()}`);
            }
        } else {
            console.log(`[Attendance Scope] No Driver ID available. Using TODAY scope.`);
        }

        const todayAttendance = await prisma.transportAttendance.findMany({
            where: {
                studentId: student.id,
                timestamp: {
                    gte: checkStartTime,
                },
                schoolId
            }
        });

        const isPickedUp = todayAttendance.some(a => a.type === 'PICKUP');
        const isDropped = todayAttendance.some(a => a.type === 'DROP');

        return {
            success: true,
            student: {
                id: student.id,
                name: student.user?.name || 'Unknown Student',
                admissionNo: student.admissionNo,
                className: student.class ? `${student.class.name}${student.class.section ? '-' + student.class.section : ''} ` : 'No Class',
                phone: student.phone,
                photo: student.user?.image || null,
                routeId: routeId,
                hasTransport: !!routeId,
                isPickedUp,
                isDropped
            }
        };
    } catch (error) {
        console.error("Error finding student:", error);
        return { success: false, error: "Failed to find student", student: null };
    }
}



// Remove student from transport route
export async function removeStudentFromRoute(studentId: string) {
    const schoolId = await ensureTenantId();
    try {
        // Update student to remove transport assignment - scoping by schoolId
        await prisma.student.update({
            where: { id: studentId, schoolId },
            data: {
                transportId: null
            }
        });

        // Also remove transport mapping if exists - scoping by schoolId
        await prisma.studentTransportMapping.deleteMany({
            where: { studentId, schoolId }
        });

        revalidatePath('/admin/transport');
        revalidatePath('/driver/students');

        return { success: true, message: "Student removed from route" };
    } catch (error) {
        console.error("Error removing student from route:", error);
        return { success: false, error: "Failed to remove student" };
    }
}

// Update student stop assignment
export async function updateStudentStopAssignment(studentId: string, pickupStopId: string | null, dropStopId: string | null) {
    const schoolId = await ensureTenantId();
    try {
        // Check if mapping exists - scoping by schoolId
        const existingMapping = await prisma.studentTransportMapping.findFirst({
            where: { studentId, schoolId } as any
        });

        if (existingMapping) {
            await prisma.studentTransportMapping.update({
                where: { id: existingMapping.id, schoolId } as any,
                data: {
                    pickupStopId: pickupStopId || null,
                    dropStopId: dropStopId || null
                }
            });
        } else {
            await prisma.studentTransportMapping.create({
                data: {
                    studentId,
                    pickupStopId: pickupStopId || null,
                    dropStopId: dropStopId || null,
                    schoolId
                }
            });
        }

        revalidatePath('/admin/transport');
        revalidatePath('/driver/students');

        return { success: true, message: "Stop assignment updated" };
    } catch (error) {
        console.error("Error updating stop assignment:", error);
        return { success: false, error: "Failed to update stop assignment" };
    }
}

// Get transport history for a driver's route
export async function getRouteHistory(routeId: string, startDate?: Date, endDate?: Date) {
    const schoolId = await ensureTenantId();
    try {
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        // Fetch attendance records
        const attendance = await prisma.transportAttendance.findMany({
            where: {
                routeId,
                schoolId,
                timestamp: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                student: {
                    include: {
                        user: true,
                        class: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Calculate stats
        const groupedByDate = attendance.reduce((acc, curr) => {
            const dateKey = new Date(curr.timestamp).toLocaleDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, pickup: 0, drop: 0, details: [] };
            }
            if (curr.type === 'PICKUP') acc[dateKey].pickup++;
            else if (curr.type === 'DROP') acc[dateKey].drop++;
            acc[dateKey].details.push(curr);
            return acc;
        }, {} as Record<string, any>);

        return {
            success: true,
            history: Object.values(groupedByDate),
            raw: attendance
        };
    } catch (error) {
        console.error('Error fetching route history:', error);
        return { success: false, history: [], raw: [] };
    }
}

// ==================== TRIP MANAGEMENT ====================

// Start a new trip
export async function startTrip(driverId: string, routeId: string) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, error: "Unauthorized: Driver ID missing" };

        // Professional Fix: Auto-close ANY existing active trips for this driver - scoping by schoolId
        await closeAllDriverTrips(resolvedDriverId);

        // Count total students for this route - scoping by schoolId
        const studentCount = await prisma.student.count({
            where: {
                schoolId,
                OR: [
                    { transportId: routeId },
                    { transportMapping: { pickupStop: { routeId: routeId } } },
                    { transportMapping: { dropStop: { routeId: routeId } } }
                ]
            } as any
        });

        // Create new trip - scoping by schoolId
        const trip = await prisma.driverTrip.create({
            data: {
                driverId: resolvedDriverId,
                routeId,
                status: 'ACTIVE',
                totalStudents: studentCount,
                pickedStudents: 0,
                droppedStudents: 0,
                startTime: new Date(), // Explicitly set start time
                schoolId
            }
        });

        revalidatePath('/driver');
        return { success: true, trip };
    } catch (error) {
        console.error('Error starting trip:', error);
        return { success: false, error: 'Failed to start trip' };
    }
}

// End a trip (only if all picked students are dropped)
export async function endTrip(driverId: string) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, error: "Unauthorized: Driver ID missing" };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find active trip
        const trip = await prisma.driverTrip.findFirst({
            where: {
                driverId: resolvedDriverId,
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: 'ACTIVE',
                schoolId
            }
        });

        if (!trip) {
            return { success: false, error: 'No active trip found' };
        }

        // Check if all picked students are dropped
        if (trip.pickedStudents > trip.droppedStudents) {
            const remaining = trip.pickedStudents - trip.droppedStudents;
            return {
                success: false,
                error: `${remaining} students still on bus.Drop all students first.`,
                studentsRemaining: remaining
            };
        }

        // End the trip
        const updatedTrip = await prisma.driverTrip.update({
            where: { id: trip.id, schoolId } as any,
            data: {
                status: 'COMPLETED',
                endTime: new Date()
            }
        });

        revalidatePath('/driver');
        return { success: true, trip: updatedTrip };
    } catch (error) {
        console.error('Error ending trip:', error);
        return { success: false, error: 'Failed to end trip' };
    }
}

// Get active trip helper (internal)
async function getDriverActiveTripScoped(driverId: string, schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.driverTrip.findFirst({
        where: {
            driverId,
            date: {
                gte: today,
                lt: tomorrow
            },
            status: 'ACTIVE',
            schoolId
        },
        include: {
            route: true
        }
    });
}

// Get active trip for today
export async function getActiveTrip(driverId: string) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, trip: null, isActive: false };

        const trip = await getDriverActiveTripScoped(resolvedDriverId, schoolId);

        return {
            success: true,
            trip,
            isActive: !!trip
        };
    } catch (error) {
        console.error('Error fetching active trip:', error);
        return { success: false, trip: null, isActive: false };
    }
}

// Update trip stats when pickup/drop happens
export async function updateTripStats(driverId: string, action: 'pickup' | 'drop') {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false };

        const trip = await getDriverActiveTripScoped(resolvedDriverId, schoolId);

        if (!trip) return { success: false };

        await prisma.driverTrip.update({
            where: { id: trip.id, schoolId } as any,
            data: action === 'pickup'
                ? { pickedStudents: { increment: 1 } }
                : { droppedStudents: { increment: 1 } }
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating trip stats:', error);
        return { success: false };
    }
}

// Get driver stats
export async function getDriverStats(driverId: string) {
    const schoolId = await ensureTenantId();
    try {
        const resolvedDriverId = await resolveDriverId(driverId);
        if (!resolvedDriverId) return { success: false, error: "Unauthorized" };

        const totalTrips = await prisma.driverTrip.count({
            where: {
                driverId: resolvedDriverId,
                status: 'COMPLETED',
                schoolId
            }
        });

        // Mocking other stats for now as schema support might be limited
        return {
            success: true,
            totalTrips,
            onTimePercentage: 98,
            rating: 4.9
        };
    } catch (error) {
        console.error('Error fetching driver stats:', error);
        return { success: false, totalTrips: 0, onTimePercentage: 0, rating: 0 };
    }
}

