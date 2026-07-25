import { Router } from 'express';
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobs,
} from '../controllers/upload.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createUploadJobSchema, updateUploadJobSchema } from '../schemas/upload.schema.js';

import partRouter from './part.routes.js';
import validationRouter from './validation.routes.js';
import eventRouter from './event.routes.js';
import artifactRouter from './artifact.routes.js';

const router = Router();

// Apply auth, tenant scoping and roles globally to all jobs routes
router.use(authenticate);
router.use(requireTenantAccess);
router.use(requireRole(['super_admin', 'tenant_admin', 'tenant_staff']));

// Upload Job core CRUD
router.post('/', validateBody(createUploadJobSchema), createJob);
router.get('/', listJobs);
router.get('/:id', getJob);
router.put('/:id', validateBody(updateUploadJobSchema), updateJob);
router.delete('/:id', deleteJob);

// Mount nested sub-routers
router.use('/:jobId/parts', partRouter);
router.use('/:jobId/validations', validationRouter);
router.use('/:jobId/events', eventRouter);
router.use('/:jobId/artifacts', artifactRouter);

export default router;
