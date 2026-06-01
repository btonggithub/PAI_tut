const multer = require('multer');
const os = require('os');
const path = require('path');
const AppError = require('../../utils/AppError');
const { UPLOAD_CONFIG } = require('../../config/upload');

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
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError(`File type not allowed: ${file.mimetype}`, 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
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
