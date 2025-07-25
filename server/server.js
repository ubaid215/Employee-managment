const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const { setupSocket } = require('./sockets');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middlewares/errorMiddleware');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up WebSocket
setupSocket(server);
app.set('io', require('./sockets').getIO());

// Parse JSON body
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Security middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(hpp());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Custom security middleware (replaces xss-clean and express-mongo-sanitize)
app.use((req, res, next) => {
  const sanitizeMongo = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (/^\$/.test(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeMongo(obj[key]);
        }
      });
    }
  };

  const sanitizeXSS = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitizeXSS(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) {
    sanitizeMongo(req.body);
    req.body = sanitizeXSS(req.body);
  }
  if (req.params) {
    sanitizeMongo(req.params);
    req.params = sanitizeXSS(req.params);
  }

  next();
});

app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));

// Global error handler
app.use(globalErrorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
