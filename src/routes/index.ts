import { Router } from 'express';
import memberRoutes from './member.routes';
import birthdayRoutes from './birthday.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/members', memberRoutes);
router.use('/birthdays', birthdayRoutes);
router.use('/ai', aiRoutes);

export default router;
