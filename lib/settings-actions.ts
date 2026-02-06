'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { appendFileSync } from 'fs';
import { join } from 'path';

const DEBUG_LOG = join(process.cwd(), 'public', 'uploads', 'upload_debug.log');

function logAction(message: string) {
    try {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [Action] ${message}\n`;
        appendFileSync(DEBUG_LOG, logLine);
    } catch (e) {
        console.error('Action logging failed:', e);
    }
    console.log(`[CRITICAL_LOG] ${message}`);
}

// Get current school information
export async function getCurrentSchoolInfo() {
    try {
        const schoolId = await getTenantId();

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                id: true,
                schoolId: true,
                name: true,
                subdomain: true,
                customDomain: true,
                logo: true,
                banner: true,
                themeColor: true,
                contactEmail: true,
                contactPhone: true,
                address: true,
                status: true,
                kycStatus: true,
                onboardingStatus: true,
                subMerchantId: true,
                commissionPercentage: true,
                bankDetailsVerified: true,
                bankDetails: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return school;
    } catch (error) {
        console.error('Error fetching school info:', error);
        return null;
    }
}

// Update school information
export async function updateSchoolInfo(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        const updateData: any = {
            name: formData.get('name') as string,
            contactEmail: formData.get('contactEmail') as string,
            contactPhone: formData.get('contactPhone') as string || null,
            address: formData.get('address') as string || null,
        };

        const logo = formData.get('logo') as string;
        const banner = formData.get('banner') as string;

        if (logo) updateData.logo = logo;
        if (banner) updateData.banner = banner;

        await prisma.school.update({
            where: { id: schoolId },
            data: updateData
        });

        // Sync to schoolSettings for systems that rely on it (like ID cards)
        await prisma.schoolSettings.upsert({
            where: { schoolId },
            update: { schoolName: updateData.name },
            create: {
                schoolId,
                schoolName: updateData.name,
                contactNumber: updateData.contactPhone || 'N/A',
                email: updateData.contactEmail,
                address: updateData.address || 'N/A'
            }
        });

        revalidatePath('/admin/settings/school-info');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get payment gateway configurations
export async function getPaymentGateways() {
    try {
        const schoolId = await getTenantId();

        const gateways = await prisma.paymentGateway.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });

        return gateways;
    } catch (error) {
        return [];
    }
}

// Get admin signatures
export async function getAdminSignatures() {
    try {
        const schoolId = await getTenantId();

        const signatures = await prisma.adminSignature.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });

        return signatures;
    } catch (error) {
        return [];
    }
}

// Get promotion rules
export async function getPromotionRules() {
    try {
        const schoolId = await getTenantId();

        const rules = await prisma.promotionRule.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });

        return rules.length > 0 ? rules[0] : null;
    } catch (error) {
        return null;
    }
}

// Get school settings
export async function getSchoolSettingsData() {
    try {
        const schoolId = await getTenantId();

        const settings = await prisma.schoolSettings.findUnique({
            where: { schoolId }
        });

        return settings;
    } catch (error) {
        return null;
    }
}

// Get current user profile
export async function getCurrentUserProfile() {
    try {
        const schoolId = await getTenantId();

        // For now, return the first admin user
        const user = await prisma.user.findFirst({
            where: {
                schoolId,
                role: 'ADMIN'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                createdAt: true,
            }
        });

        return user;
    } catch (error) {
        return null;
    }
}

// Update user profile
export async function updateUserProfile(userId: string, formData: FormData) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string || null,
            }
        });

        revalidatePath('/admin/settings/profile');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get KYC status and documents
export async function getKYCStatus() {
    try {
        const schoolId = await getTenantId();

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                kycStatus: true,
                bankDetailsVerified: true,
                bankDetails: true,
                onboardingStatus: true,
            }
        });

        return school;
    } catch (error) {
        return null;
    }
}

// Get marketplace/settlement information
export async function getMarketplaceSettings() {
    try {
        const schoolId = await getTenantId();

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                subMerchantId: true,
                commissionPercentage: true,
                bankDetailsVerified: true,
                bankDetails: true,
            }
        });

        return school;
    } catch (error) {
        return null;
    }
}
// Submit KYC documents
export async function submitKYC(formData: FormData) {
    try {
        const schoolId = await getTenantId();
        const registrationCertificate = formData.get('registrationCertificate') as File;
        const bankProof = formData.get('bankProof') as File;

        if (!registrationCertificate || !bankProof) {
            return { success: false, error: 'Registration Certificate and Bank Proof are required' };
        }

        // Import saveFile dynamically to avoid circular dependencies if any
        const { saveFile } = await import('./upload');

        const certUrl = await saveFile(registrationCertificate, `kyc/${schoolId}/registration`);
        const bankUrl = await saveFile(bankProof, `kyc/${schoolId}/bank`);

        await prisma.school.update({
            where: { id: schoolId },
            data: {
                kycStatus: 'SUBMITTED',
                // For simplicity, we can store these URLs in a JSON field if available, 
                // or just log them. Based on schema, we have `bankDetails`.
                // Let's store a summary in bankDetails or similar if needed.
                // For now, just focus on the status change.
            }
        });

        revalidatePath('/admin/settings/kyc');
        return { success: true };
    } catch (error: any) {
        console.error('KYC Submission Error:', error);
        return { success: false, error: error.message };
    }
}
// Upload school logo
export async function uploadSchoolLogo(formData: FormData) {
    logAction('Logo upload started');
    try {
        const schoolId = await getTenantId();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            logAction('No file or empty file provided');
            return { success: false, error: 'No file provided' };
        }

        logAction(`Logo file received: ${file.name}, Size: ${file.size} bytes`);

        const { saveFile } = await import('./upload');
        const logoUrl = await saveFile(file, `schools/${schoolId}/logo`);

        await prisma.school.update({
            where: { id: schoolId },
            data: { logo: logoUrl }
        });

        revalidatePath('/admin/settings/school-info');
        logAction('Logo updated in DB and revalidated');
        return { success: true, url: logoUrl };
    } catch (error: any) {
        logAction(`Logo Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Upload school banner/watermark
export async function uploadSchoolBanner(formData: FormData) {
    logAction('Banner upload started');
    try {
        const schoolId = await getTenantId();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            logAction('No file or empty file provided');
            return { success: false, error: 'No file provided' };
        }

        logAction(`Banner file received: ${file.name}, Size: ${file.size} bytes`);

        const { saveFile } = await import('./upload');
        const bannerUrl = await saveFile(file, `schools/${schoolId}/banner`);

        await prisma.school.update({
            where: { id: schoolId },
            data: { banner: bannerUrl }
        });

        revalidatePath('/admin/settings/school-info');
        logAction('Banner updated in DB and revalidated');
        return { success: true, url: bannerUrl };
    } catch (error: any) {
        logAction(`Banner Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}
