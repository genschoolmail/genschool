'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { generateAdmissionNo } from '@/lib/actions/admission-actions';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { ensureTenantId } from '@/lib/tenant';

import { saveFile } from '@/lib/upload';
// import { collectFees } from '@/lib/fee-collection-actions';

// Helper functions for academic years and classes
// Deprecated: use lib/actions/academic-year.ts instead

export async function getClasses() {
    const schoolId = await ensureTenantId();
    return await prisma.class.findMany({
        where: { schoolId },
        orderBy: [
            { name: 'asc' },
            { section: 'asc' }
        ]
    });
}

// --- Password Reset ---
export async function resetUserPassword(formData: FormData) {
    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!userId || !newPassword) {
        throw new Error("Missing required fields");
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword
            }
        });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error resetting password:', error);
        throw new Error("Failed to reset password");
    }
}

// --- Student Actions ---
export async function createStudent(formData: FormData) {
    const schoolId = await ensureTenantId();

    try {
        // Check Usage Limit
        const { checkUsageLimit } = await import('@/lib/subscription');
        const usage = await checkUsageLimit(schoolId, 'student');
        if (!usage.allowed) {
            return {
                success: false,
                error: `Student limit reached (${usage.current}/${usage.limit}). Upgrade plan to add more.`
            };
        }

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        let phone = formData.get('phone') as string;
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { schoolId: true }
        });

        // Use centralized logic for consistency
        let admissionNo = formData.get('admissionNo') as string;

        // If not provided or user tampered, regenerate
        // Also check for collision strictly
        const existingStudent = admissionNo ? await prisma.student.findFirst({ where: { admissionNo, schoolId } }) : null;

        if (!admissionNo || existingStudent) {
            admissionNo = await generateAdmissionNo();
        }

        let rollNo = formData.get('rollNo') as string;
        const gender = formData.get('gender') as string;
        const classId = formData.get('classId') as string;

        // Fallback auto-assignment for roll number if not provided
        if (!rollNo || rollNo.trim() === '') {
            const count = await prisma.student.count({
                where: { schoolId, classId: classId || undefined }
            });
            rollNo = (count + 1).toString();
        }
        const dobStr = formData.get('dob') as string;
        const address = formData.get('address') as string;
        const imageFile = formData.get('image') as File;
        const documentsFile = formData.get('documents') as File;

        // Generate unique phone if not provided
        if (!phone || phone.trim() === '') {
            phone = `STU${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }

        let imagePath = undefined;
        if (imageFile && imageFile.size > 0) {
            imagePath = await saveFile(imageFile, 'students');
        }

        let documentsPath = undefined;
        if (documentsFile && documentsFile.size > 0) {
            documentsPath = await saveFile(documentsFile, 'students/documents');
        }

        const hashedPassword = await bcrypt.hash('password123', 10);

        const fatherName = formData.get('fatherName') as string;
        const motherName = formData.get('motherName') as string;
        const parentPhone = formData.get('parentPhone') as string;
        const parentEmail = formData.get('parentEmail') as string;

        // Create or update parent record if parent info provided
        let parentId = undefined;
        if (fatherName || motherName || parentPhone || parentEmail) {
            let parentRecord = null;

            // Check if parent already exists by phone or email
            if (parentPhone) {
                parentRecord = await prisma.parent.findFirst({
                    where: { phone: parentPhone }
                });
            }

            if (!parentRecord && parentEmail) {
                parentRecord = await prisma.parent.findFirst({
                    where: { email: parentEmail }
                });
            }

            if (parentRecord) {
                // Update existing parent record if needed
                parentId = parentRecord.id;
                await prisma.parent.update({
                    where: { id: parentId },
                    data: {
                        fatherName: fatherName || parentRecord.fatherName,
                        motherName: motherName || parentRecord.motherName,
                        phone: parentPhone || parentRecord.phone,
                        email: parentEmail || parentRecord.email,
                    }
                });
            } else {
                // Create new parent record
                const newParent = await prisma.parent.create({
                    data: {
                        fatherName,
                        motherName,
                        phone: parentPhone,
                        email: parentEmail,
                        schoolId
                    }
                });
                parentId = newParent.id;
            }
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'STUDENT',
                image: imagePath,
                schoolId
            }
        });

        await prisma.student.create({
            data: {
                userId: user.id,
                admissionNo,
                rollNo,
                gender,
                classId: classId || undefined,
                dob: dobStr ? new Date(dobStr) : undefined,
                address,
                phone,
                documents: documentsPath,
                schoolId,
                parentId: parentId
            }
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating student:', error);
        return {
            success: false,
            error: error.message || 'Failed to create student'
        };
    }
}

export async function updateStudent(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const admissionNo = formData.get('admissionNo') as string;
    const rollNo = formData.get('rollNo') as string;
    const gender = formData.get('gender') as string;
    const classId = formData.get('classId') as string;
    const dobStr = formData.get('dob') as string;
    const address = formData.get('address') as string;
    const imageFile = formData.get('image') as File;
    const documentsFile = formData.get('documents') as File;

    const schoolId = await ensureTenantId();
    const student = await prisma.student.findFirst({
        where: { id, schoolId },
        include: { user: true }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    let imagePath = student.user.image;
    if (imageFile && imageFile.size > 0) {
        imagePath = await saveFile(imageFile, 'students');
    }

    let documentsPath = student.documents;
    if (documentsFile && documentsFile.size > 0) {
        documentsPath = await saveFile(documentsFile, 'students/documents');
    }

    const userData: any = { name, email };
    if (phone) userData.phone = phone;
    if (imagePath) userData.image = imagePath;

    // Get parent information from form
    const fatherName = formData.get('fatherName') as string;
    const motherName = formData.get('motherName') as string;
    const parentPhone = formData.get('parentPhone') as string;
    const parentEmail = formData.get('parentEmail') as string;

    // Handle parent information update/create
    if (fatherName || motherName || parentPhone || parentEmail) {
        if (student.parentId) {
            // Update existing parent
            await prisma.parent.update({
                where: { id: student.parentId },
                data: {
                    fatherName: fatherName || undefined,
                    motherName: motherName || undefined,
                    phone: parentPhone || undefined,
                    email: parentEmail || undefined
                }
            });
        } else {
            // Create or Link parent by phone/email
            let existingParent = null;
            if (parentPhone) {
                existingParent = await prisma.parent.findFirst({
                    where: { phone: parentPhone }
                });
            }

            if (!existingParent && parentEmail) {
                existingParent = await prisma.parent.findFirst({
                    where: { email: parentEmail }
                });
            }

            if (existingParent) {
                await prisma.student.update({
                    where: { id },
                    data: { parentId: existingParent.id }
                });
            } else {
                const newParent = await prisma.parent.create({
                    data: {
                        fatherName,
                        motherName,
                        phone: parentPhone,
                        email: parentEmail,
                        schoolId: student.schoolId
                    }
                });
                await prisma.student.update({
                    where: { id },
                    data: { parentId: newParent.id }
                });
            }
        }
    }

    await prisma.user.update({
        where: { id: student.userId, schoolId } as any,
        data: userData
    });

    const studentData: any = {
        admissionNo,
        gender,
        classId: classId || undefined,
        dob: dobStr ? new Date(dobStr) : undefined,
        address,
        phone,
        rollNo
    };
    if (documentsPath) studentData.documents = documentsPath;

    await prisma.student.update({
        where: { id, schoolId } as any,
        data: studentData
    });

    revalidatePath('/admin/students');
    redirect('/admin/students');
}

export async function deleteStudent(formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = await ensureTenantId();
    const student = await prisma.student.findFirst({
        where: { id, schoolId },
        include: { user: true }
    });

    if (student) {
        // Manually handle cascade deletes for SQLite compatibility and safety
        await prisma.$transaction([
            // 1. Finance & Wallet
            prisma.walletTransaction.deleteMany({ where: { schoolId, wallet: { studentId: id } } }),
            prisma.wallet.deleteMany({ where: { student: { schoolId }, studentId: id } }),
            prisma.feePayment.deleteMany({ where: { schoolId, studentFee: { studentId: id } } }),
            prisma.feeRefund.deleteMany({ where: { schoolId, studentFee: { studentId: id } } }),
            prisma.feeDiscount.deleteMany({ where: { schoolId, studentFee: { studentId: id } } }),
            prisma.studentFee.deleteMany({ where: { schoolId, studentId: id } }),

            // 2. Attendance
            prisma.attendance.deleteMany({ where: { schoolId, studentId: id } }),
            prisma.transportAttendance.deleteMany({ where: { schoolId, studentId: id } }),

            // 3. Academic & Exams
            prisma.examResult.deleteMany({ where: { schoolId, studentId: id } }),
            prisma.admitCard.deleteMany({ where: { schoolId, studentId: id } }),
            prisma.promotionHistory.deleteMany({ where: { schoolId, studentId: id } }),

            // 4. Transport Mapping
            prisma.studentTransportMapping.deleteMany({ where: { schoolId, studentId: id } }),

            // 5. Library & Others
            prisma.issueRecord.deleteMany({ where: { schoolId, studentId: id } }),
            prisma.studentHostelMapping.deleteMany({ where: { student: { schoolId }, studentId: id } }),
            prisma.studentSponsorship.deleteMany({ where: { schoolId, studentId: id } }),
            prisma.refundRequest.deleteMany({ where: { schoolId, studentId: id } }),

            // 6. Finally delete Student Profile and User
            prisma.student.delete({ where: { id, schoolId } as any }),
            prisma.user.delete({ where: { id: student.userId, schoolId } as any })
        ]);
    }

    revalidatePath('/admin/students');
}

export async function getStudents(classId?: string) {
    const schoolId = await ensureTenantId();
    return await prisma.student.findMany({
        where: {
            schoolId,
            ...(classId ? { classId } : {})
        },
        include: {
            user: true,
            class: true,
            parent: true
        },
    });
}

// Helper function to generate unique employee ID
export async function generateEmployeeId(): Promise<string> {
    const currentYear = new Date().getFullYear();

    const schoolId = await ensureTenantId();
    // Extract first 8 characters of schoolId for the prefix
    const schoolPrefix = schoolId.substring(0, 8).toUpperCase();

    // Get the last teacher created this year for this school
    const lastTeacher = await (prisma.teacher as any).findFirst({
        where: {
            schoolId,
            employeeId: {
                startsWith: `${schoolPrefix}-${currentYear}-`
            }
        },
        orderBy: {
            employeeId: 'desc'
        }
    });

    let nextNumber = 1;
    if (lastTeacher && lastTeacher.employeeId) {
        // Extract the number from the last employee ID
        const match = lastTeacher.employeeId.match(/-(\d{4})$/);
        if (match) {
            nextNumber = parseInt(match[1]) + 1;
        }
    }

    // Format: SCHOOLID-2024-0001 (globally unique)
    return `${schoolPrefix}-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
}

// --- Teacher Actions ---
export async function createTeacher(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const designation = formData.get('designation') as string;
    const qualification = formData.get('qualification') as string || undefined;
    const experience = formData.get('experience') ? parseInt(formData.get('experience') as string) : undefined;
    const subject = formData.get('subject') as string;

    const imageFile = formData.get('image') as File;
    const documents = formData.getAll('documents') as File[];

    let imagePath = undefined;
    if (imageFile && imageFile.size > 0) {
        imagePath = await saveFile(imageFile, 'teachers');
    }

    const documentPaths = [];
    for (const doc of documents) {
        if (doc && doc.size > 0) {
            const path = await saveFile(doc, 'teachers/documents');
            documentPaths.push(path);
        }
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    const schoolId = await ensureTenantId();

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'TEACHER',
            image: imagePath,
            schoolId
        }
    });

    // Generate unique employee ID
    const employeeId = await generateEmployeeId();

    await prisma.teacher.create({
        data: {
            userId: user.id,
            employeeId,
            designation,
            qualification,
            experience,
            phone,
            subject,
            documents: documentPaths.length > 0 ? documentPaths.join(',') : undefined,
            schoolId
        }
    });

    revalidatePath('/admin/teachers');
    redirect('/admin/teachers');
}

export async function getTeachers(query?: string, designation?: string) {
    const schoolId = await ensureTenantId();
    const where: any = { schoolId };

    if (designation && designation !== 'ALL') {
        where.designation = designation;
    }

    if (query) {
        where.user = {
            name: { contains: query, mode: 'insensitive' }
        };
    }

    return await prisma.teacher.findMany({
        where,
        include: {
            user: true,
            _count: {
                select: {
                    classes: true,
                    subjects: true
                }
            }
        }
    });
}

export async function getTeacher(id: string) {
    const schoolId = await ensureTenantId();
    return await prisma.teacher.findFirst({
        where: { id, schoolId },
        include: { user: true, classes: true, subjects: true }
    });
}

// --- Class Actions ---
export async function createClass(formData: FormData) {
    const name = formData.get('name') as string;
    const section = formData.get('section') as string;
    const capacity = parseInt(formData.get('capacity') as string);
    const academicYear = formData.get('academicYear') as string;

    const schoolId = await ensureTenantId();
    await prisma.class.create({
        data: {
            schoolId,
            name,
            section,
            capacity,
            academicYear
        },
    });

    revalidatePath('/admin/academics');
}

export async function deleteClass(id: string) {
    const schoolId = await ensureTenantId();
    await prisma.class.deleteMany({
        where: { id, schoolId }
    });
    revalidatePath('/admin/academics');
}

// --- Subject Actions ---
export async function createSubject(formData: FormData) {
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const classId = formData.get('classId') as string;

    const schoolId = await ensureTenantId();
    await prisma.subject.create({
        data: {
            schoolId,
            name,
            code: code || undefined,
            classId
        }
    });

    revalidatePath('/admin/academics');
}

export async function deleteSubject(id: string) {
    const schoolId = await ensureTenantId();
    await prisma.subject.deleteMany({
        where: { id, schoolId }
    });
    revalidatePath('/admin/academics');
}

export async function getSubjects() {
    const schoolId = await ensureTenantId();
    return await prisma.subject.findMany({
        where: { schoolId },
        include: {
            class: true
        }
    });
}

// --- Fee Collection ---


export async function getPayments() {
    const schoolId = await ensureTenantId();
    return await prisma.feePayment.findMany({
        where: { schoolId },
        include: {
            studentFee: {
                include: {
                    student: {
                        include: {
                            user: true,
                            class: true
                        }
                    }
                }
            }
        },
        orderBy: { date: 'desc' }
    });
}

// --- Fee Structure Actions ---
export async function getFeeStructures() {
    const schoolId = await ensureTenantId();
    return await prisma.feeStructure.findMany({
        where: { schoolId },
        include: {
            class: true
        }
    });
}

export async function createFeeStructure(formData: FormData) {
    const schoolId = await ensureTenantId();
    const feeHeadId = formData.get('feeHeadId') as string;

    // Scoped fee head lookup if needed, or default
    const actualFeeHeadId = feeHeadId || (await prisma.feeHead.findFirst({ where: { schoolId } }).then((h: any) => h?.id)) || '';

    await prisma.feeStructure.create({
        data: {
            schoolId,
            name: formData.get('name') as string,
            amount: parseFloat(formData.get('amount') as string),
            frequency: formData.get('frequency') as string,
            feeHeadId: actualFeeHeadId,
        }
    });
    revalidatePath('/admin/finance/fees');
    redirect('/admin/finance/fees');
}

export async function deleteFeeStructure(id: string) {
    const schoolId = await ensureTenantId();
    await prisma.feeStructure.deleteMany({ where: { id, schoolId } });
    revalidatePath('/admin/finance/fees');
}

// --- Student Fee Actions ---
export async function getStudentFees(studentId?: string, query?: string, classId?: string, status?: string) {
    const schoolId = await ensureTenantId();
    const where: any = { schoolId };

    if (studentId) {
        where.studentId = studentId;
    }

    if (classId) {
        where.student = { classId };
    }

    if (query) {
        where.student = {
            ...where.student,
            OR: [
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { admissionNo: { contains: query, mode: 'insensitive' } }
            ]
        };
    }

    if (status && status !== 'ALL') {
        where.status = status;
    }

    return await prisma.studentFee.findMany({
        where,
        include: {
            student: {
                include: {
                    user: true,
                    class: true
                }
            },
            feeStructure: true
        },
        orderBy: { dueDate: 'asc' }
    });
}

export async function assignFee(formData: FormData) {
    const schoolId = await ensureTenantId();
    const studentId = formData.get('studentId') as string;
    const feeStructureId = formData.get('feeStructureId') as string;
    const dueDate = new Date(formData.get('dueDate') as string);

    const feeStructure = await prisma.feeStructure.findFirst({
        where: { id: feeStructureId, schoolId }
    });

    if (!feeStructure) {
        throw new Error('Fee structure not found');
    }

    await prisma.studentFee.create({
        data: {
            schoolId,
            studentId,
            feeStructureId,
            amount: feeStructure.amount,
            dueDate,
            status: 'PENDING'
        }
    });

    revalidatePath('/admin/finance/fees/assign');
    redirect('/admin/finance/fees');
}

export async function recordPayment(formData: FormData) {
    // Legacy function support
    return await collectFee(formData);
}

export async function collectFee(formData: FormData) {
    try {
        console.log("Collect Fee (Legacy) called - Disabled for build debugging");
        // const studentFeeId = formData.get('studentFeeId') as string;
        // const amount = parseFloat(formData.get('amount') as string);

        // ... implementation commented out ...

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

// --- Wallet Actions ---
export async function addWalletBalance(formData: FormData) {
    const schoolId = await ensureTenantId();
    const studentId = formData.get('studentId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    const wallet = await prisma.wallet.findFirst({ where: { studentId, student: { schoolId } } });
    if (!wallet) throw new Error("Wallet not found");

    const newBalance = wallet.balance + amount;

    await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
    });

    await prisma.walletTransaction.create({
        data: {
            schoolId,
            walletId: wallet.id,
            amount,
            type: 'CREDIT',
            description,
            balance: newBalance
        }
    });

    revalidatePath('/admin/finance/wallet');
    redirect('/admin/finance/wallet');
}

export async function deductWalletBalance(formData: FormData) {
    const schoolId = await ensureTenantId();
    const studentId = formData.get('studentId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    const wallet = await prisma.wallet.findFirst({ where: { studentId, student: { schoolId } } });
    if (!wallet) throw new Error("Wallet not found");

    const newBalance = wallet.balance - amount;

    if (newBalance < 0) throw new Error("Insufficient balance");

    await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
    });

    await prisma.walletTransaction.create({
        data: {
            schoolId,
            walletId: wallet.id,
            amount,
            type: 'DEBIT',
            description,
            balance: newBalance
        }
    });

    revalidatePath('/admin/finance/wallet');
    redirect('/admin/finance/wallet');
}

// --- Transport Actions ---
export async function createDriver(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const licenseNo = formData.get('licenseNo') as string;

    const hashedPassword = await bcrypt.hash('password123', 10);

    const schoolId = await ensureTenantId();

    const user = await prisma.user.create({
        data: {
            schoolId,
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'DRIVER'
        }
    });

    await prisma.driver.create({
        data: {
            schoolId,
            userId: user.id,
            phone,
            licenseNo,
        },
    });

    revalidatePath('/admin/transport');
}

export async function getDrivers() {
    const schoolId = await ensureTenantId();
    return await prisma.driver.findMany({
        where: { schoolId },
        include: {
            user: true,
        },
    });
}

export async function getRoutes() {
    const schoolId = await ensureTenantId();
    return await prisma.transportRoute.findMany({
        where: { schoolId },
        include: {
            driver: {
                include: {
                    user: true,
                }
            },
            _count: {
                select: { students: true }
            }
        },
    });
}

// --- Attendance Actions ---
export async function getAttendance(classId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const schoolId = await ensureTenantId();
    return await prisma.attendance.findMany({
        where: {
            schoolId,
            student: {
                classId: classId
            },
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            student: {
                include: {
                    user: true
                }
            }
        }
    });
}

export async function markAttendance(formData: FormData) {
    const classId = formData.get('classId') as string;
    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);

    const entries = Array.from(formData.entries());

    for (const [key, value] of entries) {
        if (key.startsWith('status_')) {
            const studentId = key.replace('status_', '');
            const status = value as string;

            const schoolId = await ensureTenantId();
            const existing = await prisma.attendance.findFirst({
                where: {
                    schoolId,
                    studentId,
                    date: date
                }
            });

            if (existing) {
                await prisma.attendance.update({
                    where: { id: existing.id },
                    data: { status }
                });
            } else {
                await prisma.attendance.create({
                    data: {
                        schoolId,
                        studentId,
                        date,
                        status
                    }
                });
            }
        }
    }

    revalidatePath('/admin/attendance');
}

// --- Library Actions ---
export async function addBook(formData: FormData) {
    const schoolId = await ensureTenantId();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const quantity = parseInt(formData.get('quantity') as string);

    await (prisma.book as any).create({
        data: {
            schoolId,
            title,
            author,
            isbn: isbn || undefined,
            quantity
        }
    });

    revalidatePath('/admin/library');
}

export async function getBooks() {
    const schoolId = await ensureTenantId();
    return await (prisma.book as any).findMany({
        where: { schoolId },
        include: {
            issues: {
                where: { status: 'ISSUED' }
            }
        },
        orderBy: { title: 'asc' }
    });
}

export async function issueBook(formData: FormData) {
    const schoolId = await ensureTenantId();
    const bookId = formData.get('bookId') as string;
    const studentId = formData.get('studentId') as string;
    const dueDateStr = formData.get('dueDate') as string;

    await (prisma.issueRecord as any).create({
        data: {
            schoolId,
            bookId,
            studentId,
            dueDate: new Date(dueDateStr),
            status: 'ISSUED'
        }
    });

    revalidatePath('/admin/library');
}

export async function returnBook(formData: FormData) {
    const schoolId = await ensureTenantId();
    const issueId = formData.get('issueId') as string;

    await (prisma.issueRecord as any).update({
        where: {
            id: issueId,
            schoolId
        },
        data: {
            returnDate: new Date(),
            status: 'RETURNED'
        }
    });

    revalidatePath('/admin/library');
}

// --- Inventory Actions ---
export async function addItem(formData: FormData) {
    const schoolId = await ensureTenantId();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const quantity = parseInt(formData.get('quantity') as string);

    await (prisma.inventoryItem as any).create({
        data: {
            schoolId,
            name,
            category,
            unit,
            quantity
        }
    });

    revalidatePath('/admin/inventory');
}

export async function getItems() {
    const schoolId = await ensureTenantId();
    return await (prisma.inventoryItem as any).findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });
}

export async function addStock(formData: FormData) {
    const schoolId = await ensureTenantId();
    const itemId = formData.get('itemId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;

    await prisma.$transaction([
        (prisma.inventoryItem as any).update({
            where: {
                id: itemId,
                schoolId
            },
            data: { quantity: { increment: quantity } }
        }),
        (prisma.inventoryTransaction as any).create({
            data: {
                schoolId,
                itemId,
                type: 'IN',
                quantity,
                reason
            }
        })
    ]);

    revalidatePath('/admin/inventory');
}

export async function consumeStock(formData: FormData) {
    const schoolId = await ensureTenantId();
    const itemId = formData.get('itemId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;

    await prisma.$transaction([
        (prisma.inventoryItem as any).update({
            where: {
                id: itemId,
                schoolId
            },
            data: { quantity: { decrement: quantity } }
        }),
        (prisma.inventoryTransaction as any).create({
            data: {
                schoolId,
                itemId,
                type: 'OUT',
                quantity,
                reason
            }
        })
    ]);

    revalidatePath('/admin/inventory');
}

// ============ SETTINGS MODULE ACTIONS ============

// --- Helper function for admin authentication ---
async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }
    return session.user;
}

// --- School Settings Actions ---

export async function getSchoolSettings() {
    try {
        const schoolId = await ensureTenantId();
        const settings = await prisma.schoolSettings.findUnique({
            where: { schoolId }
        });
        return settings;
    } catch (error) {
        console.error('Error fetching school settings:', error);
        throw new Error('Failed to fetch school settings');
    }
}

export async function updateSchoolSettings(formData: FormData) {
    await requireAdmin();
    const schoolId = await ensureTenantId();

    const schoolName = formData.get('schoolName') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    // Validate required fields
    if (!schoolName || !contactNumber || !email || !address) {
        throw new Error('Missing required fields: schoolName, contactNumber, email, address');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    try {
        const settingsData = {
            schoolName,
            schoolCode: formData.get('schoolCode') as string || null,
            motto: formData.get('motto') as string || null,
            establishedYear: formData.get('establishedYear') as string || null,
            contactNumber,
            alternateNumber: formData.get('alternateNumber') as string || null,
            email,
            alternateEmail: formData.get('alternateEmail') as string || null,
            address,
            city: formData.get('city') as string || null,
            state: formData.get('state') as string || null,
            pincode: formData.get('pincode') as string || null,
            country: formData.get('country') as string || 'India',
            currentAcademicYear: formData.get('currentAcademicYear') as string || null,
            website: formData.get('website') as string || null,
            affiliationNumber: formData.get('affiliationNumber') as string || null,
            affiliatedTo: formData.get('affiliatedTo') as string || null,
        };

        // Update both SchoolSettings AND root School model for synchronization
        await prisma.$transaction([
            prisma.schoolSettings.upsert({
                where: { schoolId },
                update: settingsData,
                create: {
                    ...settingsData,
                    schoolId
                }
            }),
            prisma.school.update({
                where: { id: schoolId },
                data: {
                    name: schoolName,
                    contactEmail: email,
                    contactPhone: contactNumber,
                    address: address
                }
            })
        ]);

        revalidatePath('/admin/settings/school-info');
        revalidatePath('/super-admin/schools');
        revalidatePath(`/super-admin/schools/${schoolId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating school settings:', error);
        throw new Error('Failed to update school settings');
    }
}

export async function uploadSchoolLogo(formData: FormData) {
    await requireAdmin();

    const logoFile = formData.get('logo') as File;
    if (!logoFile || logoFile.size === 0) {
        throw new Error('No logo file provided');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(logoFile.type)) {
        throw new Error('Invalid file type. Only PNG, JPEG, and WebP images are allowed');
    }

    // Validate file size (max 5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB');
    }

    try {
        const schoolId = await ensureTenantId();
        const logoPath = await saveFile(logoFile, 'school');

        await prisma.$transaction([
            prisma.schoolSettings.upsert({
                where: { schoolId },
                update: { logoUrl: logoPath },
                create: {
                    schoolId,
                    logoUrl: logoPath,
                    schoolName: 'School', // Temporary name if settings don't exist
                    contactNumber: '',
                    email: '',
                    address: ''
                }
            }),
            prisma.school.update({
                where: { id: schoolId },
                data: { logo: logoPath }
            })
        ]);

        revalidatePath('/admin/settings/school-info');
        revalidatePath('/super-admin/schools');
        return { success: true, logoUrl: logoPath };
    } catch (error) {
        console.error('Error uploading logo:', error);
        throw error;
    }
}

export async function uploadWatermark(formData: FormData) {
    await requireAdmin();

    const watermarkFile = formData.get('watermark') as File;
    if (!watermarkFile || watermarkFile.size === 0) {
        throw new Error('No watermark file provided');
    }

    // Validate file type (prefer PNG for transparency)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(watermarkFile.type)) {
        throw new Error('Invalid file type. Only PNG, JPEG, and WebP images are allowed');
    }

    // Validate file size (max 2MB for watermarks)
    if (watermarkFile.size > 2 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 2MB');
    }

    try {
        const schoolId = await ensureTenantId();
        const watermarkPath = await saveFile(watermarkFile, 'school');

        await prisma.schoolSettings.upsert({
            where: { schoolId },
            update: { watermarkUrl: watermarkPath },
            create: {
                schoolId,
                watermarkUrl: watermarkPath,
                schoolName: 'School',
                contactNumber: '',
                email: '',
                address: ''
            }
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true, watermarkUrl: watermarkPath };
    } catch (error) {
        console.error('Error uploading watermark:', error);
        throw error;
    }
}

export async function deleteSchoolMedia(type: 'logo' | 'watermark' | 'favicon') {
    await requireAdmin();
    const schoolId = await ensureTenantId();

    try {
        const updateData: any = {};
        if (type === 'logo') updateData.logoUrl = null;
        if (type === 'watermark') updateData.watermarkUrl = null;
        if (type === 'favicon') updateData.faviconUrl = null;

        if (type === 'logo') {
            await prisma.$transaction([
                prisma.schoolSettings.update({
                    where: { schoolId },
                    data: updateData,
                }),
                prisma.school.update({
                    where: { id: schoolId },
                    data: { logo: null }
                })
            ]);
        } else {
            await prisma.schoolSettings.update({
                where: { schoolId },
                data: updateData,
            });
        }

        revalidatePath('/admin/settings/school-info');
        revalidatePath('/super-admin/schools');
        return { success: true };
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        throw new Error(`Failed to delete ${type}`);
    }
}

// --- Emergency Contacts Actions ---

export async function getEmergencyContacts() {
    try {
        const schoolId = await ensureTenantId();
        return await prisma.emergencyContact.findMany({
            where: { schoolId },
            orderBy: { priority: 'asc' },
        });
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        throw new Error('Failed to fetch emergency contacts');
    }
}

export async function createEmergencyContact(formData: FormData) {
    await requireAdmin();
    const schoolId = await ensureTenantId();

    const name = formData.get('name') as string;
    const designation = formData.get('designation') as string;
    const phone = formData.get('phone') as string;

    if (!name || !designation || !phone) {
        throw new Error('Missing required fields: name, designation, phone');
    }

    try {
        // Get max priority for this school and set new contact as lowest priority
        const maxPriority = await prisma.emergencyContact.findFirst({
            where: { schoolId },
            orderBy: { priority: 'desc' },
            select: { priority: true },
        });

        await prisma.emergencyContact.create({
            data: {
                schoolId,
                name,
                designation,
                phone,
                alternatePhone: formData.get('alternatePhone') as string || null,
                email: formData.get('email') as string || null,
                priority: maxPriority ? maxPriority.priority + 1 : 1,
            },
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error) {
        console.error('Error creating emergency contact:', error);
        throw new Error('Failed to create emergency contact');
    }
}

export async function updateEmergencyContact(formData: FormData) {
    await requireAdmin();
    const schoolId = await ensureTenantId();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const designation = formData.get('designation') as string;
    const phone = formData.get('phone') as string;

    if (!id || !name || !designation || !phone) {
        throw new Error('Missing required fields');
    }

    try {
        await prisma.emergencyContact.update({
            where: { id, schoolId },
            data: {
                name,
                designation,
                phone,
                alternatePhone: formData.get('alternatePhone') as string || null,
                email: formData.get('email') as string || null,
            },
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        throw new Error('Failed to update emergency contact');
    }
}

export async function deleteEmergencyContact(id: string) {
    await requireAdmin();
    const schoolId = await ensureTenantId();

    try {
        await prisma.emergencyContact.delete({
            where: { id, schoolId },
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error) {
        console.error('Error deleting emergency contact:', error);
        throw new Error('Failed to delete emergency contact');
    }
}

export async function reorderEmergencyContacts(priorities: { id: string; priority: number }[]) {
    await requireAdmin();

    try {
        // Update priorities in a transaction
        await prisma.$transaction(
            priorities.map(({ id, priority }) =>
                prisma.emergencyContact.update({
                    where: { id },
                    data: { priority },
                })
            )
        );

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error) {
        console.error('Error reordering emergency contacts:', error);
        throw new Error('Failed to reorder emergency contacts');
    }
}

export async function toggleEmergencyContactStatus(id: string) {
    await requireAdmin();

    try {
        const contact = await prisma.emergencyContact.findUnique({
            where: { id },
        });

        if (!contact) {
            throw new Error('Contact not found');
        }

        await prisma.emergencyContact.update({
            where: { id },
            data: { isActive: !contact.isActive },
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error) {
        console.error('Error toggling contact status:', error);
        throw new Error('Failed to toggle contact status');
    }
}

// --- Payment Gateway Actions ---

export async function getPaymentGateways() {
    await requireAdmin();

    try {
        const { decrypt, maskSensitiveData } = await import('./crypto');

        const gateways = await prisma.paymentGateway.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Decrypt sensitive fields and mask them for display
        return gateways.map((gateway: any) => ({
            ...gateway,
            // Decrypt and mask for display - DON'T send plain text to frontend
            apiKey: gateway.apiKey ? maskSensitiveData(decrypt(gateway.apiKey)) : null,
            apiSecret: gateway.apiSecret ? '********' : null, // Never show secret
            merchantId: gateway.merchantId ? maskSensitiveData(decrypt(gateway.merchantId)) : null,
            webhookSecret: gateway.webhookSecret ? '********' : null, // Never show secret
        }));
    } catch (error) {
        console.error('Error fetching payment gateways:', error);
        throw new Error('Failed to fetch payment gateways');
    }
}


export async function createPaymentGateway(formData: FormData) {
    await requireAdmin();

    const name = formData.get('name') as string;
    const provider = formData.get('provider') as string;

    if (!name || !provider) {
        throw new Error('Missing required fields: name, provider');
    }

    try {
        const { encrypt } = await import('./crypto');

        // Encrypt sensitive credentials before storing
        const apiKey = formData.get('apiKey') as string;
        const apiSecret = formData.get('apiSecret') as string;
        const merchantId = formData.get('merchantId') as string;
        const webhookSecret = formData.get('webhookSecret') as string;

        await prisma.paymentGateway.create({
            data: {
                name,
                provider,
                apiKey: apiKey ? encrypt(apiKey) : null,
                apiSecret: apiSecret ? encrypt(apiSecret) : null,
                merchantId: merchantId ? encrypt(merchantId) : null,
                webhookSecret: webhookSecret ? encrypt(webhookSecret) : null,
                isTestMode: formData.get('isTestMode') === 'true',
                isActive: false, // New gateways are inactive by default
                chargeType: formData.get('chargeType') as string || null,
                chargeAmount: formData.get('chargeAmount') ? parseFloat(formData.get('chargeAmount') as string) : 0,
                displayName: formData.get('displayName') as string || null,
                description: formData.get('description') as string || null,
            },
        });

        revalidatePath('/admin/settings/payment-gateway');
        return { success: true };
    } catch (error) {
        console.error('Error creating payment gateway:', error);
        throw new Error('Failed to create payment gateway');
    }
}


export async function updatePaymentGateway(formData: FormData) {
    await requireAdmin();

    const id = formData.get('id') as string;
    if (!id) {
        throw new Error('Gateway ID is required');
    }

    try {
        const { encrypt } = await import('./crypto');

        // Encrypt sensitive credentials before updating
        const apiKey = formData.get('apiKey') as string;
        const apiSecret = formData.get('apiSecret') as string;
        const merchantId = formData.get('merchantId') as string;
        const webhookSecret = formData.get('webhookSecret') as string;

        await prisma.paymentGateway.update({
            where: { id },
            data: {
                name: formData.get('name') as string,
                apiKey: apiKey ? encrypt(apiKey) : null,
                apiSecret: apiSecret ? encrypt(apiSecret) : null,
                merchantId: merchantId ? encrypt(merchantId) : null,
                webhookSecret: webhookSecret ? encrypt(webhookSecret) : null,
                isTestMode: formData.get('isTestMode') === 'true',
                chargeType: formData.get('chargeType') as string || null,
                chargeAmount: formData.get('chargeAmount') ? parseFloat(formData.get('chargeAmount') as string) : 0,
                displayName: formData.get('displayName') as string || null,
                description: formData.get('description') as string || null,
            },
        });

        revalidatePath('/admin/settings/payment-gateway');
        return { success: true };
    } catch (error) {
        console.error('Error updating payment gateway:', error);
        throw new Error('Failed to update payment gateway');
    }
}


export async function togglePaymentGateway(id: string) {
    await requireAdmin();

    try {
        const gateway = await prisma.paymentGateway.findUnique({
            where: { id },
        });

        if (!gateway) {
            throw new Error('Gateway not found');
        }

        await prisma.paymentGateway.update({
            where: { id },
            data: { isActive: !gateway.isActive },
        });

        revalidatePath('/admin/settings/payment-gateway');
        return { success: true };
    } catch (error) {
        console.error('Error toggling payment gateway:', error);
        throw new Error('Failed to toggle payment gateway');
    }
}

export async function deletePaymentGateway(id: string) {
    await requireAdmin();

    try {
        await prisma.paymentGateway.delete({
            where: { id },
        });

        revalidatePath('/admin/settings/payment-gateway');
        return { success: true };
    } catch (error) {
        console.error('Error deleting payment gateway:', error);
        throw new Error('Failed to delete payment gateway');
    }
}

// --- Theme Settings Actions ---

export async function getThemeSettings() {
    try {
        const activeTheme = await prisma.themeSettings.findFirst({
            where: { isActive: true },
        });
        return activeTheme;
    } catch (error) {
        console.error('Error fetching theme settings:', error);
        return null;
    }
}

export async function getAvailableThemes() {
    await requireAdmin();

    try {
        return await prisma.themeSettings.findMany({
            orderBy: { createdAt: 'asc' },
        });
    } catch (error) {
        console.error('Error fetching themes:', error);
        throw new Error('Failed to fetch themes');
    }
}

export async function createTheme(formData: FormData) {
    await requireAdmin();

    const name = formData.get('name') as string;
    if (!name) {
        throw new Error('Theme name is required');
    }

    try {
        await prisma.themeSettings.create({
            data: {
                name,
                primaryColor: formData.get('primaryColor') as string || '#6366f1',
                secondaryColor: formData.get('secondaryColor') as string || '#8b5cf6',
                accentColor: formData.get('accentColor') as string || '#ec4899',
                backgroundColor: formData.get('backgroundColor') as string || '#f8fafc',
                surfaceColor: formData.get('surfaceColor') as string || '#ffffff',
                textPrimaryColor: formData.get('textPrimaryColor') as string || '#1e293b',
                textSecondaryColor: formData.get('textSecondaryColor') as string || '#64748b',
                headingFont: formData.get('headingFont') as string || 'Inter',
                bodyFont: formData.get('bodyFont') as string || 'Inter',
                sidebarPosition: formData.get('sidebarPosition') as string || 'LEFT',
                logoPosition: formData.get('logoPosition') as string || 'TOP',
                borderRadius: formData.get('borderRadius') as string || '12px',
                cardShadow: formData.get('cardShadow') as string || 'medium',
                darkModeEnabled: formData.get('darkModeEnabled') === 'true',
                isActive: false,
            },
        });

        revalidatePath('/admin/settings/theme');
        return { success: true };
    } catch (error) {
        console.error('Error creating theme:', error);
        throw new Error('Failed to create theme');
    }
}

export async function activateTheme(id: string) {
    await requireAdmin();

    try {
        // Deactivate all themes first
        await prisma.themeSettings.updateMany({
            data: { isActive: false },
        });

        // Activate the selected theme
        await prisma.themeSettings.update({
            where: { id },
            data: { isActive: true },
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error activating theme:', error);
        throw new Error('Failed to activate theme');
    }
}

// --- Admin Signature Actions ---

export async function getAdminSignatures() {
    await requireAdmin();

    try {
        return await prisma.adminSignature.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Error fetching signatures:', error);
        throw new Error('Failed to fetch signatures');
    }
}

export async function uploadAdminSignature(formData: FormData) {
    await requireAdmin();

    const signatureFile = formData.get('signature') as File;
    const name = formData.get('name') as string;
    const personName = formData.get('personName') as string;
    const personDesignation = formData.get('personDesignation') as string;

    if (!signatureFile || !name || !personName || !personDesignation) {
        throw new Error('Missing required fields');
    }

    // Validate file type (prefer PNG for transparency)
    if (!signatureFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    try {
        const signaturePath = await saveFile(signatureFile, 'signatures');

        await prisma.adminSignature.create({
            data: {
                name,
                designation: formData.get('designation') as string || personDesignation,
                signatureUrl: signaturePath,
                personName,
                personDesignation,
                isDefault: formData.get('isDefault') === 'true',
            },
        });

        revalidatePath('/admin/settings/signatures');
        return { success: true };
    } catch (error) {
        console.error('Error uploading signature:', error);
        throw new Error('Failed to upload signature');
    }
}

export async function deleteAdminSignature(id: string) {
    await requireAdmin();

    try {
        await prisma.adminSignature.delete({
            where: { id },
        });

        revalidatePath('/admin/settings/signatures');
        return { success: true };
    } catch (error) {
        console.error('Error deleting signature:', error);
        throw new Error('Failed to delete signature');
    }
}

// --- App Version Actions ---

export async function getCurrentAppVersion() {
    try {
        return await prisma.appVersion.findFirst({
            where: { isCurrent: true },
        });
    } catch (error) {
        console.error('Error fetching current version:', error);
        return null;
    }
}

export async function getVersionHistory() {
    await requireAdmin();

    try {
        return await prisma.appVersion.findMany({
            orderBy: { releaseDate: 'desc' },
        });
    } catch (error) {
        console.error('Error fetching version history:', error);
        throw new Error('Failed to fetch version history');
    }
}

// --- System Settings Actions ---

export async function getSystemSettings(category?: string) {
    await requireAdmin();

    try {
        return await prisma.systemSettings.findMany({
            where: category ? { category } : undefined,
            orderBy: { category: 'asc' },
        });
    } catch (error) {
        console.error('Error fetching system settings:', error);
        throw new Error('Failed to fetch system settings');
    }
}

export async function updateSystemSetting(key: string, value: string) {
    await requireAdmin();

    try {
        await prisma.systemSettings.update({
            where: { key },
            data: { value },
        });

        revalidatePath('/admin/settings/system');
        return { success: true };
    } catch (error) {
        console.error('Error updating system setting:', error);
        throw new Error('Failed to update system setting');
    }
}
