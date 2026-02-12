import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase, generateSupabasePath } from '@/lib/supabase-storage';
import { uploadToLocal } from '@/lib/local-storage';
import { cookies } from 'next/headers';

const STORAGE_BUCKET = 'crm-uploads';

export async function POST(request: NextRequest) {
    try {
        // 🔐 Security: Require authentication for uploads
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Login required to upload files' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const documentType = formData.get('documentType') as string;
        const studentId = formData.get('studentId') as string;

        // We now use a single unified bucket: crm-uploads
        const targetBucket = STORAGE_BUCKET;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // 🔐 Security: Validate file type (whitelist approach)
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: Images, PDF, Word documents.' },
                { status: 400 }
            );
        }

        // 🔐 Security: Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // 🔐 Security: Sanitize file name to prevent path traversal
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        // Generate folder path
        let folder = (formData.get('folder') as string) || '';

        // 🔐 Security: Prevent path traversal in folder name
        folder = folder.replace(/\.\./g, '').replace(/^\/+/, '');

        if (!folder) {
            if (studentId) {
                folder = `students/${studentId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
            } else {
                folder = 'temp';
            }
        }

        // Try Supabase first, fallback to local storage
        let result: { url: string; path: string } | null = null;
        let storageType: 'supabase' | 'local' = 'local';

        try {
            const storagePath = generateSupabasePath(folder, sanitizedFileName);
            result = await uploadToSupabase(file, targetBucket, storagePath);

            if (result) {
                storageType = 'supabase';
            }
        } catch (error: any) {
            // Fallback to local storage silently
        }

        // Fallback to local storage if Supabase failed
        if (!result) {
            result = await uploadToLocal(file, folder);
        }

        return NextResponse.json({
            success: true,
            fileUrl: result.url,
            storagePath: result.path,
            storageType,
            fileName: sanitizedFileName,
            fileSize: file.size,
            fileType: file.type,
        });
    } catch (error: any) {
        console.error('Upload error:', error?.message);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
