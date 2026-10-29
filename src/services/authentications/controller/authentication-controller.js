import AuthenticationRepositories from '../repositories/authentication-repositories.js';
import UserRepositories from '../../users/repositories/user-repositories.js';
import { InvariantError, AuthenticationError } from '../../../exceptions/index.js';
import response from '../../../utils/response.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const postAuthenticationHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserRepositories.getUserByUsername(username);
    if (!user) {
      return next(new AuthenticationError('Kredensial yang Anda berikan salah'));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(new AuthenticationError('Kredensial yang Anda berikan salah'));
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY
    );

    await AuthenticationRepositories.addRefreshToken(refreshToken);

    return response(res, 201, 'Authentication berhasil ditambahkan', {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const putAuthenticationHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const isTokenExist = await AuthenticationRepositories.verifyRefreshToken(refreshToken);
    if (!isTokenExist) {
      return next(new InvariantError('Refresh token tidak valid'));
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decoded) => {
      if (err) {
        return next(new InvariantError('Refresh token tidak valid'));
      }

      const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: '30m' }
      );

      return response(res, 200, 'Access Token berhasil diperbarui', {
        accessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuthenticationHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const isTokenExist = await AuthenticationRepositories.verifyRefreshToken(refreshToken);
    if (!isTokenExist) {
      return next(new InvariantError('Refresh token tidak valid'));
    }

    await AuthenticationRepositories.deleteRefreshToken(refreshToken);

    return response(res, 200, 'Refresh token berhasil dihapus');
  } catch (error) {
    next(error);
  }
};
