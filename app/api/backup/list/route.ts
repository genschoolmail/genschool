import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getBackupList } from '@/lib/backup-actions'

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const result = await getBackupList({ limit: 100 })
        return NextResponse.json(result)
    } catch (error) {
        console.error('List backups API error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to list backups' },
            { status: 500 }
        )
    }
}
