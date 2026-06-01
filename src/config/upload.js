/**
 * Upload Configuration
 *
 * Centralized configuration for file upload handling.
 */

const STORAGE_PROVIDERS = {
  LOCAL: 'local',
};

const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
  uploadDirectory: 'uploads',
};

module.exports = {
  STORAGE_PROVIDERS,
  UPLOAD_CONFIG,
};
