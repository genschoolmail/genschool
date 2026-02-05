import nodemailer from 'nodemailer';
import { prisma } from './prisma';

/**
 * Send OTP via Email using Gmail SMTP
 */
export async function sendEmailOTP(to: string, otp: string) {
    // 1. Get SMTP settings from SystemSettings
    const settings = await prisma.systemSettings.findMany({
        where: {
            key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] }
        }
    });

    const config = settings.reduce((acc: any, s) => {
        acc[s.key] = s.value;
        return acc;
    }, {});

    if (!config.SMTP_USER || !config.SMTP_PASS) {
        console.warn('SMTP settings missing. Found keys:', Object.keys(config));
        console.log(`[DEV_ONLY] Email OTP for ${to}: ${otp}`);
        return { success: false, error: 'SMTP settings missing' };
    }

    console.log('Attempting to send email via SMTP:', config.SMTP_HOST, 'Port:', config.SMTP_PORT, 'User:', config.SMTP_USER);

    try {
        const transporter = nodemailer.createTransport({
            host: config.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(config.SMTP_PORT) || 465,
            secure: config.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: config.SMTP_FROM || `"School Support" <${config.SMTP_USER}>`,
            to: to,
            subject: 'Your OTP Code - Account Recovery',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Account Recovery</h2>
                    <p>Hello,</p>
                    <p>You requested an OTP for password recovery. Please use the following code:</p>
                    <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Do not share this OTP with anyone.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return { success: true };
    } catch (error: any) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via SMS using Fast2SMS
 */
export async function sendSMSOTP(phone: string, otp: string) {
    const setting = await prisma.systemSettings.findUnique({
        where: { key: 'FAST2SMS_AUTH_KEY' }
    });

    if (!setting?.value) {
        console.warn('Fast2SMS Auth Key missing.');
        console.log(`[DEV_ONLY] SMS OTP for ${phone}: ${otp}`);
        return { success: false, error: 'SMS API settings missing' };
    }

    try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${setting.value}&variables_values=${otp}&route=otp&numbers=${phone}`);
        const data = await response.json();

        if (data.return) {
            console.log('SMS sent successfully via Fast2SMS');
            return { success: true };
        } else {
            console.error('Fast2SMS error:', data.message);
            return { success: false, error: data.message };
        }
    } catch (error: any) {
        console.error('SMS send error:', error);
        return { success: false, error: error.message };
    }
}
