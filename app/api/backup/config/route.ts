import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getBackupConfig, updateBackupConfig } from '@/lib/backup-actions'

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const result = await getBackupConfig()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Config API error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to get config' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = await updateBackupConfig(body, session.user.id!)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Config update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update config' },
            { status: 500 }
        )
    }
}
