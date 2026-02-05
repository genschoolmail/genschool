import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { exportEncryptionKey } from '@/lib/encryption'

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const result = await exportEncryptionKey()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Export key error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to export key' },
            { status: 500 }
        )
    }
}
