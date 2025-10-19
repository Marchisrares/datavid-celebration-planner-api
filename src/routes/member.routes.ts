import { Router } from 'express';
import { memberController } from '../controllers/member.controller';

const router = Router();

router.get('/', (req, res, next) => memberController.getAll(req, res, next));
router.get('/:id', (req, res, next) => memberController.getById(req, res, next));
router.post('/', (req, res, next) => memberController.create(req, res, next));
router.put('/:id', (req, res, next) => memberController.update(req, res, next));
router.delete('/:id', (req, res, next) => memberController.delete(req, res, next));

export default router;
