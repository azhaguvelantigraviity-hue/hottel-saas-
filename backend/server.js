// src/server.js
// ─────────────────────────────────────────────────────────────
//  StayOS – Hotel Management SaaS
//  Production-ready Express server
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression   = require('compression');
const path          = require('path');

const connectDB      = require('./config/db');
const logger         = require('./utils/logger');
const errorHandler   = require('./middleware/errorHandler');
const { AppError }   = require('./utils/helpers');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const adminRoutes      = require('./routes/admin');
const hotelRoutes      = require('./routes/hotel');
const operationsRoutes = require('./routes/operations');
const billingRoutes    = require('./routes/billing');
const manualItemsRoutes = require('./routes/manualItems');
const laundryRoutes     = require('./routes/laundry');
const bulkImportRoutes  = require('./routes/bulkImport');
const complaintsRoutes  = require('./routes/complaints');
const notificationRoutes = require('./routes/notificationRoutes');

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// Trust proxy is required when hosting on platforms like Render, Vercel, Heroku, etc.
// It ensures that express-rate-limit uses the actual client IP instead of the load balancer's IP.
app.set('trust proxy', true);

const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server, { 
  cors: { origin: '*' }
});

app.set('io', io);

io.on('connection', (socket) => {
  // Client should emit 'joinHotel' with their hotel ID
  socket.on('joinHotel', (hotelId) => {
    socket.join(hotelId);
  });
});

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(mongoSanitize());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://hottel-saas.vercel.app',
      'https://hottel-saas.onrender.com',
    ]);

['https://hottel-saas.onrender.com', 'https://hottel-saas.vercel.app'].forEach((origin) => {
  if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-hotel-id'],
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Hardcoded to 10000 to prevent dashboard 429 errors
  message:  { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
// app.use('/api', limiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/v1/auth/login',    authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.redirect('/health');
});

app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'StayOS API',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/admin',      adminRoutes);
app.use('/api/v1/hotel',      hotelRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/billing',    billingRoutes);
app.use('/api/v1/manual-items', manualItemsRoutes);
app.use('/api/v1/laundry',      laundryRoutes);
app.use('/api/v1/bulk-import',  bulkImportRoutes);
app.use('/api/v1/complaints',   complaintsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ── API info ──────────────────────────────────────────────────────────────────
app.get('/api/v1', (_req, res) => {
  res.json({
    service: 'StayOS Hotel Management API',
    version: 'v1',
    plans:   ['starter', 'professional', 'enterprise'],
    endpoints: {
      auth:       '/api/v1/auth',
      admin:      '/api/v1/admin      [platform_admin only]',
      hotel:      '/api/v1/hotel      [all hotel roles]',
      operations: '/api/v1/operations [plan-gated modules]',
      billing:    '/api/v1/billing    [admin/manager]',
    },
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handling ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
const { startCheckoutCron } = require('./cron/checkoutAlerts');
startCheckoutCron(app);

// ── Server Startup ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`StayOS API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`Health: http://localhost:${PORT}/health`);
  logger.info(`API:    http://localhost:${PORT}/api/v1`);
});

// ── Unhandled rejections ──────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;   // for Jest / supertest
