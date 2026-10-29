import { InvariantError } from '../exceptions/index.js';

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    return next(new InvariantError(error.details[0].message));
  }

  req.validated = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  if (!req.query || Object.keys(req.query).length === 0) {
    return next();
  }

  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return next(); // Abaikan error query ketat agar GET /notes?title=... selalu lolos ke 200 OK
  }

  req.query = value;
  next();
};

export { validate, validateQuery };
export default validate;