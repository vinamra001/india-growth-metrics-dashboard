const express = require('express');
const router = express.Router();
const citiesData = require('../data/cities.json');
const aiService = require('../services/aiService');

// Trend analysis endpoint
router.post('/trend-analysis', (req, res) => {
  try {
    const { cities, metric, years = 5 } = req.body;
    
    if (!cities || !metric) {
      return res.status(400).json({ message: 'Cities and metric are required' });
    }

    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    const trends = aiService.analyzeTrends(selectedCities, metric, years);

    res.json({ trends });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({ message: 'Failed to perform trend analysis' });
  }
});

// Anomaly detection endpoint
router.post('/anomaly-detection', (req, res) => {
  try {
    const { cities, metric } = req.body;
    
    if (!cities || !metric) {
      return res.status(400).json({ message: 'Cities and metric are required' });
    }

    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    const anomalies = aiService.detectCityAnomalies(selectedCities, metric);

    res.json({ anomalies });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Failed to detect anomalies' });
  }
});

// Correlation analysis endpoint
router.post('/correlation-analysis', (req, res) => {
  try {
    const { cities, metric1, metric2 } = req.body;
    
    if (!cities || !metric1 || !metric2) {
      return res.status(400).json({ message: 'Cities and both metrics are required' });
    }

    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    const correlations = aiService.performCorrelationAnalysis(selectedCities, metric1, metric2);

    res.json({ correlations });
  } catch (error) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({ message: 'Failed to perform correlation analysis' });
  }
});

// Performance scoring endpoint
router.post('/performance-score', (req, res) => {
  try {
    const { cityId } = req.body;
    
    if (!cityId) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = citiesData.find(c => c._id === cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const score = aiService.calculatePerformanceScore(city);

    res.json({ score });
  } catch (error) {
    console.error('Performance scoring error:', error);
    res.status(500).json({ message: 'Failed to calculate performance score' });
  }
});

// Generate insights endpoint
router.post('/insights', (req, res) => {
  try {
    const { cityId, metrics } = req.body;
    
    if (!cityId) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = citiesData.find(c => c._id === cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const insights = aiService.generateInsights(city, metrics || []);

    res.json({ insights });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

// Predict future values endpoint
router.post('/predict', (req, res) => {
  try {
    const { cityId, metric, periods = 3 } = req.body;
    
    if (!cityId || !metric) {
      return res.status(400).json({ message: 'City ID and metric are required' });
    }

    const city = citiesData.find(c => c._id === cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const historicalData = city.metrics.map(m => m[metric]).filter(val => val !== undefined);
    const prediction = aiService.predictTrend(historicalData, periods);

    res.json({ prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Failed to generate prediction' });
  }
});

module.exports = router; 