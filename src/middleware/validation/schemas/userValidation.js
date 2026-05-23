const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const userIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required(),
}).required();

const updateMeBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email(),
})
  .or('name', 'email')
  .required()
  .unknown(false);

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  name: Joi.string().trim(),
  email: Joi.string().email(),
}).required();

module.exports = {
  userIdParamSchema,
  updateMeBodySchema,
  listUsersQuerySchema,
};
