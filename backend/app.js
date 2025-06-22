const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const citiesRouter = require('./routes/cities');

const app = express();

// MongoDB Connection (optional for development)
mongoose.connect('mongodb://localhost:27017/india-growth-metrics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.log('MongoDB connection failed, using in-memory data:', err.message);
  console.log('To use MongoDB, please install and start MongoDB service');
});

// Enable CORS for frontend
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', indexRouter);
app.use('/users', usersRouter);
app.use('/api/cities', citiesRouter);

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all handler: for any request that doesn't match API routes, send back React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
