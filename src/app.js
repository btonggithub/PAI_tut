const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const registerRoutes = require('./routes');
const docsRoutes = require('./routes/docsRoutes');
const registerSecurity = require('./middleware/security/registerSecurity');
const attachRequestContext = require('./middleware/requestContext');
const { bootstrapInternalEvents } = require('./services/event');
const AppError = require('./utils/AppError');

const app = express();

registerSecurity(app);

app.use(attachRequestContext);

bootstrapInternalEvents();

app.use('/api', docsRoutes);

registerRoutes(app);

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(new AppError('Not Found', 404));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
