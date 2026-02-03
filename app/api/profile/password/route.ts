import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

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

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'يرجى إدخال كلمة المرور الحالية والجديدة' },
                { status: 400 }
            );
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return NextResponse.json(
                { message: 'كلمة المرور الحالية غير صحيحة' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'تم تحديث كلمة المرور بنجاح' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
