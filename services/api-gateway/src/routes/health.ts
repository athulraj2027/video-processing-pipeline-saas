import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint for the Gateway
router.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        tenantId: req.tenantId || 'unresolved',
    });
});

export default router;