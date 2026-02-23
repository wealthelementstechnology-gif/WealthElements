const express = require('express');
const router = express.Router();
const { seedDemoData, clearDemoData } = require('../../controllers/seed.controller');
const { protect } = require('../../middleware/auth');

router.post('/demo-data', protect, seedDemoData);
router.delete('/demo-data', protect, clearDemoData);

module.exports = router;
