'use server';

import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { encrypt, decrypt } from '@/lib/crypto';

export async function saveSchoolSmtpConfig(formData: FormData) {
    try {
        await ensureSuperAdmin();
        const schoolId = formData.get('schoolId') as string;
        if (!schoolId) {
            return { success: false, error: 'School ID is required' };
        }

        const host = formData.get('SMTP_HOST') as string;
        const port = formData.get('SMTP_PORT') as string;
        const user = formData.get('SMTP_USER') as string;
        const pass = formData.get('SMTP_PASS') as string;
        const from = formData.get('SMTP_FROM') as string;

        // Either all should be filled, or all empty to disable custom SMTP
        if ((host || port || user || pass || from) && (!host || !port || !user || !pass)) {
            return { success: false, error: 'Please fill all required SMTP fields or clear all to disable.' };
        }

        let newKeysValue = null;
        let newProviderValue = null;

        if (host && port && user && pass) {
            const configObject = {
                SMTP_HOST: host,
                SMTP_PORT: port,
                SMTP_USER: user,
                SMTP_PASS: pass,
                SMTP_FROM: from || `"" <${user}>`
            };

            // Encrypt before saving
            newKeysValue = encrypt(JSON.stringify(configObject));
            newProviderValue = 'CUSTOM_SMTP';
        }

        await prisma.schoolConfig.upsert({
            where: { schoolId },
            create: {
                schoolId,
                emailProvider: newProviderValue,
                emailKeys: newKeysValue,
            },
            update: {
                emailProvider: newProviderValue,
                emailKeys: newKeysValue,
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Failed to save SMTP config:', error);
        return { success: false, error: error.message || 'Failed to save SMTP configuration' };
    }
}

export async function getSchoolSmtpConfig(schoolId: string) {
    try {
        await ensureSuperAdmin();
        if (!schoolId) {
            return { success: false, error: 'School ID is required' };
        }

        const config = await prisma.schoolConfig.findUnique({
            where: { schoolId },
            select: { emailKeys: true }
        });

        if (!config || !config.emailKeys) {
            return { success: true, data: null };
        }

        const decrypted = decrypt(config.emailKeys);
        if (!decrypted) return { success: true, data: null };

        const parsed = JSON.parse(decrypted);

        // Don't send the real password back to the client for security
        if (parsed.SMTP_PASS) {
            parsed.SMTP_PASS = '********';
        }

        return { success: true, data: parsed };
    } catch (error: any) {
        console.error('Failed to get SMTP config:', error);
        return { success: false, error: error.message };
    }
}

export async function testSchoolSmtpConfig(schoolId: string, testEmail: string) {
    try {
        await ensureSuperAdmin();
        const { sendEmail } = await import('@/lib/communication');

        const res = await sendEmail({
            to: testEmail,
            subject: 'SMTP Test - GenSchool Platform',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #4f46e5;">SMTP Test Successful!</h2>
                    <p>This is a test email sent from the GenSchool Super Admin panel.</p>
                    <p>If you are seeing this, the SMTP configuration for this school is working correctly.</p>
                </div>
            `,
            schoolId
        });

        return res;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

