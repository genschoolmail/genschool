import { NextRequest, NextResponse } from 'next/server';
import { getFileStream, getDriveClient } from '@/lib/drive';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id;
        if (!fileId) {
            return new NextResponse('File ID required', { status: 400 });
        }

        // Get file metadata to determine MIME type
        const drive = getDriveClient();
        const metadata = await drive.files.get({
            fileId: fileId,
            fields: 'mimeType, name',
            supportsAllDrives: true,
        });

        const mimeType = metadata.data.mimeType || 'application/octet-stream';

        // Get file stream from Google Drive
        const stream = await getFileStream(fileId);

        // Convert Node.js Readable stream to Web ReadableStream
        // Next.js Response expects a Web Stream in newer versions
        const webStream = new ReadableStream({
            async start(controller) {
                // @ts-ignore
                for await (const chunk of stream) {
                    controller.enqueue(chunk);
                }
                controller.close();
            }
        });

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Error serving file from Drive:', error);
        return new NextResponse(`File not found: ${error.message}`, { status: 404 });
    }
}
