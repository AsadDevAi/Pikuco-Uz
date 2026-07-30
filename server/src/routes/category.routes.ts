import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema } from '../schemas/validation.schemas';

const router = Router();

router.get('/', categoryController.getCategories);
router.post('/', authenticate, validate(createCategorySchema), categoryController.createCategory);

export default router;
