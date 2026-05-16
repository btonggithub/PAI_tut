const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Not Found',
    },
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
