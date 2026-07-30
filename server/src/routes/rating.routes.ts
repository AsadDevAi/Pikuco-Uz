import { Router } from 'express';
import * as ratingController from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createRatingSchema } from '../schemas/validation.schemas';

const router = Router();

router.post('/', authenticate, validate(createRatingSchema), ratingController.upsertRating);
router.get('/mine', authenticate, ratingController.getUserRating);

export default router;
