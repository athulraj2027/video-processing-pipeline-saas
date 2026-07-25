import { Router } from 'express';
import { addArtifact } from '../controllers/upload.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { createUploadArtifactSchema } from '../schemas/upload.schema.js';

const router = Router({ mergeParams: true });

// Register processed metadata or media files artifacts references
router.post('/', validateBody(createUploadArtifactSchema), addArtifact);

export default router;
