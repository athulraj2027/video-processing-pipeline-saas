import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { env } from './env.js';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export const isPostgres = !!env.DATABASE_URL;

export let pool: pg.Pool | undefined;
const jsonDbPath = path.resolve(process.cwd(), 'identity_db.json');

if (isPostgres) {
  console.log('🔌 Connecting to PostgreSQL at:', env.DATABASE_URL!.replace(/:[^:@/]+@/, ':***@'));
  pool = new pg.Pool({ connectionString: env.DATABASE_URL });
} else {
  console.log('⚠️ DATABASE_URL is not set. Falling back to local JSON database.');
}

export function getJsonDbPath(): string {
  return jsonDbPath;
}

export async function init(): Promise<void> {
  if (isPostgres && pool) {
    const client = await pool.connect();
    try {
      // 1. Create Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          tenant_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Create Refresh Tokens Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(500) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ PostgreSQL database tables initialized successfully.');
    } finally {
      client.release();
    }
  } else {
    if (!fs.existsSync(jsonDbPath)) {
      fs.writeFileSync(jsonDbPath, JSON.stringify({ users: [], refreshTokens: [] }, null, 2), 'utf-8');
    }
    console.log(`✅ Local JSON database initialized at: ${jsonDbPath}`);
  }
}
