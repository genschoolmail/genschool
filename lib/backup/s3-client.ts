import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.S3_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET || 'school-management-backups';

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || ''
    },
    // Optional: endpoint for compatible services like MinIO/Wasabi
    endpoint: process.env.S3_ENDPOINT
});

export async function uploadFile(buffer: Buffer, key: string, contentType: string = 'application/octet-stream') {
    const params = {
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return { success: true, url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}` };
    } catch (error) {
        console.error("S3 Upload Error", error);
        throw new Error('Failed to upload backup to S3');
    }
}
