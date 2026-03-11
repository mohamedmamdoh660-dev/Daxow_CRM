import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase, generateSupabasePath } from '@/lib/supabase-storage';
import { uploadToLocal } from '@/lib/local-storage';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes } from '@/lib/timeline';

const STORAGE_BUCKET = 'crm-uploads';

/**
 * POST /api/n8n-upload
 * 
 * Service endpoint for n8n to upload generated documents (e.g. offer letter PDFs)
 * directly to the CRM without requiring a browser session.
 * 
 * Auth: Authorization: Bearer <N8N_SERVICE_KEY>
 * Body: multipart/form-data
 *   - file: binary PDF/document
 *   - applicationId: string (required)
 *   - fileName: string (e.g. "Mohammed Ali Offer.pdf")
 *   - fileType: string (default: "offer_letter")
 */
export async function POST(request: NextRequest) {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const serviceKey = process.env.N8N_SERVICE_KEY;
    if (!serviceKey) {
        return NextResponse.json({ error: 'N8N_SERVICE_KEY not configured on server' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (token !== serviceKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse form data ───────────────────────────────────────────────────────
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const applicationId = formData.get('applicationId') as string | null;
    const fileName = (formData.get('fileName') as string | null) || file?.name || 'document.pdf';
    const fileType = (formData.get('fileType') as string | null) || 'offer_letter';

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!applicationId) {
        return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    // ── Upload to storage ─────────────────────────────────────────────────────
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._\- ]/g, '_');
    const folder = `applications/${applicationId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    let result: { url: string; path: string } | null = null;
    let storageType: 'supabase' | 'local' = 'local';

    try {
        const storagePath = generateSupabasePath(folder, sanitizedFileName);
        result = await uploadToSupabase(file, STORAGE_BUCKET, storagePath);
        if (result) storageType = 'supabase';
    } catch {
        // fall through to local
    }

    if (!result) {
        result = await uploadToLocal(file, folder);
    }

    // ── Create document record in DB ──────────────────────────────────────────
    const document = await prisma.document.create({
        data: {
            applicationId,
            fileName: sanitizedFileName,
            fileType,
            fileUrl: result.url,
            fileSize: file.size,
            metadata: { storagePath: result.path, storageType, generatedBy: 'n8n' },
        },
    });

    // ── Timeline event ────────────────────────────────────────────────────────
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { studentId: true },
    });

    if (application?.studentId) {
        await createTimelineEvent({
            entityType: 'application',
            entityId: applicationId,
            studentId: application.studentId,
            applicationId,
            eventType: TimelineEventTypes.DOCUMENT_UPLOADED,
            description: `Offer letter generated and uploaded: ${sanitizedFileName}`,
            metadata: { fileName: sanitizedFileName, fileType, documentId: document.id, generatedBy: 'n8n' },
        });
    }

    return NextResponse.json({
        success: true,
        documentId: document.id,
        fileUrl: result.url,
        storageType,
        fileName: sanitizedFileName,
    });
}
