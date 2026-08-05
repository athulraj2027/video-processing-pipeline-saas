import { prisma } from '../config/db.js';
import type { IdempotencyRecord, IIdempotencyRepository } from '../interfaces/index.js';

class PrismaIdempotencyRepository implements IIdempotencyRepository {
  async createRecord(key: string, expiresAt: Date): Promise<boolean> {
    try {
      // Raw SQL check-and-insert using ON CONFLICT DO NOTHING.
      // affectedRows is 1 if the record is inserted successfully, 0 if conflict.
      const affectedRows = await prisma.$executeRaw`
        INSERT INTO "idempotency_records" ("key", "status", "expires_at", "created_at")
        VALUES (${key}, 'processing', ${expiresAt}, NOW())
        ON CONFLICT ("key") DO NOTHING;
      `;
      return affectedRows === 1;
    } catch (err) {
      console.error('Error executing raw SQL createRecord:', err);
      return false;
    }
  }

  async getRecord(key: string): Promise<IdempotencyRecord | null> {
    try {
      // Query database natively for valid non-expired records
      const records = await prisma.$queryRaw<any[]>`
        SELECT "key", "status", "response", "created_at" as "createdAt", "expires_at" as "expiresAt"
        FROM "idempotency_records"
        WHERE "key" = ${key} AND "expires_at" > NOW();
      `;

      if (records.length === 0) return null;

      const record = records[0];
      return {
        key: record.key,
        status: record.status,
        response: record.response,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      };
    } catch (err) {
      console.error('Error executing raw SQL getRecord:', err);
      return null;
    }
  }

  async updateRecord(key: string, status: string, response: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "idempotency_records"
        SET "status" = ${status}, "response" = ${response}
        WHERE "key" = ${key};
      `;
    } catch (err) {
      console.error('Error executing raw SQL updateRecord:', err);
    }
  }

  async deleteRecord(key: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "idempotency_records"
        WHERE "key" = ${key};
      `;
    } catch (err) {
      console.error('Error executing raw SQL deleteRecord:', err);
    }
  }
}

export const idempotencyRepository: IIdempotencyRepository = new PrismaIdempotencyRepository();
export default idempotencyRepository;
