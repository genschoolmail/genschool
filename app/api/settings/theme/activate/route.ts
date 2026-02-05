import { NextRequest, NextResponse } from 'next/server';
import { activateTheme } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        const result = await activateTheme(id);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
