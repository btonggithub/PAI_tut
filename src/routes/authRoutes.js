const express = require('express');
const validateRequest = require('../middleware/validation/validateRequest');
const protect = require('../middleware/auth/protect');
const authController = require('../controllers/auth/authController');
const {
  registerBodySchema,
  loginBodySchema,
  refreshBodySchema,
  logoutBodySchema,
} = require('../middleware/validation/schemas/authValidation');

const router = express.Router();

router.post('/register', validateRequest({ body: registerBodySchema }), authController.register);
router.post('/login', validateRequest({ body: loginBodySchema }), authController.login);
router.post('/refresh', validateRequest({ body: refreshBodySchema }), authController.refresh);
router.post('/logout', validateRequest({ body: logoutBodySchema }), authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;
