import { NextRequest, NextResponse } from 'next/server';
import { createTheme } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await createTheme(formData);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
