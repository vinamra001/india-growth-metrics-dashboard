require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const metricsRoutes = require('./routes/metrics');
const cityRoutes = require('./routes/cities');
const exportRoutes = require('./routes/export');
const policyRoutes = require('./routes/policy');
const clusteringRoutes = require('./routes/clustering');
const aiRoutes = require('./routes/ai');
const { securityMiddleware } = require('./middleware/security');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(securityMiddleware);

// Connect to MongoDB (optional - will use live API data only)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/india-growth-metrics';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.log('MongoDB connection failed, using live API data only:', err.message);
});

// Routes - All data comes from live APIs
app.use('/api/metrics', metricsRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/clustering', clusteringRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Live Data API Server Running',
    timestamp: new Date().toISOString(),
    dataSource: 'External APIs (World Bank, WHO, IMF)'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'India Growth Metrics - Live Data API Server',
    version: '1.0.0',
    dataSource: 'External APIs',
    endpoints: {
      cities: '/api/cities',
      metrics: '/api/metrics',
      liveStatus: '/api/cities/api/status',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error - Live Data API',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Contact administrator',
    dataSource: 'External APIs'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Live Data API Server running on port ${PORT}`);
  console.log(`📊 Data Source: External APIs (World Bank, WHO, IMF, etc.)`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Live Status: http://localhost:${PORT}/api/cities/api/status`);
});
