import { Router } from 'express';
import jobRouter from './job.routes.js';

const router = Router();

// Mount jobs router under root
router.use('/', jobRouter);

export default router;
