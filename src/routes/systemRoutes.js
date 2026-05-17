const express = require('express');
const { getSystemInfo } = require('../controllers/system/systemController');
const validateRequest = require('../middleware/validation/validateRequest');
const { systemQuerySchema } = require('../middleware/validation/schemas/systemValidation');

const router = express.Router();

router.get('/', validateRequest({ query: systemQuerySchema }), getSystemInfo);

module.exports = router;
