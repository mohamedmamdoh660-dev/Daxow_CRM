import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MODULES = [
    'Dashboard', 'Students', 'Applications', 'Leads', 'Programs',
    'Academic Years', 'Faculties', 'Countries & Cities', 'Languages & Titles',
    'Agents', 'User Management', 'Roles & Permissions', 'Settings', 'Profile'
];
const ACTIONS = ['view', 'add', 'edit', 'delete', 'export', 'import'];

async function main() {
    console.log('🌱 Seeding default groups...');

    // Admin group — full access to everything
    const adminGroup = await prisma.role.upsert({
        where: { name: 'admin' },
        update: { description: 'Full system access', isSystem: true },
        create: { name: 'admin', description: 'Full system access', isSystem: true },
    });
    for (const module of MODULES) {
        for (const action of ACTIONS) {
            await prisma.permission.upsert({
                where: { roleId_module_action: { roleId: adminGroup.id, module, action } },
                update: {},
                create: { roleId: adminGroup.id, module, action },
            });
        }
    }
    console.log('✅ Admin group created');

    // Staff group — view/add/edit on core modules, no admin modules
    const staffModules = ['Dashboard', 'Students', 'Applications', 'Leads', 'Programs', 'Academic Years', 'Faculties', 'Countries & Cities', 'Languages & Titles', 'Agents', 'Profile'];
    const staffActions = ['view', 'add', 'edit'];
    const staffGroup = await prisma.role.upsert({
        where: { name: 'staff' },
        update: { description: 'Standard staff access', isSystem: true },
        create: { name: 'staff', description: 'Standard staff access', isSystem: true },
    });
    for (const module of staffModules) {
        for (const action of staffActions) {
            await prisma.permission.upsert({
                where: { roleId_module_action: { roleId: staffGroup.id, module, action } },
                update: {},
                create: { roleId: staffGroup.id, module, action },
            });
        }
    }
    console.log('✅ Staff group created');

    // Agent group — limited view-only access
    const agentGroup = await prisma.role.upsert({
        where: { name: 'agent' },
        update: { description: 'External agent access', isSystem: true },
        create: { name: 'agent', description: 'External agent access', isSystem: true },
    });
    const agentPerms = [
        { module: 'Dashboard', action: 'view' },
        { module: 'Applications', action: 'view' },
        { module: 'Students', action: 'view' },
        { module: 'Profile', action: 'view' },
        { module: 'Profile', action: 'edit' },
    ];
    for (const { module, action } of agentPerms) {
        await prisma.permission.upsert({
            where: { roleId_module_action: { roleId: agentGroup.id, module, action } },
            update: {},
            create: { roleId: agentGroup.id, module, action },
        });
    }
    console.log('✅ Agent group created');

    // Ensure at least one admin user
    let adminUser = await prisma.user.findFirst({ where: { email: 'admin@daxow.com' } });
    if (!adminUser) {
        const hashed = await bcrypt.hash('Admin@123', 10);
        adminUser = await prisma.user.create({
            data: { email: 'admin@daxow.com', password: hashed, name: 'Admin User' },
        });
        console.log('✅ Default admin user created: admin@daxow.com / Admin@123');
    }
    // Assign admin to admin group
    await prisma.userGroup.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: adminGroup.id } },
        update: {},
        create: { userId: adminUser.id, roleId: adminGroup.id },
    });
    console.log('✅ Admin user assigned to admin group');
    console.log('🎉 Seed complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
