import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminSignature } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        const result = await deleteAdminSignature(id);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
