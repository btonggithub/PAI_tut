const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('../../config/env');

const registerSecurity = (app) => {
  app.use(helmet());
  app.use(cors({
    origin: env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};

module.exports = registerSecurity;
