const express = require('express');
const healthRoutes = require('./healthRoutes');
const systemRoutes = require('./systemRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const fileRoutes = require('./fileRoutes');
const emailRoutes = require('./emailRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/system', systemRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
router.use('/email', emailRoutes);
router.use('/admin', adminRoutes);

const registerRoutes = (app) => {
  app.use('/api/v1', router);
};

module.exports = registerRoutes;
