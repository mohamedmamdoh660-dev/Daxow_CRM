
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@daxow.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
        },
        create: {
            email,
            password: hashedPassword,
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            name: 'Admin User',
        },
    });

    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
