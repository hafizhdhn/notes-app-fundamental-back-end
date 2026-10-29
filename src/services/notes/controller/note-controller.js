import NoteRepositories from '../repositories/note-repositories.js';
import { InvariantError, NotFoundError } from '../../../exceptions/index.js';
import response from '../../../utils/response.js';

export const createNote = async (req, res, next) => {
  try {
    const { title = 'untitled', body = '', tags = [] } = req.validated || req.body;
    const owner = req.user ? req.user.id : null;

    const note = await NoteRepositories.createNote({
      title,
      body,
      tags,
      owner,
    });

    if (!note) {
      return next(new InvariantError('Catatan gagal ditambahkan'));
    }

    return response(res, 201, 'Catatan berhasil ditambahkan', {
      noteId: note.id,
      id: note.id,
      ...note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    // Di folder notes umum, getNotes() mengambil semua catatan. 
    // Di folder authorizations, req.user membawa kredensial owner.
    const owner = req.headers['authorization'] && req.user ? req.user.id : null;
    const { title } = req.query;
    const notes = await NoteRepositories.getNotes(owner, title);

    const formattedNotes = notes.map((n) => ({
      id: n.id,
      title: n.title,
      tags: n.tags,
    }));

    return response(res, 200, 'success', { notes: formattedNotes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = req.user ? req.user.id : null;

    if (owner) {
      await NoteRepositories.verifyNoteOwner(id, owner);
    }

    const note = await NoteRepositories.getNoteById(id);
    return response(res, 200, 'Catatan sukses ditampilkan', { note });
  } catch (error) {
    next(error);
  }
};

export const editNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = req.user ? req.user.id : null;
    const { title, body, tags } = req.validated || req.body;

    if (owner) {
      await NoteRepositories.verifyNoteOwner(id, owner);
    }

    const note = await NoteRepositories.editNote({ id, title, body, tags });
    return response(res, 200, 'Catatan berhasil diperbarui', note);
  } catch (error) {
    next(error);
  }
};

export const deleteNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = req.user ? req.user.id : null;

    if (owner) {
      await NoteRepositories.verifyNoteOwner(id, owner);
    }

    await NoteRepositories.deleteNote(id);
    return response(res, 200, 'Catatan berhasil dihapus');
  } catch (error) {
    next(error);
  }
};