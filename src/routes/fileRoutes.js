const express = require('express');
const protect = require('../middleware/auth/protect');
const uploadFile = require('../middleware/upload/uploadFile');
const fileController = require('../controllers/file/fileController');

const router = express.Router();

router.post('/', protect, uploadFile('file'), fileController.uploadFile);
router.get('/', protect, fileController.listFiles);
router.get('/:id', protect, fileController.getFile);

module.exports = router;
