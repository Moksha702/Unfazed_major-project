const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const clientRoutes = require('./routes/clientRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'unfazed-backend-api',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
