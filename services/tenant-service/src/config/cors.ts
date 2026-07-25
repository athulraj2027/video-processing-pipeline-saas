import cors from 'cors';

export const corsMiddleware = cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Host', 'X-Tenant-Id'],
});
