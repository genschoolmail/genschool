'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

// Helper to prevent indefinite hangs in server actions
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

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
                subscription: {
                    include: {
                        plan: true
                    }
                }
            }
        });
        return schools;
    } catch (error) {
        console.error("Error fetching all schools:", error);
        return [];
    }
}

// Status & Impersonation
export async function updateSchoolStatus(schoolId: string, status: string) {
    try {
        await withTimeout((async () => {
            await prisma.school.update({
                where: { id: schoolId },
                data: { status }
            });
        })());
        revalidatePath('/super-admin/schools');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating school status:", error);
        throw new Error(error.message);
    }
}

export async function impersonateSchoolAdmin(schoolId: string) {
    try {
        await withTimeout((async () => {
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
        })());
        return { success: true };
    } catch (error: any) {
        console.error('Impersonation error:', error);
        throw error;
    }
}

// --- Settings & Plans ---

export async function getSystemSettings() {
    try {
        await ensureSuperAdmin();
        const dbSettings = await prisma.systemSettings.findMany({
            orderBy: { category: 'asc' }
        });

        // Define expected structure with defaults
        const defaultSettings = [
            // SMTP Settings
            { key: 'SMTP_HOST', value: '', type: 'TEXT', category: 'SMTP', description: 'SMTP server hostname' },
            { key: 'SMTP_PORT', value: '465', type: 'NUMBER', category: 'SMTP', description: 'SMTP port number' },
            { key: 'SMTP_USER', value: '', type: 'TEXT', category: 'SMTP', description: 'SMTP username' },
            { key: 'SMTP_PASS', value: '', type: 'PASSWORD', category: 'SMTP', description: 'SMTP password' },
            { key: 'SMTP_FROM', value: '', type: 'TEXT', category: 'SMTP', description: 'Default from email (e.g. "Name" <email@domain.com>)' },

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

        // Merge DB values into defaults
        const merged = defaultSettings.map(def => {
            const dbS = dbSettings.find(s => s.key === def.key);
            return dbS ? {
                ...def,
                value: dbS.value,
                description: dbS.description || def.description,
                type: dbS.type || def.type
            } : def;
        });

        // Add any settings in DB that aren't in defaults
        const existingKeys = new Set(defaultSettings.map(d => d.key));
        const extras = dbSettings
            .filter(s => !existingKeys.has(s.key))
            .map(s => ({
                key: s.key,
                value: s.value,
                type: s.type,
                category: s.category,
                description: s.description
            }));

        return [...merged, ...extras];
    } catch (error) {
        console.error("Error fetching system settings:", error);
        return [];
    }
}

export async function updateSystemSettings(formData: FormData) {
    try {
        await ensureSuperAdmin();
        const settings = Object.fromEntries(formData);

        // Process all entries in parallel
        await Promise.all(
            Object.entries(settings).map(async ([key, value]) => {
                if (key.startsWith('$')) return; // Skip internal fields

                return prisma.systemSettings.upsert({
                    where: { key },
                    update: {
                        value: String(value),
                        updatedAt: new Date()
                    },
                    create: {
                        key,
                        value: String(value),
                        type: key.toLowerCase().includes('password') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('pass') ? 'PASSWORD' : 'TEXT',
                        category: key.split('_')[0] || 'GENERAL',
                        description: `Platform setting for ${key}`
                    }
                });
            })
        );

        revalidatePath('/super-admin/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating system settings:", error);
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
