import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:username', userController.getUserProfile);
router.patch('/me/profile', authenticate, userController.updateProfile);
router.post('/me/avatar', authenticate, ...userController.uploadAvatar);

export default router;
