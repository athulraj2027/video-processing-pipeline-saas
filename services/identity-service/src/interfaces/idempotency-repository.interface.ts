import type { IdempotencyRecord } from './idempotency.interface.js';

export interface IIdempotencyRepository {
  createRecord(key: string, expiresAt: Date): Promise<boolean>;
  getRecord(key: string): Promise<IdempotencyRecord | null>;
  updateRecord(key: string, status: string, response: string): Promise<void>;
  deleteRecord(key: string): Promise<void>;
}
