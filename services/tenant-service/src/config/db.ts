import { PrismaClient } from '../generated/client/index.js';

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

export async function init(): Promise<void> {
  console.log('🔄 Connecting to tenant-service database via Prisma...');
  await prisma.$connect();
  console.log('✅ Tenant database connection established successfully.');
}
