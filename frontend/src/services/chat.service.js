import api from './api';

/**
 * Send a message to the AI and get a response.
 * Returns { message, model } on success.
 * Throws on error.
 */
const sendMessage = async ({ message, history = [], language_code }) => {
  const response = await api.post('/chat', { message, history, language_code });
  return {
    message: response.data.message,
    model: response.data.model,
    language_code: response.data.language_code,
  };
};

export default { sendMessage };
