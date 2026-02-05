import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { createBackup } from '@/lib/backup-actions'
import { syncToCloud } from '@/lib/sync-actions'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { type, customName, options } = body

        if (!type || !['FULL', 'INCREMENTAL', 'MANUAL'].includes(type)) {
            return NextResponse.json(
                { success: false, message: 'Invalid backup type' },
                { status: 400 }
            )
        }

        // Create backup
        const result = await createBackup(type, session.user.id!, customName, options)

        if (!result.success) {
            return NextResponse.json(result, { status: 500 })
        }

        // Upload to cloud if requested
        if (options?.uploadToCloud && result.backupId) {
            const syncResult = await syncToCloud(result.backupId)
            return NextResponse.json({
                ...result,
                cloudSync: syncResult,
            })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Backup API error:', error)
        return NextResponse.json(
            { success: false, message: 'Backup creation failed' },
            { status: 500 }
        )
    }
}
