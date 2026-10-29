import UserRepositories from '../repositories/user-repositories.js';
import { InvariantError, NotFoundError } from '../../../exceptions/index.js';
import response from '../../../utils/response.js';

export const postUserHandler = async (req, res, next) => {
  try {
    const { username, password, fullname } = req.body;

    const isUsernameExist = await UserRepositories.verifyNewUsername(username);
    if (isUsernameExist) {
      return next(new InvariantError('Gagal menambahkan user. Username sudah digunakan.'));
    }

    const user = await UserRepositories.createUser({ username, password, fullname });

    return response(res, 201, 'User berhasil ditambahkan', {
      userId: user.userId,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserRepositories.getUserById(id);

    if (!user) {
      return next(new NotFoundError('User tidak ditemukan'));
    }

    return response(res, 200, 'success', {
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    next(error);
  }
};