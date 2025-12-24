const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/', authenticate, authorize(['owner']), userController.getAllUsers);
router.put('/:userId/role', authenticate, authorize(['owner']), userController.updateUserRole);

module.exports = router;
