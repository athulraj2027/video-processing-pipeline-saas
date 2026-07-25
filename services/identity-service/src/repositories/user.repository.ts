import fs from 'fs';
import { User, isPostgres, pool, getJsonDbPath } from '../config/db.js';

export interface IUserRepository {
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
}

class PostgresUserRepository implements IUserRepository {
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (id, email, password_hash, role, tenant_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, password_hash as "passwordHash", role, tenant_id as "tenantId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const res = await pool!.query(query, [user.id, user.email.toLowerCase(), user.passwordHash, user.role, user.tenantId || null]);
    return res.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", role, tenant_id as "tenantId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE LOWER(email) = $1
    `;
    const res = await pool!.query(query, [email.toLowerCase()]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", role, tenant_id as "tenantId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    const res = await pool!.query(query, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }
}

interface JsonSchema {
  users: User[];
  refreshTokens: any[];
}

class JsonUserRepository implements IUserRepository {
  private getFilePath(): string {
    return getJsonDbPath();
  }

  private read(): JsonSchema {
    const raw = fs.readFileSync(this.getFilePath(), 'utf-8');
    const data = JSON.parse(raw);
    data.users = data.users.map((u: any) => ({
      ...u,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    }));
    return data;
  }

  private write(data: JsonSchema): void {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(data, null, 2), 'utf-8');
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const data = this.read();
    const exists = data.users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      ...user,
      email: user.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    data.users.push(newUser);
    this.write(data);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const data = this.read();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const data = this.read();
    const user = data.users.find(u => u.id === id);
    return user || null;
  }
}

export const userRepository: IUserRepository = isPostgres 
  ? new PostgresUserRepository() 
  : new JsonUserRepository();
export default userRepository;
