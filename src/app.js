const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const registerRoutes = require('./routes');
const registerSecurity = require('./middleware/security/registerSecurity');
const AppError = require('./utils/AppError');

const app = express();

registerSecurity(app);

registerRoutes(app);

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(new AppError('Not Found', 404));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
