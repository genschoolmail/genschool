import { exportAsJSON } from '@/lib/actions/backup-export';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const result = await exportAsJSON(params.id);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to export data' },
                { status: 500 }
            );
        }

        return NextResponse.json(result.data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
