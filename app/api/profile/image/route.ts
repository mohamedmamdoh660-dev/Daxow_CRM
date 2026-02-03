import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
    sub: string;
    email: string;
    role: string;
}

async function getUserFromToken(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as JWTPayload;
        return await prisma.user.findUnique({
            where: { id: decoded.sub },
        });
    } catch (error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json(
                { message: 'لم يتم تحديد صورة' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!image.type.startsWith('image/')) {
            return NextResponse.json(
                { message: 'الملف المرفوع ليس صورة' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        if (image.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' },
                { status: 400 }
            );
        }

        // Create unique filename
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = image.name.split('.').pop();
        const filename = `${user.id}-${Date.now()}.${ext}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'profiles', filename);

        // Ensure directory exists
        const { mkdir } = await import('fs/promises');
        await mkdir(path.dirname(filepath), { recursive: true });

        // Save file
        await writeFile(filepath, buffer);

        // Update database
        const imageUrl = `/uploads/profiles/${filename}`;
        await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: imageUrl },
        });

        return NextResponse.json({
            message: 'تم رفع الصورة بنجاح',
            imageUrl
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
