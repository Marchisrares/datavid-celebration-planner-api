import { Router } from 'express';
import { birthdayController } from '../controllers/birthday.controller';

const router = Router();

router.get('/upcoming', (req, res, next) => birthdayController.getUpcoming(req, res, next));
router.get('/today', (req, res, next) => birthdayController.getToday(req, res, next));

export default router;
