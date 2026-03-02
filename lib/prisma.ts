import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })

// ✅ Cache in ALL environments to prevent connection pool exhaustion
// In dev, Next.js hot-reload creates new module instances - the global cache prevents
// creating a new PrismaClient (and a new DB connection) on every hot reload.
// In production (serverless), each lambda invocation risks creating a new connection
// without this cache on globalThis.
globalForPrisma.prisma = prisma
