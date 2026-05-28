const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['user', 'admin'],
      default: null,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      default: null,
    },
    resourceId: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      required: true,
      enum: ['succeeded', 'failed', 'forbidden'],
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for audit event retrieval by actor and result
auditLogSchema.index({ actorId: 1, result: 1, createdAt: -1 });

// Index for audit event retrieval by action
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

