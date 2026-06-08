const express = require('express');
const validateRequest = require('../middleware/validation/validateRequest');
const protect = require('../middleware/auth/protect');
const emailController = require('../controllers/email/emailController');
const {
  sendVerificationBodySchema,
  verifyQuerySchema,
  resendVerificationBodySchema,
} = require('../middleware/validation/schemas/emailValidation');

const router = express.Router();

// POST /send-verification and /resend-verification require authentication.
// GET /verify is intentionally public — token is self-identifying.
router.post(
  '/send-verification',
  protect,
  validateRequest({ body: sendVerificationBodySchema }),
  emailController.sendVerification
);

router.get(
  '/verify',
  validateRequest({ query: verifyQuerySchema }),
  emailController.verify
);

router.post(
  '/resend-verification',
  protect,
  validateRequest({ body: resendVerificationBodySchema }),
  emailController.resendVerification
);

module.exports = router;
