const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const adminResourceIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required(),
}).required();

const adminListFilesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  ownerId: Joi.string().pattern(objectIdPattern),
  status: Joi.string().valid('active', 'pending', 'deleted'),
  mimeType: Joi.string().trim(),
  extension: Joi.string().trim(),
}).required();

module.exports = {
  adminResourceIdParamSchema,
  adminListFilesQuerySchema,
};