const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  checkPhoneValidation,
  registerValidation,
  loginValidation,
} = require('../../validators/auth.validator');

// Public routes
router.post('/check-phone', validate(checkPhoneValidation), authController.checkPhone);
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
