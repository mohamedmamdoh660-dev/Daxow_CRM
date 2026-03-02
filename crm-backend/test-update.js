const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const role = await prisma.role.findFirst({ include: { permissions: true } });
    console.log("Original role:", role.name, role.permissions.length, "perms");
    const newPerms = role.permissions.filter((p, i) => i !== 0).map(p => ({module: p.module, action: p.action}));
    console.log("Submitting:", newPerms.length, "perms");
    
    // Simulate what the controller gets
    const dto = { permissions: newPerms };
    
    await prisma.$transaction(async (tx) => {
        if (dto.permissions !== undefined) {
            await tx.permission.deleteMany({ where: { roleId: role.id } });
        }
        await tx.role.update({
            where: { id: role.id },
            data: {
                permissions: {
                    create: dto.permissions
                }
            }
        });
    });
    
    const updated = await prisma.role.findUnique({ where: { id: role.id }, include: { permissions: true } });
    console.log("Updated role perms:", updated.permissions.length);
    await prisma.$disconnect();
}
run();
