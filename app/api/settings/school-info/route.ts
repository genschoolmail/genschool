import { NextRequest, NextResponse } from 'next/server';
import { updateSchoolSettings } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await updateSchoolSettings(formData);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update settings' },
            { status: 500 }
        );
    }
}
