import { Request, Response } from 'express';

export function notFoundError(req: Request, res: Response) {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.url} not found` });
}
