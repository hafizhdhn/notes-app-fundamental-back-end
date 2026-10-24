import express from 'express';
import {
  createNote,
  getAllNotes,
  getNoteById,
  editNoteById,
  deleteNoteById,
} from '../controller/note-controller.js';
import { validate, validateQuery } from '../../../middlewares/validate.js';
import {
  notePayloadSchema,
  noteQuerySchema,
} from '../validator/schema.js';

const router = express.Router();

router.post('/notes', validate(notePayloadSchema), createNote);
router.get('/notes', validateQuery(noteQuerySchema), getAllNotes); // Hanya satu baris ini
router.get('/notes/:id', getNoteById);
router.put('/notes/:id', validate(notePayloadSchema), editNoteById);
router.delete('/notes/:id', deleteNoteById);

export default router;