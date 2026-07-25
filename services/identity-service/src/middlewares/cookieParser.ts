import { NextFunction, Request, Response } from 'express';

export function cookieParser(req: Request,
    res: Response,
    next: NextFunction) {
    const cookieHeader = req.headers.cookie;
    const cookies: Record<string, string> = {};

    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            const name = parts.shift()?.trim();
            if (name) {
                cookies[name] = decodeURIComponent(parts.join('='));
            }
        });
    }

    req.cookies = cookies;
    next();
}