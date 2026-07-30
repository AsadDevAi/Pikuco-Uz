import { Router } from 'express';
import * as testController from '../controllers/test.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTestSchema } from '../schemas/validation.schemas';

const router = Router();

router.get('/', optionalAuth, testController.getTests);
router.post('/', authenticate, validate(createTestSchema), testController.createTest);
router.get('/:id', optionalAuth, testController.getTestById);
router.put('/:id', authenticate, testController.updateTest);
router.delete('/:id', authenticate, testController.deleteTest);
router.get('/:id/stats', testController.getTestStats);
router.post('/:id/submit/quiz', optionalAuth, testController.submitQuiz);
router.post('/:id/submit/identification', optionalAuth, testController.submitIdentification);
router.post('/:id/submit/tournament', optionalAuth, testController.submitTournament);
router.post('/:id/submit/tree', optionalAuth, testController.submitTree);

export default router;
