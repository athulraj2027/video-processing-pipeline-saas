import { Router } from 'express';
import { addPart } from '../controllers/upload.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { createUploadPartSchema } from '../schemas/upload.schema.js';

const router = Router({ mergeParams: true });

// Register part chunks for multipart uploads
router.post('/', validateBody(createUploadPartSchema), addPart);

export default router;
