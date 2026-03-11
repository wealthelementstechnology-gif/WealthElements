const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

const SARVAM_KEY = process.env.SARVAM_API_KEY;
const STT_URL = 'https://api.sarvam.ai/speech-to-text';
const TTS_URL = 'https://api.sarvam.ai/text-to-speech';

// ─── Detect language from text (for TTS language_code selection) ──────────────
// Returns BCP-47 code based on Unicode script ranges
const detectLanguageCode = (text) => {
  // Devanagari (Hindi + Marathi share the same script)
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  // Check for Marathi-specific words (common markers)
  const marathiWords = /\b(आहे|आणि|मला|तुमचा|माझ्या|केले|असेल|होते|नाही)\b/;
  const isMarathi = devanagari > 0 && marathiWords.test(text);
  if (isMarathi) return 'mr-IN';
  if (devanagari > 2) return 'hi-IN';

  // Latin script → Indian English
  return 'en-IN';
};

// ─── Speech-to-Text ────────────────────────────────────────────────────────────
// POST /api/v1/chat/stt
// Accepts multipart/form-data with field "audio" (webm/wav blob)
const speechToText = async (req, res) => {
  try {
    if (!SARVAM_KEY || SARVAM_KEY === 'your_sarvam_api_key_here') {
      return res.status(503).json({
        success: false,
        message: 'Voice feature not configured. Add SARVAM_API_KEY to backend .env',
      });
    }

    const audioBuffer = req.file?.buffer;
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ success: false, message: 'No audio received.' });
    }

    const mimeType = req.file?.mimetype || 'audio/webm';
    const extension = mimeType.includes('wav') ? 'wav' : 'webm';

    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: `audio.${extension}`,
      contentType: mimeType,
    });
    form.append('model', 'saaras:v3');
    form.append('mode', 'transcribe');
    // Omit language_code → Sarvam auto-detects Hindi / Marathi / English

    const sarvamRes = await fetch(STT_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await sarvamRes.json();

    if (!sarvamRes.ok) {
      console.error('Sarvam STT error:', data);
      return res.status(502).json({
        success: false,
        message: data?.message || 'Speech recognition failed. Please try again.',
      });
    }

    const transcript = data.transcript || '';
    const detectedLang = data.language_code || detectLanguageCode(transcript);

    return res.status(200).json({
      success: true,
      transcript,
      language_code: detectedLang,
    });
  } catch (err) {
    console.error('STT error:', err.message);
    return res.status(500).json({ success: false, message: 'Voice recognition failed.' });
  }
};

// ─── Text-to-Speech ────────────────────────────────────────────────────────────
// POST /api/v1/chat/tts
// Body: { text: string, language_code?: string }
// Returns: { audio: base64_mp3 }
const textToSpeech = async (req, res) => {
  try {
    if (!SARVAM_KEY || SARVAM_KEY === 'your_sarvam_api_key_here') {
      return res.status(503).json({
        success: false,
        message: 'Voice feature not configured. Add SARVAM_API_KEY to backend .env',
      });
    }

    let { text, language_code } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'text is required.' });
    }

    // Strip markdown so TTS sounds natural
    const plain = text
      .replace(/#{1,6}\s/g, '')          // headings
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
      .replace(/\*(.*?)\*/g, '$1')       // italic
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/[-*•]\s/g, '')           // list bullets
      .replace(/\n{2,}/g, '. ')          // paragraph breaks → pause
      .replace(/\n/g, ' ')
      .trim();

    // Sarvam TTS v3 max: 2500 chars per request
    const chunk = plain.slice(0, 2500);

    // Auto-detect language if not supplied
    const langCode = language_code || detectLanguageCode(chunk);

    // Valid voices for bulbul:v3 (confirmed from Sarvam API error response)
    const voiceMap = {
      'hi-IN': 'priya',   // Hindi female
      'mr-IN': 'priya',   // Marathi — same Devanagari model
      'en-IN': 'ritu',    // Indian English female
    };
    const speaker = voiceMap[langCode] || 'priya';

    const sarvamRes = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: chunk,
        target_language_code: langCode,
        speaker,
        model: 'bulbul:v3',
        pace: 1.0,
        output_audio_codec: 'mp3',
        enable_preprocessing: true,
      }),
    });

    const data = await sarvamRes.json();

    if (!sarvamRes.ok || !data.audios?.[0]) {
      console.error('Sarvam TTS error:', data);
      return res.status(502).json({
        success: false,
        message: data?.message || 'Text-to-speech failed. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      audio: data.audios[0], // base64 mp3
      language_code: langCode,
    });
  } catch (err) {
    console.error('TTS error:', err.message);
    return res.status(500).json({ success: false, message: 'Text-to-speech failed.' });
  }
};

module.exports = { speechToText, textToSpeech };
