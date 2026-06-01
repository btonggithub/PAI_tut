const Joi = require('joi');

const sendVerificationBodySchema = Joi.object({}).required();

const verifyQuerySchema = Joi.object({
  token: Joi.string().trim().required(),
}).required();

const resendVerificationBodySchema = Joi.object({}).required();

module.exports = {
  sendVerificationBodySchema,
  verifyQuerySchema,
  resendVerificationBodySchema,
};
