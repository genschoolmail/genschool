import { NextRequest, NextResponse } from 'next/server';
import { getFileStream } from '@/lib/drive';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id;
        if (!fileId) {
            return new NextResponse('File ID required', { status: 400 });
        }

        // Get file stream from Google Drive
        const stream = await getFileStream(fileId);

        // Create a new response with the stream
        // @ts-ignore - ReadableStream type mismatch workaround
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'image/jpeg', // Default to jpeg, browser will often sniff or we could store mime type
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('File not found', { status: 404 });
    }
}
