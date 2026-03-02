import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Serve uploaded files from local storage.
 * This is necessary because Next.js standalone mode doesn't serve
 * runtime-written files from the public/ directory.
 * 
 * Route: GET /api/uploads/[...path]
 * Maps to: /public/uploads/<path>
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = pathSegments.join('/');

        // 🔐 Security: Prevent path traversal
        if (filePath.includes('..') || filePath.includes('~')) {
            return NextResponse.json(
                { error: 'Invalid path' },
                { status: 400 }
            );
        }

        const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);

        // Check if file exists
        if (!existsSync(fullPath)) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await readFile(fullPath);

        // Determine content type from extension
        const ext = path.extname(fullPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        );
    }
}
