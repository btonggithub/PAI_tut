const AppError = require('../../utils/AppError');

const buildErrorMessage = (segment, details) => {
  const reason = details.map((item) => item.message.replace(/"/g, '')).join('; ');
  return `${segment} validation failed: ${reason}`;
};

const validateRequest = (schema = {}) => {
  return (req, res, next) => {
    const segments = ['body', 'query', 'params'];

    for (const segment of segments) {
      if (!schema[segment]) {
        continue;
      }

      const { error, value } = schema[segment].validate(req[segment], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return next(new AppError(buildErrorMessage(segment, error.details), 400));
      }

      req[segment] = value;
    }

    return next();
  };
};

module.exports = validateRequest;
