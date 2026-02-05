import { NextRequest, NextResponse } from 'next/server';
import { uploadSchoolLogo } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await uploadSchoolLogo(formData);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to upload logo' },
            { status: 500 }
        );
    }
}
