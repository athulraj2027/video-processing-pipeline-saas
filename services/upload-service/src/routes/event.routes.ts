import { Router } from 'express';
import { addEvent } from '../controllers/upload.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { createUploadEventSchema } from '../schemas/upload.schema.js';

const router = Router({ mergeParams: true });

// Audit and progress tracking events log
router.post('/', validateBody(createUploadEventSchema), addEvent);

export default router;
