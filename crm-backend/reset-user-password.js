const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const rawPassword = 'Mohmed@010';

    // Hash the password fresh
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Find user case-insensitively and update password
    const user = await prisma.user.findFirst({
        where: { email: { equals: 'Mohamed@daxow.com', mode: 'insensitive' } }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log(`Found user: ${user.email} (${user.id})`);

    // Update password
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, isActive: true }
    });

    // Verify
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    console.log(`✅ Password reset. Verification: ${isMatch}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${rawPassword}`);
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
