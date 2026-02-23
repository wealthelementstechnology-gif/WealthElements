const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const accountsRoutes = require('./accounts.routes');
const transactionsRoutes = require('./transactions.routes');
const subscriptionsRoutes = require('./subscriptions.routes');
const goalsRoutes = require('./goals.routes');
const profileRoutes = require('./profile.routes');
const seedRoutes = require('./seed.routes');
const chatRoutes = require('./chat.routes');

router.use('/auth', authRoutes);
router.use('/accounts', accountsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/goals', goalsRoutes);
router.use('/profile', profileRoutes);
router.use('/seed', seedRoutes);
router.use('/chat', chatRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

module.exports = router;
