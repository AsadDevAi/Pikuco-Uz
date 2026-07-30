import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPostSchema } from '../schemas/validation.schemas';

const router = Router();

router.get('/', optionalAuth, postController.getPosts);
router.post('/', authenticate, validate(createPostSchema), postController.createPost);
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

export default router;
