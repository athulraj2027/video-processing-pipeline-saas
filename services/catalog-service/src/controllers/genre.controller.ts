import { Request, Response } from 'express';
import { genreService } from '../services/genre.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createGenre = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const genre = await genreService.createGenre(tenantId, req.body);
  res.status(201).json({
    message: 'Genre created successfully',
    genre,
  });
});

export const getGenre = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const genre = await genreService.getGenreById(tenantId, id);
  res.json({ genre });
});

export const getGenreBySlug = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { slug } = req.params;
  const genre = await genreService.getGenreBySlug(tenantId, slug);
  res.json({ genre });
});

export const updateGenre = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const genre = await genreService.updateGenre(tenantId, id, req.body);
  res.json({
    message: 'Genre updated successfully',
    genre,
  });
});

export const deleteGenre = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  await genreService.deleteGenre(tenantId, id);
  res.json({ message: 'Genre deleted successfully' });
});

export const listGenres = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const isActiveOnly = req.query.active === 'true';
  const genres = await genreService.listGenres(tenantId, isActiveOnly);
  res.json({ genres });
});
