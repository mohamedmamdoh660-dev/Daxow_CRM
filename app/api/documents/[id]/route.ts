import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromSupabase } from '@/lib/supabase-storage';

const STORAGE_BUCKET = 'student-documents';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get document first to retrieve storage path
        const document = await prisma.document.findUnique({
            where: { id },
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Delete from Supabase Storage if storagePath exists
        if (document.metadata && typeof document.metadata === 'object') {
            const metadata = document.metadata as { storagePath?: string };
            if (metadata.storagePath) {
                try {
                    await deleteFromSupabase(STORAGE_BUCKET, metadata.storagePath);
                } catch (error) {
                    console.error('Error deleting from Supabase:', error);
                    // Continue with database deletion even if Supabase delete fails
                }
            }
        }

        // Delete from database
        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete document' },
            { status: 500 }
        );
    }
}
