import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

class UserRepositories {
  constructor() {
    this._pool = new Pool();
  }

  async createUser({ username, password, fullname }) {
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, username, hashedPassword, fullname, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    return {
      userId: result.rows[0].id,
      id: result.rows[0].id,
    };
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getUserByUsername(username) {
    const query = {
      text: 'SELECT id, username, password, fullname FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

export default new UserRepositories();