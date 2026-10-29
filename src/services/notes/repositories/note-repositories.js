import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { AuthorizationError, NotFoundError } from '../../../exceptions/index.js';

class NoteRepositories {
  constructor() {
    this._pool = new Pool();
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
    let text = 'SELECT id, title, body, tags, created_at, updated_at, owner FROM notes';
    const values = [];
    const conditions = [];

    // Jika di folder Authorizations (bukan folder Notes umum), filter berdasarkan owner
    if (owner) {
      values.push(owner);
      conditions.push(`owner = $${values.length}`);
    }

    if (titleQuery) {
      const queryTitle = Array.isArray(titleQuery) ? titleQuery[0] : titleQuery;
      values.push(`%${queryTitle}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (conditions.length > 0) {
      text += ` WHERE ${conditions.join(' AND ')}`;
    }

    const query = { text, values };
    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: row.owner,
    }));
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT id, title, body, tags, created_at, updated_at, owner FROM notes WHERE id = $1',
      values: [id],
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
}

export default new NoteRepositories();