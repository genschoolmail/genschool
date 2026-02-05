'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function deleteSchool(schoolId: string) {
    try {
        await prisma.school.delete({
            where: { id: schoolId }
        });

        revalidatePath('/super-admin/schools');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting school:", error);
        return { success: false, error: error.message };
    }
}

export async function getSchoolDetails(schoolId: string) {
    try {
        return await prisma.school.findUnique({
            where: { id: schoolId },
            include: { subscription: true }
        });
    } catch (e) {
        return null;
    }
}

export async function getSchoolUsers(schoolId: string) {
    try {
        return await prisma.user.findMany({
            where: { schoolId }
        });
    } catch (e) {
        return [];
    }
}

export async function updateSchool(schoolId: string, data: any) {
    try {
        await prisma.school.update({
            where: { id: schoolId },
            data
        });
        revalidatePath(`/super-admin/schools/${schoolId}`);
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function addAdminToSchool(schoolId: string, data: any) {
    // Placeholder logic
    return { success: true };
}

export async function createSchoolWithAdmin(formData: FormData) {
    try {
        const bcrypt = require('bcryptjs');

        // Generate unique school ID
        const schoolCount = await prisma.school.count();
        const schoolId = `SCH-${String(schoolCount + 1).padStart(3, '0')}`;

        // Extract school data - matching form field names
        const schoolData = {
            schoolId: schoolId, // Auto-generated human-readable ID
            name: formData.get('name') as string,
            subdomain: formData.get('subdomain') as string,
            contactEmail: formData.get('contactEmail') as string,
            contactPhone: formData.get('contactPhone') as string || null,
            address: formData.get('address') as string || null,
            status: 'ACTIVE',
            kycStatus: 'PENDING'
        };

        // Extract admin data
        const adminData = {
            name: formData.get('adminName') as string,
            email: formData.get('adminEmail') as string,
            password: formData.get('adminPassword') as string,
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Get plan ID
        const planId = formData.get('planId') as string;

        // Create school with admin and subscription in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create school
            const school = await tx.school.create({
                data: schoolData
            });

            // 2. Create admin user
            const admin = await tx.user.create({
                data: {
                    name: adminData.name,
                    email: adminData.email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    schoolId: school.id
                }
            });

            // 3. Create subscription if planId provided
            if (planId) {
                const plan = await tx.plan.findUnique({
                    where: { id: planId }
                });

                if (plan) {
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + (plan.billingCycle === 'YEARLY' ? 12 : 1));

                    await tx.subscription.create({
                        data: {
                            schoolId: school.id,
                            planId: plan.id,
                            status: 'TRIAL',
                            endDate: endDate
                        }
                    });
                }
            }

            return school;
        });

        revalidatePath('/super-admin/schools');
        return { success: true, schoolId: result.id };
    } catch (error: any) {
        console.error('Error creating school:', error);
        return { success: false, error: error.message };
    }
}
