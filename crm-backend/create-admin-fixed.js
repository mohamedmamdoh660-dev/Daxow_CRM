const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    const email = 'Mohamed@daxow.com';
    const rawPassword = 'Mohmed@010';

    console.log(`🔐 Hashing password...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 1. Ensure an "admin" Role exists
    console.log(`🔍 Ensuring admin role exists...`);
    let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'admin',
                description: 'Super Admin',
                isSystem: true,
            }
        });
        console.log(`✅ Created admin role`);
    } else {
        console.log(`✅ Admin role already exists`);
    }

    // 2. Upsert the user
    console.log(`🔍 Creating/Updating user: ${email}...`);
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Mohamed Admin',
            isActive: true,
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Mohamed Admin',
            isActive: true,
            metadata: {},
        },
    });
    console.log(`✅ User upserted: ${user.id}`);

    // 3. Assign admin role to user via UserGroup
    await prisma.userGroup.upsert({
        where: {
            userId_roleId: { userId: user.id, roleId: adminRole.id }
        },
        update: {},
        create: {
            userId: user.id,
            roleId: adminRole.id,
        }
    });
    console.log(`✅ Assigned admin role to user`);

    console.log(`\n🎉 Done!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${rawPassword}`);
    console.log(`👤 Role: admin`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
