import response from '../utils/response.js';
import { ClientError } from '../exceptions/index.js';

const ErrorHandler = (err, req, res, next) => {
  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      status: 'failed',
      message: err.details[0].message,
    });
  }

  // Handle ClientError (NotFoundError, InvariantError)
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: err.statusCode === 404 ? 'fail' : 'failed',
      message: err.message,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kegagalan pada server kami',
  });
};

export default ErrorHandler;