import { Router } from 'express';
import tenantRouter from './tenant.routes.js';
import domainRouter from './domain.routes.js';
import userRouter from './user.routes.js';

const router = Router();

// Mount sub-routers
router.use('/', tenantRouter);
router.use('/', domainRouter);
router.use('/', userRouter);

export default router;
