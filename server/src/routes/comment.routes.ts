import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommentSchema } from '../schemas/validation.schemas';

const router = Router();

router.get('/', commentController.getComments);
router.post('/', authenticate, validate(createCommentSchema), commentController.createComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;
