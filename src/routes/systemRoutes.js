const express = require('express');
const { getSystemInfo } = require('../controllers/system/systemController');

const router = express.Router();

router.get('/', getSystemInfo);

module.exports = router;
