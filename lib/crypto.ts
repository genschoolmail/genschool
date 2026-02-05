import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// Ensure key is 32 bytes (256 bits)
const MASTER_KEY = process.env.PAYMENT_ENCRYPTION_KEY
    ? createHash('sha256').update(String(process.env.PAYMENT_ENCRYPTION_KEY)).digest()
    : createHash('sha256').update('dev-fallback-secret-DoNotUseInProd').digest();

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    if (!text) return '';

    // IV (Initialization Vector) - 12 bytes for GCM
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, MASTER_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedContent
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    if (!encryptedText) return '';

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            // Assume it's not encrypted or legacy plain text (optional fallback)
            // For security, we should fail, but for migration, we might perform a check.
            // Here we strictly fail to prevent using unencrypted data if not intended.
            throw new Error('Invalid encrypted text format');
        }

        const [ivHex, authTagHex, encryptedHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = createDecipheriv(ALGORITHM, MASTER_KEY, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return ''; // Return empty string on failure to avoid leaking error details or crashing
    }
}

export function maskSensitiveData(data: string): string {
    if (!data) return '';
    if (data.length <= 8) return '********';
    return data.substring(0, 4) + '****' + data.substring(data.length - 4);
}
