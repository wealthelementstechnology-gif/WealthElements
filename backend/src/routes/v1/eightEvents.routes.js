const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { savePlan, getPlan } = require('../../controllers/eightEvents.controller');

router.use(protect);

router.get('/', getPlan);
router.post('/', savePlan);

module.exports = router;
