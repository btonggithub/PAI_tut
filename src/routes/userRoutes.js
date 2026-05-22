const express = require('express');
const protect = require('../middleware/auth/protect');
const authorize = require('../middleware/auth/authorize');
const validateRequest = require('../middleware/validation/validateRequest');
const userController = require('../controllers/user/userController');
const {
  userIdParamSchema,
  updateMeBodySchema,
  listUsersQuerySchema,
} = require('../middleware/validation/schemas/userValidation');

const router = express.Router();

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, validateRequest({ body: updateMeBodySchema }), userController.updateMe);
router.get('/', protect, authorize('admin'), validateRequest({ query: listUsersQuerySchema }), userController.listUsers);
router.get('/:id', protect, authorize('admin'), validateRequest({ params: userIdParamSchema }), userController.getUserById);

module.exports = router;
