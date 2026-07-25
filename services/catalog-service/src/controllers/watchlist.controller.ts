import { Request, Response } from 'express';
import { watchlistService } from '../services/watchlist.service.js';
import catchAsync from '../utils/catchAsync.js';

export const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const watchlistItem = await watchlistService.addToWatchlist(tenantId, viewerUserId, req.body);
  res.status(201).json({
    message: 'Film added to watchlist successfully',
    watchlistItem,
  });
});

export const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const { filmId } = req.params;
  await watchlistService.removeFromWatchlist(tenantId, viewerUserId, filmId);
  res.json({ message: 'Film removed from watchlist successfully' });
});

export const listWatchlist = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const watchlist = await watchlistService.listWatchlist(tenantId, viewerUserId);
  res.json({ watchlist });
});
