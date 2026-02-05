import { NextRequest, NextResponse } from 'next/server';
import { updateSystemSetting } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const { key, value } = await request.json();
        const result = await updateSystemSetting(key, value);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
