import { Router } from 'express';
import tenantRouter from './tenant.routes.js';
import domainRouter from './domain.routes.js';
import userRouter from './user.routes.js';
import apiKeyRouter from './apiKey.routes.js';
import auditRouter from './audit.routes.js';

const router = Router();

// Mount sub-routers
router.use('/', tenantRouter);
router.use('/', domainRouter);
router.use('/', userRouter);
router.use('/', apiKeyRouter);
router.use('/', auditRouter);

export default router;
