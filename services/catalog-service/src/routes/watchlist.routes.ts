import { Router } from 'express';
import {
  addToWatchlist,
  removeFromWatchlist,
  listWatchlist,
} from '../controllers/watchlist.controller.js';
import { authenticate, requireTenantAccess } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createWatchlistItemSchema } from '../schemas/watchlist.schema.js';

const router = Router();

// Watchlist endpoints require authenticated user session
router.post('/', authenticate, requireTenantAccess, validateBody(createWatchlistItemSchema), addToWatchlist);
router.get('/', authenticate, requireTenantAccess, listWatchlist);
router.delete('/:filmId', authenticate, requireTenantAccess, removeFromWatchlist);

export default router;
