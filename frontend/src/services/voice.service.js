import api from './api';

const voiceService = {
  // Send recorded audio blob → get transcript + detected language
  speechToText: async (audioBlob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'audio.webm');
    const { data } = await api.post('/chat/stt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return data; // { transcript, language_code }
  },

  // Send AI reply text → get base64 mp3
  textToSpeech: async (text, languageCode) => {
    const { data } = await api.post('/chat/tts', {
      text,
      language_code: languageCode || undefined,
    }, { timeout: 30000 });
    return data; // { audio (base64), language_code }
  },
};

export default voiceService;
