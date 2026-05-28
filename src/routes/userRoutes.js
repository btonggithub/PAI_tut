const express = require('express');
const protect = require('../middleware/auth/protect');
const requirePermission = require('../middleware/auth/requirePermission');
const validateRequest = require('../middleware/validation/validateRequest');
const userController = require('../controllers/user/userController');
const { USER_PERMISSIONS } = require('../permissions');
const {
  userIdParamSchema,
  updateMeBodySchema,
  listUsersQuerySchema,
} = require('../middleware/validation/schemas/userValidation');

const router = express.Router();

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, validateRequest({ body: updateMeBodySchema }), userController.updateMe);
router.get('/', protect, requirePermission(USER_PERMISSIONS.READ), validateRequest({ query: listUsersQuerySchema }), userController.listUsers);
router.get('/:id', protect, requirePermission(USER_PERMISSIONS.READ), validateRequest({ params: userIdParamSchema }), userController.getUserById);

module.exports = router;
