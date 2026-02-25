import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { decrypt } from './crypto';

/**
 * Resolve SMTP config for a given school (or fall back to global SuperAdmin settings).
 * Priority:  School-specific SchoolConfig.emailKeys  >  Global SystemSettings SMTP_*
 */
async function resolveSmtpConfig(schoolId?: string) {
    // --- 1. Try per-school SMTP settings ---
    if (schoolId) {
        try {
            const schoolConfig = await prisma.schoolConfig.findUnique({
                where: { schoolId },
                select: { emailKeys: true, emailProvider: true }
            });

            if (schoolConfig?.emailKeys) {
                const decrypted = decrypt(schoolConfig.emailKeys);
                if (decrypted) {
                    const parsed = JSON.parse(decrypted);
                    // Expected keys: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
                    if (parsed.SMTP_USER && parsed.SMTP_PASS) {
                        console.log(`[SMTP] Using school-specific SMTP for schoolId=${schoolId}`);
                        return { source: 'school', config: parsed };
                    }
                }
            }
        } catch (err) {
            console.warn('[SMTP] Failed to read school-specific SMTP config, falling back to global:', err);
        }
    }

    // --- 2. Fall back to global SystemSettings (Super Admin configured) ---
    const settings = await prisma.systemSettings.findMany({
        where: {
            key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] }
        }
    });

    const config = settings.reduce((acc: any, s) => {
        acc[s.key] = s.value;
        return acc;
    }, {});

    if (config.SMTP_USER && config.SMTP_PASS) {
        console.log(`[SMTP] Using global Super-Admin SMTP`);
        return { source: 'global', config };
    }

    return null; // No SMTP configured anywhere
}

/**
 * Build the OTP email HTML body.
 * schoolName is used dynamically so each school's OTP looks branded.
 */
function buildOtpEmailHtml(otp: string, schoolName?: string) {
    const senderName = schoolName || 'Our School';
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Account Recovery – ${senderName}</h2>
            <p>Hello,</p>
            <p>You requested a one-time password (OTP) from <strong>${senderName}</strong>. Please use the code below:</p>
            <div style="background: #f3f4f6; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; color: #4f46e5;">
                ${otp}
            </div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">Do not share this OTP with anyone. – ${senderName} Support</p>
        </div>
    `;
}

/**
 * Send OTP via Email.
 * Pass schoolId to use per-school SMTP; falls back to global Super-Admin SMTP.
 */
export async function sendEmailOTP(to: string, otp: string, schoolId?: string) {
    const resolved = await resolveSmtpConfig(schoolId);

    if (!resolved) {
        console.warn('[SMTP] No SMTP settings found (neither school-specific nor global).');
        console.log(`[DEV_ONLY] Email OTP for ${to}: ${otp}`);
        return { success: false, error: 'SMTP settings missing' };
    }

    const { config } = resolved;

    // Optionally fetch school name for branded email
    let schoolName: string | undefined;
    if (schoolId) {
        try {
            const school = await prisma.school.findUnique({
                where: { id: schoolId },
                select: { name: true }
            });
            schoolName = school?.name;
        } catch { /* non-critical, ignore */ }
    }

    console.log('[SMTP] Attempting to send email via:', config.SMTP_HOST, 'Port:', config.SMTP_PORT, 'User:', config.SMTP_USER);

    try {
        const transporter = nodemailer.createTransport({
            host: config.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(config.SMTP_PORT) || 465,
            secure: String(config.SMTP_PORT) === '465',
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        });

        const fromLabel = schoolName ? `"${schoolName}" <${config.SMTP_USER}>` : `"School Support" <${config.SMTP_USER}>`;

        const mailOptions = {
            from: config.SMTP_FROM || fromLabel,
            to,
            subject: `Your OTP Code – ${schoolName || 'Account Recovery'}`,
            html: buildOtpEmailHtml(otp, schoolName),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[SMTP] Email sent:', info.messageId);
        return { success: true };
    } catch (error: any) {
        console.error('[SMTP] Email send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via SMS using Fast2SMS.
 * schoolId parameter reserved for future per-school SMS key support.
 */
export async function sendSMSOTP(phone: string, otp: string, _schoolId?: string) {
    const setting = await prisma.systemSettings.findUnique({
        where: { key: 'FAST2SMS_AUTH_KEY' }
    });

    if (!setting?.value) {
        console.warn('[SMS] Fast2SMS Auth Key missing.');
        console.log(`[DEV_ONLY] SMS OTP for ${phone}: ${otp}`);
        return { success: false, error: 'SMS API settings missing' };
    }

    try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${setting.value}&variables_values=${otp}&route=otp&numbers=${phone}`);
        const data = await response.json();

        if (data.return) {
            console.log('[SMS] Sent successfully via Fast2SMS');
            return { success: true };
        } else {
            console.error('[SMS] Fast2SMS error:', data.message);
            return { success: false, error: data.message };
        }
    } catch (error: any) {
        console.error('[SMS] Send error:', error);
        return { success: false, error: error.message };
    }
}
