import { PrismaService } from '../../database/prisma.service';

/**
 * Resolves whether a user should see all records (view_all) or only their own (view / view_own).
 *
 * Returns `undefined` — user can see ALL records.
 * Returns `userId` — user can only see records where `ownerId = userId`.
 *
 * @param prisma - PrismaService instance
 * @param userId - The ID of the currently authenticated user
 * @param module - The module name (e.g. 'Students', 'Leads', 'Applications')
 */
export async function resolveViewScope(
    prisma: PrismaService,
    userId: string,
    module: string,
): Promise<string | undefined> {
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            groups: {
                include: { role: { include: { permissions: true } } },
            },
        },
    });

    if (!dbUser) return userId; // Fail-safe: restrict if user not found

    const isAdmin = dbUser.groups.some(g => g.role?.name === 'admin');
    const hasViewAll = isAdmin || dbUser.groups.some(g =>
        g.role?.permissions.some(p => p.module === module && p.action === 'view_all')
    );

    // view_all → no restriction; view_own → filter by ownerId = userId
    return hasViewAll ? undefined : userId;
}
