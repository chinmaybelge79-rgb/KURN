import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { kurnPrisma?: PrismaClient };

export const prisma = globalForPrisma.kurnPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.kurnPrisma = prisma;

export async function checkDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
