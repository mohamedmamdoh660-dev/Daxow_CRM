const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'Mohamed@daxow.com';
    const rawPassword = 'Mohmed@010';

    console.log(`🔐 Hashing password...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    console.log(`🔍 Creating/Updating user: ${email}...`);

    // Delete old wrong-email user if exists
    try {
        await prisma.user.delete({ where: { email: 'Mohmed@daxow.com' } });
        console.log('🗑️ Deleted old user with wrong email (Mohmed@daxow.com)');
    } catch (e) {
        // User might not exist, that's fine
    }

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin',
            name: 'Mohamed Admin',
            isActive: true
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Mohamed Admin',
            role: 'admin',
            isActive: true,
            metadata: {}
        },
    });

    console.log(`✅ Success! User ready.`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${rawPassword}`);
    console.log(`🆔 User ID: ${user.id}`);
    console.log(`👤 Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
