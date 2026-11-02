import { Router } from 'express';
import { postUserHandler, getUserByIdHandler, getUsersByUsername } from '../controllers/user-controller.js';
import validate from '../../../middlewares/validate.js';
import { userPayloadSchema } from '../validator/schema.js';

const router = Router();

router.post('/', validate(userPayloadSchema), postUserHandler);
router.get('/:id', getUserByIdHandler);
router.get('/users', getUsersByUsername);

export default router;