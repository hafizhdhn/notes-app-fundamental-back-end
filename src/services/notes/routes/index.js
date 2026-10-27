import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNoteById,
  editNoteById,
  deleteNoteById,
} from '../controller/note-controller.js';
import { validate, validateQuery } from '../../../middlewares/validate.js';
import {
  notePayloadSchema,
  noteQuerySchema,
} from '../validator/schema.js';

const router = Router();

// Pasang middleware validate di POST dan PUT, serta validateQuery di GET
router.post('/notes', validate(notePayloadSchema), createNote);
router.get('/notes', validateQuery(noteQuerySchema), getNotes);
router.get('/notes/:id', getNoteById);
router.put('/notes/:id', validate(notePayloadSchema), editNoteById);
router.delete('/notes/:id', deleteNoteById);

export default router;