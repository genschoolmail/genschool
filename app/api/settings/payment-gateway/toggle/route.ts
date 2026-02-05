import { NextRequest, NextResponse } from 'next/server';
import { togglePaymentGateway } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        const result = await togglePaymentGateway(id);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
