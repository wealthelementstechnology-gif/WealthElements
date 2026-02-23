require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const v1Routes = require('./routes/v1');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Rate limiting — relaxed for development, seed routes excluded
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // raised from 100 → 500 to accommodate dashboard data fetches
  message: { success: false, message: 'Too many requests, please try again later' },
  skip: (req) => req.path.startsWith('/api/v1/seed'), // never limit seed/demo endpoints
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Increase timeout for AI chat requests (Claude can take 30-60s for complex answers)
app.use('/api/v1/chat', (req, res, next) => {
  res.setTimeout(120000);
  next();
});

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/v1', v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
