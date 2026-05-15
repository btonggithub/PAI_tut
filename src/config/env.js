const dotenv = require('dotenv');
const Joi = require('joi');

// dotenv.config();
const path = require('path');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const nodeEnv = process.env.NODE_ENV || 'development';

// Build schema based on environment
const buildSchema = (env) => {
  const isProduction = env === 'production';
  const isDevelopment = env === 'development';

  return Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number()
      .integer()
      .min(1)
      .max(65535)
      .default(isProduction ? 8080 : 3000),
    MONGO_URI: isProduction
      ? Joi.string().uri({ scheme: [/mongodb(\+srv)?/] }).required()
      : Joi.string().uri({ scheme: [/mongodb(\+srv)?/] }).default('mongodb://localhost:27017/dev'),
    JWT_SECRET: isProduction
      ? Joi.string().min(32).required()
      : Joi.string().min(16).default('dev-secret-key-change-in-production'),
    JWT_REFRESH_SECRET: isProduction
      ? Joi.string().min(32).required()
      : Joi.string().min(16).default('dev-refresh-secret-key-change-in-production'),
  })
    .unknown(true)
    .required();
};

const schema = buildSchema(nodeEnv);

const { error, value } = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  // const details = error.details
  //   .map((item) => item.message.replace(/"/g, ''))
  //   .join('; ');

  const details = error.details
  .map((item) => `• ${item.path.join('.')}: ${item.message}`)
  .join('\n');

  throw new Error(`Environment validation error: ${details}`);
}

const env = {
  NODE_ENV: value.NODE_ENV || nodeEnv,
  PORT: value.PORT,
  MONGO_URI: value.MONGO_URI,
  JWT_SECRET: value.JWT_SECRET,
  JWT_REFRESH_SECRET: value.JWT_REFRESH_SECRET,
  isDevelopment: (value.NODE_ENV || nodeEnv) === 'development',
  isProduction: (value.NODE_ENV || nodeEnv) === 'production',
  isTest: (value.NODE_ENV || nodeEnv) === 'test',
};

// module.exports = env;
module.exports = Object.freeze(env);
