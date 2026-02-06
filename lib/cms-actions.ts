'use server';

import { prisma } from '@/lib/prisma';
import { ensureTenantId } from './tenant';
import { revalidatePath } from 'next/cache';
import { saveFile } from './upload';
import { appendFileSync } from 'fs';
import { join } from 'path';

const DEBUG_LOG = join(process.cwd(), 'upload_debug.log');

function logAction(message: string) {
    const timestamp = new Date().toISOString();
    appendFileSync(DEBUG_LOG, `[${timestamp}] [CMS-Action] ${message}\n`);
    console.log(message);
}

export interface WebsiteConfig {
    schoolId: string;
    heroTitle?: string;
    heroDescription?: string;
    heroImage?: string;
    contactInfo?: string;
    primaryColor?: string;
    featuresJson?: string;
    schoolName?: string;
    email?: string;
    phone?: string;
    address?: string;
    galleryJson?: string;
    homepageNotice?: string;
    homepageNoticeEnabled?: boolean;
    admissionStatusEnabled?: boolean;
    admissionText?: string;
}

export async function getWebsiteConfig(schoolId: string): Promise<WebsiteConfig | null> {
    const settings = await prisma.schoolSettings.findUnique({
        where: { schoolId }
    });

    if (!settings) {
        // Return a default config with the schoolId so the UI doesn't break
        return {
            schoolId,
            galleryJson: '[]',
            heroTitle: '',
            heroDescription: '',
            heroImage: '',
            schoolName: '',
            email: '',
            phone: '',
            address: '',
            homepageNotice: '',
            homepageNoticeEnabled: false,
            admissionStatusEnabled: false,
            admissionText: 'Admissions Open 2025-26'
        };
    }

    return {
        schoolId,
        heroTitle: (settings as any).heroTitle || '',
        heroDescription: (settings as any).heroDescription || '',
        heroImage: (settings as any).heroImage || '',
        featuresJson: (settings as any).featuresJson || '[]',
        schoolName: settings.schoolName,
        email: settings.email,
        phone: settings.contactNumber,
        address: settings.address,
        galleryJson: (settings as any).galleryJson || '[]',
        contactInfo: `${settings.address}\n${settings.contactNumber}\n${settings.email}`,
        homepageNotice: (settings as any).homepageNotice || '',
        homepageNoticeEnabled: (settings as any).homepageNoticeEnabled ?? false,
        admissionStatusEnabled: (settings as any).admissionStatusEnabled ?? false,
        admissionText: (settings as any).admissionText || 'Admissions Open 2025-26',
    };
}

export async function updateWebsiteConfig(data: {
    heroTitle: string;
    heroDescription: string;
    heroImage: string;
    phone?: string;
    email?: string;
    address?: string;
    galleryJson?: string;
    homepageNotice?: string;
    homepageNoticeEnabled?: boolean;
    admissionStatusEnabled?: boolean;
    admissionText?: string;
}) {
    const schoolId = await ensureTenantId();

    const updateData: any = {
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        heroImage: data.heroImage
    };

    // Optional fields
    if (data.phone) updateData.contactNumber = data.phone;
    if (data.email) updateData.email = data.email;
    if (data.address) updateData.address = data.address;
    if (data.galleryJson) updateData.galleryJson = data.galleryJson;
    if (data.homepageNotice !== undefined) updateData.homepageNotice = data.homepageNotice;
    if (data.homepageNoticeEnabled !== undefined) updateData.homepageNoticeEnabled = data.homepageNoticeEnabled;
    if (data.admissionStatusEnabled !== undefined) updateData.admissionStatusEnabled = data.admissionStatusEnabled;
    if (data.admissionText !== undefined) updateData.admissionText = data.admissionText;

    try {
        await (prisma.schoolSettings as any).upsert({
            where: { schoolId },
            create: {
                schoolId,
                schoolName: 'School',
                contactNumber: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                heroTitle: data.heroTitle,
                heroDescription: data.heroDescription,
                heroImage: data.heroImage,
                galleryJson: data.galleryJson || '[]',
                homepageNotice: data.homepageNotice || '',
                homepageNoticeEnabled: data.homepageNoticeEnabled || false,
                admissionStatusEnabled: data.admissionStatusEnabled || false,
                admissionText: data.admissionText || 'Admissions Open 2025-26'
            },
            update: updateData
        });

        if (data.phone || data.email || data.address) {
            await prisma.school.update({
                where: { id: schoolId },
                data: {
                    contactPhone: data.phone,
                    contactEmail: data.email,
                    address: data.address
                }
            });
        }

        revalidatePath('/admin/settings/website');
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        return { success: true };
    } catch (error: any) {
        console.error(`[updateWebsiteConfig] Error for school ${schoolId}:`, error);
        return { success: false, error: error.message || 'Failed to update website configuration' };
    }
}

// Upload hero image file
export async function uploadHeroImage(formData: FormData) {
    logAction('Hero upload started');
    try {
        const schoolId = await ensureTenantId();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            console.warn('[UploadAction] No file provided for hero');
            return { success: false, error: 'No file provided' };
        }

        console.log(`[UploadAction] Hero File: ${file.name}, Size: ${file.size}`);

        const imageUrl = await saveFile(file, 'website/hero');

        await (prisma.schoolSettings as any).upsert({
            where: { schoolId },
            create: {
                schoolId,
                heroImage: imageUrl,
                schoolName: 'School',
                contactNumber: 'N/A',
                email: 'N/A',
                address: 'N/A'
            },
            update: { heroImage: imageUrl }
        });

        logAction('Hero updated in schoolSettings');
        revalidatePath('/admin/settings/website');
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        return { success: true, url: imageUrl };
    } catch (error: any) {
        logAction(`Hero Error: ${error.message}`);
        return { success: false, error: error.message || 'Failed to upload image' };
    }
}

export async function manageGallery(action: 'add' | 'remove', item: { url: string, caption?: string, id?: string }) {
    const schoolId = await ensureTenantId();
    console.log(`[manageGallery] Action: ${action}, SchoolId: ${schoolId}, Item:`, item);

    try {
        const settings = await (prisma.schoolSettings as any).findUnique({
            where: { schoolId },
            select: { galleryJson: true }
        });

        if (!settings) {
            console.error(`[manageGallery] No school settings found for ID: ${schoolId}`);
            return { success: false, error: 'School settings not initialized' };
        }

        let gallery = [];
        try {
            gallery = JSON.parse(settings.galleryJson || '[]');
        } catch (e) {
            console.error(`[manageGallery] JSON parse error for galleryJson:`, settings.galleryJson);
            gallery = [];
        }

        if (action === 'add') {
            gallery.push({
                id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                url: item.url,
                caption: item.caption || ''
            });
        } else if (action === 'remove') {
            console.log(`[manageGallery] Attempting to remove. Current count: ${gallery.length}`);
            const initialCount = gallery.length;

            // Helper to extract filename for robust matching
            const getFilename = (url: string) => {
                if (!url) return '';
                try {
                    const parts = url.split('/');
                    return parts[parts.length - 1].trim();
                } catch (e) {
                    return '';
                }
            };

            const normalizeUrl = (url: string) => {
                if (!url) return '';
                try {
                    // Remove domain if present
                    let clean = url.replace(/^https?:\/\/[^\/]+/, '');
                    // Decode URI components (spaces, etc)
                    clean = decodeURIComponent(clean);
                    return clean.trim();
                } catch (e) {
                    return url.trim();
                }
            };

            const targetUrl = normalizeUrl(item.url);
            const targetFilename = getFilename(item.url);

            console.log(`[manageGallery] Removing target: ID=${item.id}, URL=${targetUrl}, File=${targetFilename}`);

            gallery = gallery.filter((i: any) => {
                // 1. ID Match
                if (item.id && i.id && i.id === item.id) return false;

                // 2. URL Match (Normalized)
                const currentUrl = normalizeUrl(i.url);
                if (currentUrl === targetUrl) {
                    console.log(`[manageGallery] MATCH FOUND by URL: ${currentUrl}`);
                    return false;
                }

                // 3. Filename Match (Ultimate Fallback)
                const currentFilename = getFilename(i.url);
                if (targetFilename && currentFilename === targetFilename && targetFilename.length > 10) {
                    // Ensure filename is long enough to unlikely be a false positive (timestamp based filenames are long)
                    console.log(`[manageGallery] MATCH FOUND by Filename: ${currentFilename}`);
                    return false;
                }

                return true;
            });

            console.log(`[manageGallery] After remove. New count: ${gallery.length}`);
            if (initialCount === gallery.length) {
                console.warn(`[manageGallery] FAILED TO REMOVE. Target: ${targetUrl}. Available URLs:`, gallery.map((g: any) => normalizeUrl(g.url)));
            }
        }

        const updatedSettings = await (prisma.schoolSettings as any).update({
            where: { schoolId },
            data: { galleryJson: JSON.stringify(gallery) }
        });

        console.log(`[manageGallery] Successfully updated database for school ${schoolId}`);
        revalidatePath('/admin/settings/website');
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        revalidatePath('/', 'page');
        return { success: true, gallery };
    } catch (error: any) {
        console.error('[manageGallery] CRITICAL ERROR:', error);
        return {
            success: false,
            error: error.message || 'Database update failed',
            gallery: []
        };
    }
}

// Upload gallery image file
export async function uploadGalleryImage(formData: FormData) {
    logAction('Gallery upload started');
    const schoolId = await ensureTenantId();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string || '';

    if (!file || file.size === 0) {
        console.warn('[UploadAction] No file provided for gallery');
        return { success: false, error: 'No file provided' };
    }

    console.log(`[UploadAction] Gallery File: ${file.name}, Size: ${file.size}`);

    try {
        const imageUrl = await saveFile(file, `gallery/${schoolId}`);
        console.log('[UploadAction] Gallery file saved, updating galleryJson');

        // Add to gallery
        const result = await manageGallery('add', { url: imageUrl, caption });
        return { success: true, url: imageUrl, gallery: result.gallery };
    } catch (error) {
        console.error('[UploadAction] Gallery Error:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}

// Homepage Notice Management
export async function updateHomepageNotice(data: { notice: string; enabled: boolean }) {
    const schoolId = await ensureTenantId();

    try {
        await (prisma.schoolSettings as any).update({
            where: { schoolId },
            data: {
                homepageNotice: data.notice,
                homepageNoticeEnabled: data.enabled
            }
        });

        // Forced revalidation for all relevant routes
        revalidatePath('/admin/settings/website');
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        // Also revalidate for subdomains if needed

        return { success: true };
    } catch (error) {
        console.error('Error updating homepage notice:', error);
        return { success: false, error: 'Failed to update notice' };
    }
}

// Admission Settings Management
export async function updateAdmissionSettings(data: { enabled: boolean; text: string }) {
    const schoolId = await ensureTenantId();

    try {
        await (prisma.schoolSettings as any).update({
            where: { schoolId },
            data: {
                admissionStatusEnabled: data.enabled,
                admissionText: data.text
            }
        });

        revalidatePath('/admin/settings/website');
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        return { success: true };
    } catch (error) {
        console.error('Error updating admission settings:', error);
        return { success: false, error: 'Failed to update admission settings' };
    }
}

export async function createInquiry(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const schoolId = formData.get('schoolId') as string;

    console.log('New Admission Inquiry:', { schoolId, name, email, phone, message });
}
