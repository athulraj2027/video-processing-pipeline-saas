import { Router } from 'express';
import filmRouter from './film.routes.js';
import genreRouter from './genre.routes.js';
import bundleRouter from './bundle.routes.js';
import watchlistRouter from './watchlist.routes.js';
import ratingRouter from './rating.routes.js';

const router = Router();

// Mount domain routes
router.use('/films', filmRouter);
router.use('/genres', genreRouter);
router.use('/bundles', bundleRouter);
router.use('/watchlist', watchlistRouter);
router.use('/ratings', ratingRouter);

export default router;
