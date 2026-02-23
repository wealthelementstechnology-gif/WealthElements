const { body } = require('express-validator');

const phoneRule = body('phone')
  .trim()
  .notEmpty().withMessage('Phone number is required')
  .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number');

const passwordRule = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

const checkPhoneValidation = [phoneRule];

const registerValidation = [phoneRule, passwordRule];

const loginValidation = [phoneRule, passwordRule];

module.exports = {
  checkPhoneValidation,
  registerValidation,
  loginValidation,
};
