import { Router } from 'express';
import {
  createGenre,
  getGenre,
  getGenreBySlug,
  updateGenre,
  deleteGenre,
  listGenres,
} from '../controllers/genre.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createGenreSchema, updateGenreSchema } from '../schemas/genre.schema.js';

const router = Router();

// Publicly readable genres within tenant context
router.get('/', optionalAuthenticate, requireTenantAccess, listGenres);
router.get('/:id', optionalAuthenticate, requireTenantAccess, getGenre);
router.get('/slug/:slug', optionalAuthenticate, requireTenantAccess, getGenreBySlug);

// Tenant administration required for modification
router.post('/', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(createGenreSchema), createGenre);
router.put('/:id', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateGenreSchema), updateGenre);
router.delete('/:id', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), deleteGenre);

export default router;
