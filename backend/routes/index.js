var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    success: true,
    message: 'India Growth Metrics API',
    version: '1.0.0',
    endpoints: {
      cities: '/api/cities',
      seed: '/api/cities/seed',
      rankings: '/api/cities/rank/:metric',
      search: '/api/cities/search/:query',
      insights: '/api/cities/insights/top-cities'
    }
  });
});

module.exports = router;
