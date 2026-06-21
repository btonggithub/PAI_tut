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

const adminAuditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  action: Joi.string().trim(),
  result: Joi.string().valid('succeeded', 'failed', 'forbidden'),
  actorId: Joi.alternatives().try(
    Joi.string().pattern(objectIdPattern),
    Joi.string().trim().min(1)
  ),
  actorRole: Joi.string().valid('user', 'admin'),
  resourceType: Joi.string().trim(),
  resourceId: Joi.string().trim(),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref('from')),
}).required();

module.exports = {
  adminResourceIdParamSchema,
  adminListFilesQuerySchema,
  adminAuditLogsQuerySchema,
};
