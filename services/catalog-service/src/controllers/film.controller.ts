import { Request, Response } from 'express';
import { filmService } from '../services/film.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createFilm = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const film = await filmService.createFilm(tenantId, {
    ...req.body,
    createdById: req.user?.id,
  });
  res.status(201).json({
    message: 'Film created successfully',
    film,
  });
});

export const getFilm = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const film = await filmService.getFilmById(tenantId, id, req.user?.role);
  res.json({ film });
});

export const getFilmBySlug = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { slug } = req.params;
  const film = await filmService.getFilmBySlug(tenantId, slug, req.user?.role);
  res.json({ film });
});

export const updateFilm = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const film = await filmService.updateFilm(tenantId, id, {
    ...req.body,
    updatedById: req.user?.id,
  });
  res.json({
    message: 'Film metadata updated successfully',
    film,
  });
});

export const deleteFilm = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  await filmService.deleteFilm(tenantId, id);
  res.json({ message: 'Film deleted successfully' });
});

export const listFilms = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { status, visibility, contentType, genre, search } = req.query;

  const filters = {
    ...(status && { status }),
    ...(visibility && { visibility }),
    ...(contentType && { contentType }),
    ...(genre && { genreSlug: String(genre) }),
    ...(search && { search: String(search) }),
  };

  const films = await filmService.listFilms(tenantId, filters, req.user?.role);
  res.json({ films });
});

// Pricing
export const updatePricing = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const pricing = await filmService.updatePricing(tenantId, filmId, req.body);
  res.json({
    message: 'Film pricing updated successfully',
    pricing,
  });
});

// Availability
export const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const availability = await filmService.updateAvailability(tenantId, filmId, req.body);
  res.json({
    message: 'Film availability settings updated successfully',
    availability,
  });
});

// Assets
export const addAsset = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const asset = await filmService.addAsset(tenantId, filmId, req.body);
  res.status(201).json({
    message: 'Asset added successfully',
    asset,
  });
});

export const updateAsset = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, assetId } = req.params;
  const asset = await filmService.updateAsset(tenantId, filmId, assetId, req.body);
  res.json({
    message: 'Asset updated successfully',
    asset,
  });
});

export const deleteAsset = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, assetId } = req.params;
  await filmService.deleteAsset(tenantId, filmId, assetId);
  res.json({ message: 'Asset deleted successfully' });
});

// Subtitles
export const addSubtitle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const subtitle = await filmService.addSubtitle(tenantId, filmId, req.body);
  res.status(201).json({
    message: 'Subtitle language added successfully',
    subtitle,
  });
});

export const updateSubtitle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, subtitleId } = req.params;
  const subtitle = await filmService.updateSubtitle(tenantId, filmId, subtitleId, req.body);
  res.json({
    message: 'Subtitle updated successfully',
    subtitle,
  });
});

export const deleteSubtitle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, subtitleId } = req.params;
  await filmService.deleteSubtitle(tenantId, filmId, subtitleId);
  res.json({ message: 'Subtitle deleted successfully' });
});

// Chapters
export const addChapter = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const chapter = await filmService.addChapter(tenantId, filmId, req.body);
  res.status(201).json({
    message: 'Chapter added successfully',
    chapter,
  });
});

export const updateChapter = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, chapterId } = req.params;
  const chapter = await filmService.updateChapter(tenantId, filmId, chapterId, req.body);
  res.json({
    message: 'Chapter details updated successfully',
    chapter,
  });
});

export const deleteChapter = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, chapterId } = req.params;
  await filmService.deleteChapter(tenantId, filmId, chapterId);
  res.json({ message: 'Chapter deleted successfully' });
});

// Variants
export const addVariant = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId } = req.params;
  const variant = await filmService.addVariant(tenantId, filmId, req.body);
  res.status(201).json({
    message: 'Variant format added successfully',
    variant,
  });
});

export const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, variantId } = req.params;
  const variant = await filmService.updateVariant(tenantId, filmId, variantId, req.body);
  res.json({
    message: 'Variant updated successfully',
    variant,
  });
});

export const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { filmId, variantId } = req.params;
  await filmService.deleteVariant(tenantId, filmId, variantId);
  res.json({ message: 'Variant deleted successfully' });
});
