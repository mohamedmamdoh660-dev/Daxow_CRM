import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirements } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

/**
 * 🔐 Security: Granular Permission-Based Access Control
 * Checks if the user has specific module-level permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirements[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // user payload from JWT strategy

        if (!user || (!user.sub && !user.id)) {
            throw new ForbiddenException('Access denied - Authentication required');
        }

        const userId = user.id || user.sub;

        // DB fetch for live permissions (since we removed them from JWT payload to avoid cookie bloat)
        const dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                groups: {
                    include: {
                        role: { include: { permissions: true } }
                    }
                }
            }
        });

        if (!dbUser) {
            throw new ForbiddenException('User not found');
        }

        // Merge permissions
        const hasPermission = (module: string, action: string) => {
            // Admins bypass all module checks
            if (dbUser.groups.some(g => g.role?.name === 'admin')) return true;

            // Check if ANY group the user belongs to has this exact permission
            return dbUser.groups.some(g =>
                g.role?.permissions.some(p => p.module === module && p.action === action)
            );
        };

        // If ANY of the required permissions array match, they are allowed
        // (Usually one endpoint only requires 1 permission, but if passed multiple it acts as OR)
        const isAllowed = requiredPermissions.some(req => hasPermission(req.module, req.action));

        if (!isAllowed) {
            const reqPermNames = requiredPermissions.map(p => `${p.module}:${p.action}`).join(' OR ');
            throw new ForbiddenException(`Access denied - Required permission: ${reqPermNames}`);
        }

        return true;
    }
}
