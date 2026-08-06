import jwt from 'jsonwebtoken';
import { env } from './env.js';

export interface UserPayload {
    id: string;
    role: string;
    email: string;
    tenantId: string;
}

export function verifyJwtToken(token: string): UserPayload {
    return jwt.verify(token, env.JWT_SECRET) as UserPayload;
}