import { uploadFile } from './s3-client';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

export async function performBackup() {
    try {
        // 1. Check if DB exists
        await fs.access(DB_PATH);

        // 2. Read File
        const fileBuffer = await fs.readFile(DB_PATH);

        // 3. Generate Key
        const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
        const key = `backups/db-backup-${timestamp}.sqlite`;

        // 4. Upload
        const result = await uploadFile(fileBuffer, key, 'application/vnd.sqlite3');

        // 5. Store Metadata in BackupRecord
        await prisma.backupRecord.create({
            data: {
                name: `Backup ${timestamp}`,
                fileName: key,
                fileSize: BigInt(fileBuffer.length),
                filePath: key, // Using key as path for now
                type: 'FULL_DB',
                status: 'COMPLETED',
                createdBy: 'SYSTEM',
                isCompressed: false,
                originalSize: BigInt(fileBuffer.length)
            }
        });

        return { success: true, url: result.url };
    } catch (error) {
        console.error('Backup Failed', error);
        throw new Error('Backup failed: ' + (error as Error).message);
    }
}

export async function getBackups() {
    return await prisma.dataBackup.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}
