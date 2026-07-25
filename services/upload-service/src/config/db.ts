import { PrismaClient } from '../generated/client/index.js';

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

export async function init(): Promise<void> {
  console.log('🔄 Connecting to upload-service database via Prisma...');
  await prisma.$connect();
  console.log('✅ Upload database connection established successfully.');
}
