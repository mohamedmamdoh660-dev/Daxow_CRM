import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔐 Creating admin user...');

        // Hash password
        const password = 'Admin@123'; // Change this to your desired password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@daxow.com' },
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            return;
        }

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin@daxow.com',
                password: hashedPassword,
                role: 'ADMIN',
                name: 'Admin User',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', password);
        console.log('👤 Role:', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Login at: https://crm.forexnewstv.com/login');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
