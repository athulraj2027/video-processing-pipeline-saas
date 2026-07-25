import { Router } from 'express';
import { addValidation } from '../controllers/upload.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { createUploadValidationSchema } from '../schemas/upload.schema.js';

const router = Router({ mergeParams: true });

// Log validation check findings
router.post('/', validateBody(createUploadValidationSchema), addValidation);

export default router;
