const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { chat, getProactiveInsight } = require('../../controllers/chat.controller');

// POST /api/v1/chat
router.post('/', protect, chat);

// GET /api/v1/chat/insight
router.get('/insight', protect, getProactiveInsight);

module.exports = router;
