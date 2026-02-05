import { createHmac } from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'fallback-secret-key-change-me';

export function generateImpersonationToken(userId: string): string {
    const timestamp = Date.now();
    const payload = `${userId}:${timestamp}`;
    const signature = createHmac('sha256', SECRET).update(payload).digest('hex');
    return `${payload}:${signature}`;
}

export function verifyImpersonationToken(token: string): string | null {
    try {
        const [userId, timestampStr, signature] = token.split(':');
        const timestamp = parseInt(timestampStr);

        // 1. Check Expiration (5 minutes)
        if (Date.now() - timestamp > 5 * 60 * 1000) {
            return null;
        }

        // 2. Verify Signature
        const payload = `${userId}:${timestampStr}`;
        const expectedSignature = createHmac('sha256', SECRET).update(payload).digest('hex');

        if (signature === expectedSignature) {
            return userId;
        }
        return null;
    } catch (e) {
        return null;
    }
}
