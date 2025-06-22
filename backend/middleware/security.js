const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const csrf = require('csurf');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// CSRF protection
const csrfProtection = csrf({ cookie: true });

module.exports = {
  // Security middleware
  securityMiddleware: [
    helmet(),
    xss(),
    mongoSanitize(),
    cors(corsOptions),
    limiter
    // csrfProtection // Disabled for development
  ],

  // Authentication middleware
  authMiddleware: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      // Verify token
      // Note: In production, use JWT verification
      req.user = { id: 'user-id', role: 'user' };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  // Admin middleware
  adminMiddleware: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },

  // Role-based access control
  roleMiddleware: (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  }
};
