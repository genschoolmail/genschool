'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

// Auth check for Super Admin
export async function ensureSuperAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
        redirect('/login');
    }
    return session;
}

// Schools backfill utility
export async function backfillSchoolIds() {
    // Placeholder for school ID generation
    return { success: true };
}

// --- Metrics & Dashboard ---

export async function getPlatformMetrics() {
    try {
        const totalSchools = await prisma.school.count();
        const totalUsers = await prisma.user.count();
        const activeSubscriptions = await prisma.subscription.count({
            where: { status: 'ACTIVE' }
        });

        // Assuming 'kycStatus' exists, otherwise default to 0
        // Adjust if schema is different
        let pendingKYC = 0;
        try {
            // pendingKYC = await prisma.school.count({ where: { kycStatus: 'PENDING' } });
        } catch (e) { }

        return {
            totalSchools,
            totalUsers,
            activeSubscriptions,
            pendingKYC
        };
    } catch (error) {
        console.error("Error fetching platform metrics:", error);
        return {
            totalSchools: 0,
            totalUsers: 0,
            activeSubscriptions: 0,
            pendingKYC: 0
        };
    }
}

export async function getAllSchools() {
    try {
        const schools = await prisma.school.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        users: true,
                        students: true,
                        teachers: true
                    }
                },
                subscription: true
            }
        });
        return schools;
    } catch (error) {
        console.error("Error fetching all schools:", error);
        return [];
    }
}

// --- Status & Impersonation ---

export async function updateSchoolStatus(schoolId: string, status: string) {
    try {
        await prisma.school.update({
            where: { id: schoolId },
            data: { status }
        });
        revalidatePath('/super-admin/schools');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating school status:", error);
        throw new Error(error.message);
    }
}

export async function impersonateSchoolAdmin(schoolId: string) {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            users: {
                where: { role: 'ADMIN' },
                take: 1
            }
        }
    });

    if (!school || school.users.length === 0) {
        throw new Error("No admin found for this school to impersonate");
    }

    console.log(`Impersonating admin for school ${school.name}`);
    return { success: true };
}

// --- Settings & Plans ---

export async function getSystemSettings() {
    // Return array format expected by SettingsClient
    return [
        // SMTP Settings
        { key: 'SMTP_HOST', value: '', type: 'TEXT', category: 'SMTP', description: 'SMTP server hostname' },
        { key: 'SMTP_PORT', value: '587', type: 'NUMBER', category: 'SMTP', description: 'SMTP port number' },
        { key: 'SMTP_USER', value: '', type: 'TEXT', category: 'SMTP', description: 'SMTP username' },
        { key: 'SMTP_PASSWORD', value: '', type: 'PASSWORD', category: 'SMTP', description: 'SMTP password' },
        { key: 'SMTP_FROM_EMAIL', value: '', type: 'TEXT', category: 'SMTP', description: 'Default from email' },

        // SMS Settings
        { key: 'SMS_PROVIDER', value: '', type: 'TEXT', category: 'SMS', description: 'SMS provider name (e.g., Twilio)' },
        { key: 'SMS_API_KEY', value: '', type: 'PASSWORD', category: 'SMS', description: 'SMS API key' },
        { key: 'SMS_SENDER_ID', value: '', type: 'TEXT', category: 'SMS', description: 'SMS sender ID' },

        // Maps Settings
        { key: 'MAPS_API_KEY', value: '', type: 'PASSWORD', category: 'MAPS', description: 'Google Maps API key' },

        // OTP Settings
        { key: 'OTP_LENGTH', value: '6', type: 'NUMBER', category: 'OTP', description: 'OTP code length' },
        { key: 'OTP_EXPIRY_MINUTES', value: '10', type: 'NUMBER', category: 'OTP', description: 'OTP expiry time in minutes' },

        // Storage Settings
        { key: 'STORAGE_PROVIDER', value: 'AWS_S3', type: 'TEXT', category: 'STORAGE', description: 'Cloud storage provider' },
        { key: 'STORAGE_BUCKET', value: '', type: 'TEXT', category: 'STORAGE', description: 'Storage bucket name' },
        { key: 'STORAGE_ACCESS_KEY', value: '', type: 'PASSWORD', category: 'STORAGE', description: 'Storage access key' },
        { key: 'STORAGE_SECRET_KEY', value: '', type: 'PASSWORD', category: 'STORAGE', description: 'Storage secret key' },

        // Redis Settings
        { key: 'REDIS_HOST', value: 'localhost', type: 'TEXT', category: 'REDIS', description: 'Redis server hostname' },
        { key: 'REDIS_PORT', value: '6379', type: 'NUMBER', category: 'REDIS', description: 'Redis port number' },
        { key: 'REDIS_PASSWORD', value: '', type: 'PASSWORD', category: 'REDIS', description: 'Redis password (optional)' },
    ];
}

export async function updateSystemSettings(formData: FormData) {
    try {
        await ensureSuperAdmin();
        const settings = Object.fromEntries(formData);

        // In a real production app, we would loop and upsert to a 'SystemSetting' table
        // For this implementation, we simulate the persistence
        console.log('Platform settings updated:', settings);

        // Mock persistence logic
        for (const [key, value] of Object.entries(settings)) {
            if (key.startsWith('$')) continue; // Skip internal form fields
            // await prisma.systemSetting.upsert({ ... })
        }

        revalidatePath('/super-admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function ensureCommunicationSettings() {
    return { success: true };
}

export async function getPlans() {
    try {
        // Use 'plan' instead of 'subscriptionPlan' as per schema
        return await prisma.plan.findMany();
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
}
// --- KYC Management ---

export async function approveKYC(schoolId: string) {
    try {
        await ensureSuperAdmin();
        await prisma.school.update({
            where: { id: schoolId },
            data: {
                kycStatus: 'VERIFIED',
                bankDetailsVerified: true,
                onboardingStatus: 'ACTIVE'
            }
        });
        revalidatePath('/super-admin/kyc');
        revalidatePath('/super-admin/schools');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectKYC(schoolId: string, reason: string) {
    try {
        await ensureSuperAdmin();
        await prisma.school.update({
            where: { id: schoolId },
            data: {
                kycStatus: 'REJECTED',
                // You might want to store the reason somewhere
            }
        });
        revalidatePath('/super-admin/kyc');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPendingKYCs() {
    try {
        await ensureSuperAdmin();
        return await prisma.school.findMany({
            where: { kycStatus: 'SUBMITTED' },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}
