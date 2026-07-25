import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createJob = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const job = await uploadService.createJob(tenantId, {
    ...req.body,
    createdById: req.user?.id,
  });
  res.status(201).json({
    message: 'Upload job created successfully',
    job,
  });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const job = await uploadService.getJobById(tenantId, id);
  res.json({ job });
});

export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const job = await uploadService.updateJob(tenantId, id, {
    ...req.body,
    updatedById: req.user?.id,
  });
  res.json({
    message: 'Upload job details updated successfully',
    job,
  });
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  await uploadService.deleteJob(tenantId, id);
  res.json({ message: 'Upload job deleted successfully' });
});

export const listJobs = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { status, validationStatus, filmId } = req.query;

  const filters = {
    ...(status && { status }),
    ...(validationStatus && { validationStatus }),
    ...(filmId && { filmId: String(filmId) }),
  };

  const jobs = await uploadService.listJobs(tenantId, filters);
  res.json({ jobs });
});

// Parts
export const addPart = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { jobId } = req.params;
  const part = await uploadService.addPart(tenantId, jobId, req.body);
  res.status(201).json({
    message: 'Upload part registered successfully',
    part,
  });
});

// Validations
export const addValidation = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { jobId } = req.params;
  const validation = await uploadService.addValidation(tenantId, jobId, req.body);
  res.status(201).json({
    message: 'Validation finding logged successfully',
    validation,
  });
});

// Events
export const addEvent = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { jobId } = req.params;
  const event = await uploadService.addEvent(tenantId, jobId, req.body);
  res.status(201).json({
    message: 'Event logged successfully',
    event,
  });
});

// Artifacts
export const addArtifact = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { jobId } = req.params;
  const artifact = await uploadService.addArtifact(tenantId, jobId, req.body);
  res.status(201).json({
    message: 'Artifact registered successfully',
    artifact,
  });
});
