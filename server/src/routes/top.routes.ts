import { Router } from 'express';
import * as topController from '../controllers/top.controller';

const router = Router();

router.get('/users', topController.getTopUsers);
router.get('/tests', topController.getTopTests);
router.get('/posts', topController.getTopPosts);
router.get('/squads', topController.getTopSquads);

export default router;
