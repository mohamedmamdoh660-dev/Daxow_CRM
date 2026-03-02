const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
    const staffGroup = await p.role.findFirst({ where: { name: 'staff' } });
    if (!staffGroup) { console.log('No staff group found'); return; }

    const users = await p.user.findMany({
        where: { groups: { none: {} } },
        select: { id: true, email: true }
    });
    console.log('Users without groups:', users.map(u => u.email));

    for (const u of users) {
        await p.userGroup.create({ data: { userId: u.id, roleId: staffGroup.id } });
        console.log('Assigned', u.email, 'to staff');
    }
}
main().catch(console.error).finally(() => p.$disconnect());
