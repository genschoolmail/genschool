import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getBackupById } from '@/lib/backup-actions'
import * as fs from 'fs/promises'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        // Get backup ID from query params
        const { searchParams } = new URL(request.url)
        const backupId = searchParams.get('id')

        if (!backupId) {
            return NextResponse.json(
                { success: false, message: 'Backup ID is required' },
                { status: 400 }
            )
        }

        // Get backup record
        const backupResult = await getBackupById(backupId)
        if (!backupResult.success || !backupResult.backup) {
            return NextResponse.json(
                { success: false, message: 'Backup not found' },
                { status: 404 }
            )
        }

        const backup = backupResult.backup

        if (!backup.filePath) {
            return NextResponse.json(
                { success: false, message: 'Backup file not found' },
                { status: 404 }
            )
        }

        // Check if file exists
        try {
            await fs.access(backup.filePath)
        } catch {
            return NextResponse.json(
                { success: false, message: 'Backup file does not exist on disk' },
                { status: 404 }
            )
        }

        // Read file
        const fileBuffer = await fs.readFile(backup.filePath)

        // Return file as download
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${backup.fileName || 'backup.db'}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        })
    } catch (error) {
        console.error('Download backup error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to download backup' },
            { status: 500 }
        )
    }
}
