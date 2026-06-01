const express = require('express');
const healthRoutes = require('./healthRoutes');
const systemRoutes = require('./systemRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const fileRoutes = require('./fileRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/system', systemRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);

const registerRoutes = (app) => {
  app.use('/api/v1', router);
};

module.exports = registerRoutes;
