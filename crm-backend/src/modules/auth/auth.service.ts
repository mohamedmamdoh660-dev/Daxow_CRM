import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase();
        const user = await this.prismaService.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
            include: {
                groups: {
                    include: {
                        role: { include: { permissions: true } }
                    }
                }
            }
        });

        if (!user) {
            return null;
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (isMatch) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Merge permissions from ALL groups the user belongs to
        const permMap = new Map<string, { module: string; action: string }>();
        let primaryRole = 'staff';

        for (const g of (user.groups || [])) {
            if (!primaryRole || primaryRole === 'staff') {
                primaryRole = g.role?.name || 'staff';
            }
            for (const p of (g.role?.permissions || [])) {
                permMap.set(`${p.module}:${p.action}`, { module: p.module, action: p.action });
            }
        }
        const permissions = Array.from(permMap.values());
        const groupNames = (user.groups || []).map((g: any) => g.role?.name).filter(Boolean);

        // ⚠️  Keep JWT payload small (cookie limit is 4096 bytes).
        //     Permissions are returned in the response body only and stored in localStorage.
        const payload = {
            email: user.email,
            sub: user.id,
            role: primaryRole,
            groups: groupNames,
            // permissions intentionally excluded from JWT
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: primaryRole,
                groups: groupNames,
                avatar: user.avatar,
                permissions,   // full list returned to client → stored in localStorage
            }
        };
    }
}
