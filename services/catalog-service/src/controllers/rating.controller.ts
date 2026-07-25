import { Request, Response } from 'express';
import { ratingService } from '../services/rating.service.js';
import catchAsync from '../utils/catchAsync.js';

export const addOrUpdateRating = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const rating = await ratingService.addOrUpdateRating(tenantId, viewerUserId, req.body);
  res.status(201).json({
    message: 'Rating/Review saved successfully',
    rating,
  });
});

export const updateRating = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const { id } = req.params;
  const rating = await ratingService.updateRating(tenantId, viewerUserId, id, req.body, req.user?.role);
  res.json({
    message: 'Review updated successfully',
    rating,
  });
});

export const deleteRating = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const viewerUserId = req.user!.id;
  const { id } = req.params;
  await ratingService.deleteRating(tenantId, viewerUserId, id, req.user?.role);
  res.json({ message: 'Review deleted successfully' });
});

export const listRatingsForFilm = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const ratings = await ratingService.listRatingsForFilm(tenantId, filmId, req.user?.role);
  res.json({ ratings });
});

export const listAllRatings = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const ratings = await ratingService.listAllRatings(tenantId);
  res.json({ ratings });
});
