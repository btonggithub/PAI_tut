const Joi = require('joi');

const systemQuerySchema = Joi.object({
  scope: Joi.string().valid('basic').optional(),
}).required();

module.exports = {
  systemQuerySchema,
};
