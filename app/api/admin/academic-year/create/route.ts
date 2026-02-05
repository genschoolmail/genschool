import { createAcademicYear } from '@/lib/actions/academic-year';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Create FormData from JSON body
        const formData = new FormData();
        if (body.name) formData.append('name', body.name);
        if (body.startDate) formData.append('startDate', body.startDate);
        if (body.endDate) formData.append('endDate', body.endDate);

        const result = await createAcademicYear(formData);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Academic year created successfully',
            data: result.data
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
