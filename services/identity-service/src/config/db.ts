import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

export async function init(): Promise<void> {
  console.log('🔄 Connecting to database via Prisma...');
  await prisma.$connect();
  console.log('✅ Prisma database connection established successfully.');
}
