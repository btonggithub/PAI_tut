const express = require('express');
const protect = require('../middleware/auth/protect');
const requirePermission = require('../middleware/auth/requirePermission');
const validateRequest = require('../middleware/validation/validateRequest');
const adminController = require('../controllers/admin/adminController');
const { USER_PERMISSIONS } = require('../permissions');
const { listUsersQuerySchema } = require('../middleware/validation/schemas/userValidation');
const { systemQuerySchema } = require('../middleware/validation/schemas/systemValidation');
const {
  adminResourceIdParamSchema,
  adminListFilesQuerySchema,
} = require('../middleware/validation/schemas/adminValidation');

const router = express.Router();

router.use(protect, requirePermission(USER_PERMISSIONS.MANAGE));

router.get('/users', validateRequest({ query: listUsersQuerySchema }), adminController.listUsers);
router.get('/users/:id', validateRequest({ params: adminResourceIdParamSchema }), adminController.getUserById);
router.get('/files', validateRequest({ query: adminListFilesQuerySchema }), adminController.listFiles);
router.get('/files/:id', validateRequest({ params: adminResourceIdParamSchema }), adminController.getFileById);
router.get('/system', validateRequest({ query: systemQuerySchema }), adminController.getSystemInfo);

module.exports = router;