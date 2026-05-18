const express = require('express');
const validateRequest = require('../middleware/validation/validateRequest');
const protect = require('../middleware/auth/protect');
const authController = require('../controllers/auth/authController');
const {
  registerBodySchema,
  loginBodySchema,
} = require('../middleware/validation/schemas/authValidation');

const router = express.Router();

router.post('/register', validateRequest({ body: registerBodySchema }), authController.register);
router.post('/login', validateRequest({ body: loginBodySchema }), authController.login);
router.get('/me', protect, authController.me);

module.exports = router;
