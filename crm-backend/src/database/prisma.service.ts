import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: ['error', 'warn'],
            // Connection pool settings for Supabase Session Pooler
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }

    async onModuleInit() {
        await this.connectWithRetry();
    }

    private async connectWithRetry(retries = 5, delay = 2000): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await this.$connect();
                this.logger.log('✅ Database connected');
                return;
            } catch (error) {
                this.logger.warn(`⚠️ DB connection attempt ${attempt}/${retries} failed: ${error.message}`);
                if (attempt < retries) {
                    await new Promise(res => setTimeout(res, delay * attempt)); // exponential backoff
                } else {
                    this.logger.error('❌ Database connection failed after all retries');
                    throw error;
                }
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('👋 Database disconnected');
    }
}
