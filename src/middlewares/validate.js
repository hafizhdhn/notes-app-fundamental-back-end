const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) return next(error);
  req.validated = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  // Jika tidak ada query string, langsung lanjut ke controller
  if (!req.query || Object.keys(req.query).length === 0) {
    return next();
  }

  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) return next(error);
  req.validated = value;
  next();
};

export { validate, validateQuery };
export default validate;