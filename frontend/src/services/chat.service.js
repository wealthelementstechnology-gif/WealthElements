import api from './api';

/**
 * Send a message to the AI and get a response.
 * Returns { message, model } on success.
 * Throws on error.
 */
const sendMessage = async ({ message, history = [] }) => {
  const response = await api.post('/chat', { message, history });
  return {
    message: response.data.message,
    model: response.data.model,
  };
};

export default { sendMessage };
