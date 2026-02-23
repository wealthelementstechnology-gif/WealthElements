const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getProfile, updateProfile, updateOnboarding } = require('../../controllers/profile.controller');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/onboarding', updateOnboarding);

module.exports = router;
