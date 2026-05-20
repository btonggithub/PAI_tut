const express = require('express');
const protect = require('../middleware/auth/protect');
const validateRequest = require('../middleware/validation/validateRequest');
const userController = require('../controllers/user/userController');
const {
  userIdParamSchema,
  updateMeBodySchema,
  listUsersQuerySchema,
} = require('../middleware/validation/schemas/userValidation');

const router = express.Router();

router.get('/me', protect, userController.getMe);
router.patch('/me', validateRequest({ body: updateMeBodySchema }), protect, userController.updateMe);
router.get('/', validateRequest({ query: listUsersQuerySchema }), protect, userController.listUsers);
router.get('/:id', validateRequest({ params: userIdParamSchema }), protect, userController.getUserById);

module.exports = router;
