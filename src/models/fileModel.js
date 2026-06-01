const mongoose = require('mongoose');

const FILE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  DELETED: 'deleted',
};

const fileSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    extension: {
      type: String,
      default: '',
    },
    storageKey: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      default: 'local',
    },
    status: {
      type: String,
      enum: Object.values(FILE_STATUS),
      default: FILE_STATUS.ACTIVE,
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

const File = mongoose.models.File || mongoose.model('File', fileSchema);

module.exports = File;
module.exports.FILE_STATUS = FILE_STATUS;
