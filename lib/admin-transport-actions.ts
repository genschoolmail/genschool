"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTenantId } from "./tenant";
import bcrypt from "bcryptjs";

// --- Vehicle Actions ---

export async function getVehicles() {
    const schoolId = await ensureTenantId();
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { schoolId },
            include: {
                driver: {
                    include: {
                        user: true
                    }
                },
                routes: true
            },
            orderBy: { number: 'asc' }
        });
        return vehicles;
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
    }
}

export async function createVehicle(data: { number: string; capacity: number; model: string; driverId?: string }) {
    const schoolId = await ensureTenantId();
    try {
        // Enforce school prefix for vehicle number to prevent global collisions
        const schoolPrefix = schoolId.substring(0, 8).toUpperCase();
        const prefixedNumber = data.number.startsWith(schoolPrefix) ? data.number : `${schoolPrefix}-${data.number}`;

        const vehicle = await prisma.vehicle.create({
            data: {
                ...data,
                number: prefixedNumber,
                schoolId
            }
        });
        revalidatePath("/admin/transport/vehicles");
        return { success: true, vehicle }; // Modified to return vehicle on success
    } catch (error) {
        console.error("Error creating vehicle:", error);
        return { success: false, error: "Failed to create vehicle" };
    }
}

export async function deleteVehicle(id: string) {
    const schoolId = await ensureTenantId();
    try {
        await prisma.vehicle.delete({ where: { id, schoolId } as any });
        revalidatePath("/admin/transport/vehicles");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete vehicle" };
    }
}


export async function updateVehicle(id: string, data: { number: string; capacity: number; model: string; driverId?: string }) {
    const schoolId = await ensureTenantId();
    try {
        const schoolPrefix = schoolId.substring(0, 8).toUpperCase();
        const prefixedNumber = data.number.startsWith(schoolPrefix) ? data.number : `${schoolPrefix}-${data.number}`;

        const vehicle = await prisma.vehicle.update({
            where: { id, schoolId } as any,
            data: {
                number: prefixedNumber,
                capacity: data.capacity,
                model: data.model,
                driverId: data.driverId || null
            }
        });
        revalidatePath("/admin/transport/vehicles");
        revalidatePath(`/admin/transport/vehicles/${id}`);
        return { success: true, vehicle }; // Modified to return vehicle on success
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return { success: false, error: "Failed to update vehicle" };
    }
}

export async function getVehicleById(id: string) {
    const schoolId = await ensureTenantId();
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: { id, schoolId },
            include: {
                driver: {
                    include: { user: true }
                },
                routes: true
            }
        });
        return vehicle;
    } catch (error) {
        return null;
    }
}


// --- Driver Actions ---

export async function getDrivers() {
    const schoolId = await ensureTenantId();
    try {
        const drivers = await prisma.driver.findMany({
            where: { schoolId },
            include: {
                user: true,
                vehicle: true,
                route: true
            },
            orderBy: { joiningDate: 'desc' }
        });
        return drivers;
    } catch (error) {
        console.error("Error fetching drivers:", error);
        return [];
    }
}

export async function getDriverById(id: string) {
    const schoolId = await ensureTenantId();
    try {
        const driver = await prisma.driver.findFirst({
            where: { id, schoolId },
            include: {
                user: true,
                vehicle: true,
            },
        });
        return driver;
    } catch (error) {
        console.error("Error fetching driver:", error);
        return null;
    }
}

export async function createDriver(data: {
    name: string;
    email: string;
    phone: string;
    licenseNo: string;
    dob?: string;
    address?: string;
    salary?: number;
    employmentType?: string;
    vehicleId?: string;
    routeId?: string;
}) {
    const schoolId = await ensureTenantId();
    try {
        // Create user first - scoping by schoolId
        const hashedPassword = await bcrypt.hash("driver123", 10);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                role: "DRIVER",
                schoolId
            },
        });

        // Create driver linked to user - scoping by schoolId
        const driver = await prisma.driver.create({
            data: {
                userId: user.id,
                licenseNo: data.licenseNo,
                phone: data.phone,
                dob: data.dob ? new Date(data.dob) : null,
                address: data.address,
                salary: data.salary,
                employmentType: data.employmentType || "FULL_TIME",
                schoolId
            },
        });

        // If vehicleId provided, update vehicle - scoping by schoolId
        if (data.vehicleId) {
            await prisma.vehicle.update({
                where: { id: data.vehicleId, schoolId } as any,
                data: { driverId: driver.id },
            });
        }

        revalidatePath("/admin/transport/drivers");
        return {
            success: true,
            credentials: {
                phone: data.phone,
                password: "driver123"
            }
        };
    } catch (error: any) {
        console.error("Error creating driver:", error);
        return { success: false, error: error.message || "Failed to create driver" };
    }
}

export async function updateDriver(
    id: string,
    data: {
        name?: string;
        email?: string;
        phone?: string;
        licenseNo?: string;
        dob?: string;
        address?: string;
        salary?: number;
        employmentType?: string;
        vehicleId?: string;
    }
) {
    const schoolId = await ensureTenantId();
    try {
        const driver = await prisma.driver.findFirst({
            where: { id, schoolId },
            include: { user: true }
        });

        if (!driver) {
            return { success: false, error: "Driver not found" };
        }

        // Update user data
        if (data.name || data.email || data.phone) {
            await prisma.user.update({
                where: { id: driver.userId, schoolId } as any,
                data: {
                    ...(data.name && { name: data.name }),
                    ...(data.email && { email: data.email }),
                    ...(data.phone && { phone: data.phone })
                }
            });
        }

        // Update driver data
        await prisma.driver.update({
            where: { id, schoolId } as any,
            data: {
                ...(data.licenseNo && { licenseNo: data.licenseNo }),
                ...(data.phone && { phone: data.phone }),
                ...(data.dob && { dob: new Date(data.dob) }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.salary !== undefined && { salary: data.salary }),
                ...(data.employmentType && { employmentType: data.employmentType })
            }
        });

        // Update vehicle assignment if vehicleId is provided
        if (data.vehicleId !== undefined) {
            // First, remove driver from any previously assigned vehicle within the school
            await prisma.vehicle.updateMany({
                where: { driverId: id, schoolId },
                data: { driverId: null }
            });

            // Then, assign driver to the new vehicle if vehicleId is not null
            if (data.vehicleId) {
                await prisma.vehicle.update({
                    where: { id: data.vehicleId, schoolId } as any,
                    data: { driverId: id }
                });
            }
        }

        revalidatePath("/admin/transport/drivers");
        revalidatePath(`/admin/transport/drivers/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating driver:", error);
        return { success: false, error: "Failed to update driver" };
    }
}

export async function deleteDriver(id: string) {
    const schoolId = await ensureTenantId();
    try {
        const driver = await prisma.driver.findFirst({
            where: { id, schoolId },
        });

        if (!driver) throw new Error("Driver not found");

        // Use transaction to ensure both are deleted or neither
        await prisma.$transaction([
            prisma.driver.delete({ where: { id, schoolId } as any }),
            prisma.user.delete({ where: { id: driver.userId, schoolId } as any }),
        ]);

        revalidatePath("/admin/transport/drivers");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting driver:", error);
        return { success: false, error: error.message || "Failed to delete driver" };
    }
}

// --- Route Actions ---

export async function getRoutes() {
    const schoolId = await ensureTenantId();
    try {
        const routes = await prisma.transportRoute.findMany({
            where: { schoolId },
            include: {
                vehicle: true,
                driver: {
                    include: { user: true }
                },
                stops: {
                    orderBy: { order: 'asc' }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { routeNo: 'asc' }
        });
        return routes;
    } catch (error) {
        console.error("Error fetching routes:", error);
        return [];
    }
}

export async function createRoute(data: {
    routeNo: string;
    name: string;
    startPoint: string;
    endPoint: string;
    vehicleId?: string;
    driverId?: string;
}) {
    const schoolId = await ensureTenantId();
    try {
        // Enforce school prefix for route number to prevent global collisions
        const schoolPrefix = schoolId.substring(0, 8).toUpperCase();
        const prefixedRouteNo = data.routeNo.startsWith(schoolPrefix) ? data.routeNo : `${schoolPrefix}-${data.routeNo}`;

        const route = await prisma.transportRoute.create({
            data: {
                ...data,
                routeNo: prefixedRouteNo,
                schoolId
            },
        });

        revalidatePath("/admin/transport/routes");
        return { success: true, route };
    } catch (error) {
        console.error("Error creating route:", error);
        return { success: false, error: "Failed to create route" };
    }
}

export async function updateRoute(id: string, data: {
    routeNo?: string;
    name?: string;
    startPoint?: string;
    endPoint?: string;
    vehicleId?: string | null;
    driverId?: string | null;
}) {
    const schoolId = await ensureTenantId();
    try {
        let prefixedRouteNo = undefined;
        if (data.routeNo) {
            const schoolPrefix = schoolId.substring(0, 8).toUpperCase();
            prefixedRouteNo = data.routeNo.startsWith(schoolPrefix) ? data.routeNo : `${schoolPrefix}-${data.routeNo}`;
        }

        const route = await prisma.transportRoute.update({
            where: { id, schoolId } as any,
            data: {
                ...(prefixedRouteNo && { routeNo: prefixedRouteNo }),
                ...(data.name && { name: data.name }),
                ...(data.startPoint && { startPoint: data.startPoint }),
                ...(data.endPoint && { endPoint: data.endPoint }),
                ...(data.vehicleId !== undefined && { vehicleId: data.vehicleId }),
                ...(data.driverId !== undefined && { driverId: data.driverId }),
            }
        });
        revalidatePath("/admin/transport/routes");
        revalidatePath(`/admin/transport/routes/${id}`);
        return { success: true, route };
    } catch (error) {
        console.error("Error updating route:", error);
        return { success: false, error: "Failed to update route" };
    }
}


export async function addStopToRoute(routeId: string, data: { name: string; lat: number; lng: number; order: number; time: string }) {
    const schoolId = await ensureTenantId();
    try {
        // Verify route exists and belongs to the school
        const route = await prisma.transportRoute.findFirst({
            where: { id: routeId, schoolId }
        });

        if (!route) {
            return { success: false, error: "Route not found or does not belong to your school." };
        }

        const stop = await prisma.transportStop.create({
            data: {
                routeId,
                name: data.name,
                latitude: data.lat,
                longitude: data.lng,
                order: data.order,
                arrivalTime: data.time,
                schoolId // Ensure stop is also scoped by schoolId
            },
        });

        revalidatePath("/admin/transport/routes");
        revalidatePath(`/admin/transport/routes/${routeId}`);
        return { success: true, stop };
    } catch (error) {
        console.error("Error adding stop:", error);
        return { success: false, error: "Failed to add stop" };
    }
}

export async function getRouteById(id: string) {
    const schoolId = await ensureTenantId();
    try {
        const route = await prisma.transportRoute.findFirst({
            where: { id, schoolId },
            include: {
                vehicle: true,
                driver: {
                    include: { user: true }
                },
                stops: {
                    orderBy: { order: 'asc' },
                    where: { schoolId }, // Ensure stops are also scoped by schoolId
                    include: {
                        pickupStudents: true,
                        dropStudents: true
                    }
                },
                students: {
                    where: { schoolId }, // Ensure students are also scoped by schoolId
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
                }
            }
        });
        return route;
    } catch (error) {
        console.error("Error fetching route:", error);
        return null;
    }
}


export async function getAllDriverLocations() {
    const schoolId = await ensureTenantId();
    try {
        const drivers = await prisma.driver.findMany({
            where: { schoolId },
            include: {
                user: true,
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 1
                },
                vehicle: {
                    include: {
                        routes: {
                            include: {
                                stops: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Filter out drivers without recent location (last 30 mins)
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

        return drivers.filter(d =>
            d.locations.length > 0 &&
            new Date(d.locations[0].timestamp) > thirtyMinsAgo
        ).map(d => ({
            driverId: d.id,
            driverName: d.user.name,
            location: d.locations[0],
            vehicleId: d.vehicle?.id,
            vehicleNumber: d.vehicle?.number,
            routes: d.vehicle?.routes
        }));
    } catch (error) {
        console.error("Error fetching driver locations:", error);
        return [];
    }
}


export async function assignStudentToRoute(routeId: string, studentId: string, stopId?: string) {
    const schoolId = await ensureTenantId();
    try {
        // Verify route belongs to school
        const route = await prisma.transportRoute.findFirst({
            where: { id: routeId, schoolId }
        });

        if (!route) {
            return { success: false, error: "Route not found or unauthorized" };
        }

        // Assign route to student
        await prisma.student.update({
            where: { id: studentId, schoolId } as any,
            data: {
                transportId: routeId
            }
        });

        // Handle stop mapping
        if (stopId) {
            // Check if stop belongs to route (and thus school)
            const stop = await prisma.transportStop.findFirst({
                where: { id: stopId, routeId, schoolId }
            });

            if (stop) {
                await prisma.studentTransportMapping.upsert({
                    where: { studentId },
                    create: {
                        schoolId,
                        studentId,
                        pickupStopId: stopId,
                        dropStopId: stopId, // Defaulting drop stop to same for now, or null
                        status: "ACTIVE"
                    },
                    update: {
                        pickupStopId: stopId,
                        dropStopId: stopId
                    }
                });
            }
        }

        revalidatePath("/admin/transport/routes");
        revalidatePath(`/admin/transport/routes/${routeId}`);
        return { success: true };
    } catch (error) {
        console.error("Error assigning student:", error);
        return { success: false, error: "Failed to assign student" };
    }
}

export async function removeStudentFromRoute(studentId: string) {
    const schoolId = await ensureTenantId();
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId, schoolId } as any
        });

        if (!student) return { success: false };

        const oldRouteId = student.transportId;

        // Remove route from student
        await prisma.student.update({
            where: { id: studentId, schoolId } as any,
            data: {
                transportId: null
            }
        });

        // Remove mapping
        await prisma.studentTransportMapping.deleteMany({
            where: { studentId, schoolId }
        });

        revalidatePath("/admin/transport/routes");
        if (oldRouteId) {
            revalidatePath(`/admin/transport/routes/${oldRouteId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Error removing student:", error);
        return { success: false, error: "Failed to remove student" };
    }
}

export async function deleteRoute(id: string) {
    const schoolId = await ensureTenantId();
    try {
        await prisma.transportRoute.delete({
            where: { id, schoolId } as any
        });
        revalidatePath("/admin/transport/routes");
        return { success: true };
    } catch (error) {
        console.error("Error deleting route:", error);
        return { success: false, error: "Failed to delete route" };
    }
}

export async function deleteStop(id: string) {
    const schoolId = await ensureTenantId();
    try {
        await prisma.transportStop.delete({
            where: { id, schoolId } as any
        });
        revalidatePath("/admin/transport/routes");
        return { success: true };
    } catch (error) {
        console.error("Error deleting stop:", error);
        return { success: false, error: "Failed to delete stop" };
    }
}

export async function searchStudentsForTransport(query: string) {
    const schoolId = await ensureTenantId();
    try {
        const students = await prisma.student.findMany({
            where: {
                schoolId,
                OR: [
                    { user: { name: { contains: query } } },
                    { rollNo: { contains: query } },
                    { admissionNo: { contains: query } },
                ],
            },
            include: {
                user: true,
                class: true,
                transport: true
            },
            take: 10
        });
        return students;
    } catch (error) {
        console.error("Error searching students:", error);
        return [];
    }
}
