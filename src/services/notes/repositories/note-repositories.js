import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { AuthorizationError, NotFoundError } from '../../../exceptions/index.js';
import collaborationRepositories from '../../collaborations/repositories/collaboration-repositories.js';

class NoteRepositories {
  constructor() {
    this._pool = new Pool();
     this.collaborationRepositories = collaborationRepositories;
  }

  async createNote({ title, body, tags, owner = null }) {
    const id = `note-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes(id, title, body, tags, created_at, updated_at, owner) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, body, tags, created_at, updated_at, owner',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this._pool.query(query);
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: row.owner,
    };
  }

  async getNotes(owner = null, titleQuery = null) {
    const query = {
text: `SELECT notes.* FROM notes
LEFT JOIN collaborations ON collaborations.note_id = notes.id
WHERE notes.owner = $1 OR collaborations.user_id = $1
GROUP BY notes.id`,
values: [owner],
};
const result = await this.pool.query(query);
return result.rows;
  }

  async getNoteById(id) {
   const query = {
text:`SELECT notes.*, users.username
FROM notes
LEFT JOIN users ON users.id = notes.owner
WHERE notes.id = $1`,
values: [id],
};
const result = await this.pool.query(query);
return result.rows[0];
  }

  async editNote({ id, title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id, title, body, tags, created_at, updated_at, owner',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: row.owner,
    };
  }

  async deleteNote(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = result.rows[0];
    // Jika catatan memiliki owner dan berbeda dengan user yang sedang akses, lempar AuthorizationError (403)
    if (note.owner && owner && note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
  const ownerResult = await this.verifyNoteOwner(noteId, userId);
 
  if (ownerResult) {
    return ownerResult;
  }
 
  const result =  await this.collaborationRepositories.verifyCollaborator(noteId, userId);
 
  return result;
}

async getUsersByUsername(username) {
  const query = {
    text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
    values: [`%${username}%`],
  };

  const result = await this._pool.query(query);
  return result.rows;
}
}

export default new NoteRepositories();