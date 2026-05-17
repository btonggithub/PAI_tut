const express = require('express');
const { getHealth } = require('../controllers/health/healthController');

const router = express.Router();

router.get('/', getHealth);

module.exports = router;
