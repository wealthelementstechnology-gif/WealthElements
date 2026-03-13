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
const { startProactiveAdvisorJobs } = require('./jobs/proactiveAdvisorJob');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = config.clientUrl;
console.log('CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Rate limiting — relaxed for development, seed/health/insight routes excluded
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 5000 : 500,
  message: { success: false, message: 'Too many requests, please try again later' },
  skip: (req) =>
    req.path.startsWith('/api/v1/seed') ||
    req.path === '/api/v1/health' ||
    req.path === '/api/v1/chat/insight',
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

// Health check (used by UptimeRobot to keep Render awake)
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

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
  // Start proactive advisor cron jobs after server is up
  startProactiveAdvisorJobs();
});
