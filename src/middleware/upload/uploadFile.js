const multer = require('multer');
const os = require('os');
const path = require('path');
const AppError = require('../../utils/AppError');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError(`File type not allowed: ${file.mimetype}`, 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

const uploadFile = (fieldName = 'file') => {
  return (req, res, next) => {
    const handler = upload.single(fieldName);

    handler(req, res, (err) => {
      if (!err) {
        if (!req.file) {
          return next(new AppError('File is required', 400));
        }
        return next();
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File exceeds maximum allowed size', 400));
      }

      if (err.isOperational) {
        return next(err);
      }

      return next(new AppError('File upload failed', 400));
    });
  };
};

module.exports = uploadFile;
module.exports.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;
