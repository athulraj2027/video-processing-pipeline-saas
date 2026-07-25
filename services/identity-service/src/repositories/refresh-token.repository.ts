import fs from 'fs';
import { RefreshToken, isPostgres, pool, getJsonDbPath } from '../config/db.js';

export interface IRefreshTokenRepository {
  createRefreshToken(token: Omit<RefreshToken, 'createdAt'>): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
}

class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  async createRefreshToken(token: Omit<RefreshToken, 'createdAt'>): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id as "userId", token, expires_at as "expiresAt", created_at as "createdAt"
    `;
    const res = await pool!.query(query, [token.id, token.userId, token.token, token.expiresAt]);
    return res.rows[0];
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const query = `
      SELECT id, user_id as "userId", token, expires_at as "expiresAt", created_at as "createdAt"
      FROM refresh_tokens
      WHERE token = $1
    `;
    const res = await pool!.query(query, [token]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const query = `DELETE FROM refresh_tokens WHERE token = $1`;
    await pool!.query(query, [token]);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const query = `DELETE FROM refresh_tokens WHERE user_id = $1`;
    await pool!.query(query, [userId]);
  }
}

interface JsonSchema {
  users: any[];
  refreshTokens: RefreshToken[];
}

class JsonRefreshTokenRepository implements IRefreshTokenRepository {
  private getFilePath(): string {
    return getJsonDbPath();
  }

  private read(): JsonSchema {
    const raw = fs.readFileSync(this.getFilePath(), 'utf-8');
    const data = JSON.parse(raw);
    data.refreshTokens = data.refreshTokens.map((t: any) => ({
      ...t,
      expiresAt: new Date(t.expiresAt),
      createdAt: new Date(t.createdAt),
    }));
    return data;
  }

  private write(data: JsonSchema): void {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(data, null, 2), 'utf-8');
  }

  async createRefreshToken(token: Omit<RefreshToken, 'createdAt'>): Promise<RefreshToken> {
    const data = this.read();
    const newToken: RefreshToken = {
      ...token,
      createdAt: new Date(),
    };
    data.refreshTokens.push(newToken);
    this.write(data);
    return newToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const data = this.read();
    const t = data.refreshTokens.find(r => r.token === token);
    return t || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const data = this.read();
    data.refreshTokens = data.refreshTokens.filter(r => r.token !== token);
    this.write(data);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const data = this.read();
    data.refreshTokens = data.refreshTokens.filter(r => r.userId !== userId);
    this.write(data);
  }
}

export const refreshTokenRepository: IRefreshTokenRepository = isPostgres
  ? new PostgresRefreshTokenRepository()
  : new JsonRefreshTokenRepository();
export default refreshTokenRepository;
