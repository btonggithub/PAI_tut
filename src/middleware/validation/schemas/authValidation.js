const Joi = require('joi');

const registerBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).required();

const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).required();

module.exports = {
  registerBodySchema,
  loginBodySchema,
};
