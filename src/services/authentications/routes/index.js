import { Router } from 'express';
import {
  postAuthenticationHandler,
  putAuthenticationHandler,
  deleteAuthenticationHandler,
} from '../controller/authentication-controller.js';
import validate from '../../../middlewares/validate.js';
import {
  postAuthenticationPayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
} from '../validator/schema.js';

const router = Router();

router.post('/', validate(postAuthenticationPayloadSchema), postAuthenticationHandler);
router.put('/', validate(putAuthenticationPayloadSchema), putAuthenticationHandler);
router.delete('/', validate(deleteAuthenticationPayloadSchema), deleteAuthenticationHandler);

export default router;