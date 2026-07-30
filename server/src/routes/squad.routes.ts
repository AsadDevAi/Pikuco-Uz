import { Router } from 'express';
import * as squadController from '../controllers/squad.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createSquadSchema } from '../schemas/validation.schemas';

const router = Router();

router.get('/', squadController.getSquads);
router.post('/', authenticate, validate(createSquadSchema), squadController.createSquad);
router.get('/:id', squadController.getSquadById);
router.post('/:id/join', authenticate, squadController.joinSquad);
router.post('/leave', authenticate, squadController.leaveSquad);
router.post('/:id/avatar', authenticate, ...squadController.uploadSquadAvatar);

export default router;
