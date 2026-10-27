import NoteRepositories from '../repositories/note-repositories.js';
import { InvariantError, NotFoundError } from '../../../exceptions/index.js';
import response from '../../../utils/response.js';

export const createNote = async (req, res, next) => {
  try {
    const { title = 'untitled', body = '', tags = [] } = req.validated || req.body;
    const note = await NoteRepositories.createNote({
      title,
      body,
      tags,
    });

    if (!note) {
      return next(new InvariantError('Catatan gagal ditambahkan'));
    }

    return response(res, 201, 'Catatan berhasil ditambahkan', {
      noteId: note.id,
      ...note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const notes = await NoteRepositories.getNotes();

    return res.status(200).json({
      status: 'success',
      data: {
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await NoteRepositories.getNoteById(id);

    if (!note) {
      return next(new NotFoundError('Catatan tidak ditemukan'));
    }

    return response(res, 200, 'Catatan sukses ditampilkan', { note });
  } catch (error) {
    next(error);
  }
};

export const editNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, body, tags } = req.validated || req.body;

    const note = await NoteRepositories.editNote({
      id,
      title,
      body,
      tags,
    });

    if (!note) {
      return next(new NotFoundError('Catatan tidak ditemukan'));
    }

    return response(res, 200, 'Catatan berhasil diperbarui', note);
  } catch (error) {
    next(error);
  }
};

export const deleteNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedNote = await NoteRepositories.deleteNote(id);

    if (!deletedNote) {
      return next(new NotFoundError('Catatan tidak ditemukan'));
    }

    return response(res, 200, 'Catatan berhasil dihapus', deletedNote);
  } catch (error) {
    next(error);
  }
};