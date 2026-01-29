import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase, generateSupabasePath } from '@/lib/supabase-storage';
import { uploadToLocal } from '@/lib/local-storage';

const STORAGE_BUCKET = 'crm-uploads';

export async function POST(request: NextRequest) {
    try {
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

        // Validate file type
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

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Generate folder path
        // 1. If explicit folder provided, use it (e.g. leads)
        // 2. If studentId provided, use students/{id}
        // 3. Default to 'temp'
        let folder = (formData.get('folder') as string) || '';

        if (!folder) {
            if (studentId) {
                folder = `students/${studentId}`;
            } else {
                folder = 'temp';
            }
        }

        // Try Supabase first, fallback to local storage
        let result: { url: string; path: string } | null = null;
        let storageType: 'supabase' | 'local' = 'local';

        try {
            // Try uploading to Supabase
            const storagePath = generateSupabasePath(folder, file.name);
            result = await uploadToSupabase(file, targetBucket, storagePath);

            if (result) {
                storageType = 'supabase';
                console.log(`✅ File uploaded to Supabase Storage (${targetBucket}/${folder})`);
            }
        } catch (error: any) {
            console.error('❌ Supabase upload failed:', error);
            // Allow fallback to local storage
        }

        // Fallback to local storage if Supabase failed
        if (!result) {
            result = await uploadToLocal(file, folder);
            console.log('✅ File uploaded to local storage');
        }

        return NextResponse.json({
            success: true,
            fileUrl: result.url,
            storagePath: result.path,
            storageType,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
