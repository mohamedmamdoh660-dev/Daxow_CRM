const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Check if user exists
    const user = await prisma.user.findFirst({
        where: { email: { equals: 'Mohamed@daxow.com', mode: 'insensitive' } },
        include: { groups: { include: { role: true } } }
    });

    if (!user) {
        console.log('❌ User NOT FOUND in DB');
        return;
    }

    console.log(`✅ User Found: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   IsActive: ${user.isActive}`);
    console.log(`   Groups/Roles: ${user.groups.map(g => g.role?.name).join(', ')}`);
    console.log(`   Password hash starts with: ${user.password.substring(0, 10)}...`);

    // Verify password
    const isMatch = await bcrypt.compare('Mohmed@010', user.password);
    console.log(`   Password 'Mohmed@010' matches: ${isMatch}`);
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
