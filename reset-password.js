const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@daxow.com';
    const newPassword = 'password123'; // Temporary password

    // Hash the new password using bcryptjs (same as the backend uses)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(`Checking for user: ${email}...`);

    const user = await prisma.user.findFirst({
        where: { email },
    });

    if (!user) {
        console.log(`User ${email} not found. Creating new admin user...`);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN', // Check your schema for exact role enum
            },
        });

        console.log(`✅ Admin user created with password: ${newPassword}`);
    } else {
        console.log(`User found (ID: ${user.id}). Updating password...`);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        console.log(`✅ Password updated successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
