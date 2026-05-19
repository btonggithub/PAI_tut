const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const registerSecurity = (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};

module.exports = registerSecurity;
