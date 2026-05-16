const express = require('express');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/health', healthRoutes);

const registerRoutes = (app) => {
  app.use('/api/v1', router);
};

module.exports = registerRoutes;
