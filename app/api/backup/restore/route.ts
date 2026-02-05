import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { restoreFromBackup } from '@/lib/backup-actions'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { backupId, createSafetyBackup } = body

        if (!backupId) {
            return NextResponse.json(
                { success: false, message: 'Backup ID is required' },
                { status: 400 }
            )
        }

        // Perform restore
        const result = await restoreFromBackup(
            backupId,
            session.user.id!,
            { createSafetyBackup: createSafetyBackup ?? true }
        )

        return NextResponse.json(result)
    } catch (error) {
        console.error('Restore API error:', error)
        return NextResponse.json(
            { success: false, message: 'Restore failed' },
            { status: 500 }
        )
    }
}
