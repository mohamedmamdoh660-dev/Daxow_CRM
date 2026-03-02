import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashed = await bcrypt.hash('Mohmed@010', 10);
    const user = await prisma.user.updateMany({
        where: { email: 'admin@daxow.com' },
        data: { password: hashed },
    });
    console.log(`Updated ${user.count} user(s)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
