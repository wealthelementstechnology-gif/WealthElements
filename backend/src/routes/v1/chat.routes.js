const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { chat } = require('../../controllers/chat.controller');

// POST /api/v1/chat
router.post('/', protect, chat);

module.exports = router;
