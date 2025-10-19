import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { aiController } from '../controllers/ai.controller';

const router = Router();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 30 // limit each IP to 30 requests per windowMs
});

router.post('/message', aiLimiter, (req, res, next) => aiController.generateMessage(req, res, next));

export default router;
