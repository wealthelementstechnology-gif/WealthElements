const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { chat, getProactiveInsight } = require('../../controllers/chat.controller');
const { speechToText, textToSpeech } = require('../../controllers/voice.controller');

// Multer: accept audio in memory, max 10 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) return cb(null, true);
    cb(new Error('Only audio files are accepted'));
  },
});

// POST /api/v1/chat
router.post('/', protect, chat);

// GET /api/v1/chat/insight
router.get('/insight', protect, getProactiveInsight);

// POST /api/v1/chat/stt  — audio file → transcript
router.post('/stt', protect, upload.single('audio'), speechToText);

// POST /api/v1/chat/tts  — { text, language_code? } → base64 mp3
router.post('/tts', protect, textToSpeech);

module.exports = router;
