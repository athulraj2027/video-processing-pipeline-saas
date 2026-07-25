import { Router } from 'express';
import {
  addOrUpdateRating,
  updateRating,
  deleteRating,
  listRatingsForFilm,
  listAllRatings,
} from '../controllers/rating.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createRatingSchema, updateRatingSchema } from '../schemas/rating.schema.js';

const router = Router();

// Retrieve reviews for a specific film (public readable, filters unmoderated reviews for guests)
router.get('/film/:filmId', optionalAuthenticate, requireTenantAccess, listRatingsForFilm);

// Write or modify ratings (authenticated viewers)
router.post('/', authenticate, requireTenantAccess, validateBody(createRatingSchema), addOrUpdateRating);
router.put('/:id', authenticate, requireTenantAccess, validateBody(updateRatingSchema), updateRating);
router.delete('/:id', authenticate, requireTenantAccess, deleteRating);

// Manage ratings across the tenant (requires tenant admins/support review)
router.get('/', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin', 'tenant_staff']), listAllRatings);

export default router;
