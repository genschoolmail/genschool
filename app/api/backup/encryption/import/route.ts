import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { importEncryptionKey } from '@/lib/encryption'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { key } = body

        if (!key) {
            return NextResponse.json(
                { success: false, message: 'Encryption key is required' },
                { status: 400 }
            )
        }

        const result = await importEncryptionKey(key)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Import key error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to import key' },
            { status: 500 }
        )
    }
}
