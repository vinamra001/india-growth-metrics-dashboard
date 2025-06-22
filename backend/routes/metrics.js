const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { check, validationResult } = require('express-validator');

// Get all metrics for a city with live data
router.get('/:city', async (req, res) => {
  try {
    const granularity = req.query.granularity || 'monthly';
    const cityData = await dataService.getCityData(req.params.city, granularity);
    
    if (!cityData) {
      return res.status(404).json({
        success: false,
        message: 'No metrics found for this city'
      });
    }

    res.json({
      success: true,
      data: {
        city: req.params.city,
        metrics: cityData.metrics,
        lastUpdated: cityData.lastUpdated,
        sources: cityData.sources
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get metrics comparison between cities with live data
router.get('/compare', async (req, res) => {
  try {
    const { cities, metric } = req.query;
    const citiesArray = cities.split(',');
    
    const cityDataPromises = citiesArray.map(city => dataService.getCityData(city));
    const citiesData = await Promise.all(cityDataPromises);
    
    const comparisonData = citiesData.map((cityData, index) => ({
      city: citiesArray[index],
      metrics: cityData ? cityData.metrics : null,
      lastUpdated: cityData ? cityData.lastUpdated : null,
      sources: cityData ? cityData.sources : null
    })).filter(city => city.metrics !== null);

    if (!comparisonData.length) {
      return res.status(404).json({
        success: false,
        message: 'No metrics found for the specified cities'
      });
    }

    res.json({
      success: true,
      data: comparisonData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get rankings for a specific metric with live data
router.get('/rankings/:metric', async (req, res) => {
  try {
    const metricPath = req.params.metric;
    const { limit = 10, order = 'desc' } = req.query;
    
    const allCitiesData = await dataService.getAllCitiesData();
    
    const citiesWithMetric = allCitiesData
      .filter(city => city.metrics && city.metrics[metricPath] !== undefined)
      .map(city => ({
        city: city.name,
        state: city.state,
        country: city.country,
        metric: metricPath,
        value: city.metrics[metricPath],
        lastUpdated: city.lastUpdated
      }))
      .sort((a, b) => {
        return order === 'desc' ? b.value - a.value : a.value - b.value;
      })
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: citiesWithMetric
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get live data sources information
router.get('/sources/status', async (req, res) => {
  try {
    const [worldBankData, whoData, imfData] = await Promise.all([
      dataService.getWorldBankData(),
      dataService.getWHOData(),
      dataService.getIMFData()
    ]);

    res.json({
      success: true,
      data: {
        worldBank: {
          status: worldBankData ? 'Connected' : 'Disconnected',
          data: worldBankData ? 'Available' : 'Unavailable',
          lastChecked: new Date().toISOString()
        },
        who: {
          status: whoData ? 'Connected' : 'Disconnected',
          data: whoData ? 'Available' : 'Unavailable',
          lastChecked: new Date().toISOString()
        },
        imf: {
          status: imfData ? 'Connected' : 'Disconnected',
          data: imfData ? 'Available' : 'Unavailable',
          lastChecked: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get specific metric trends from live sources
router.get('/trends/:metric', async (req, res) => {
  try {
    const metric = req.params.metric;
    const { source = 'worldbank' } = req.query;
    
    let trendData = null;
    
    switch (source.toLowerCase()) {
      case 'worldbank':
        trendData = await dataService.getWorldBankData('IN', [metric]);
        break;
      case 'who':
        trendData = await dataService.getWHOData(metric, 'IND');
        break;
      case 'imf':
        trendData = await dataService.getIMFData('IFS', metric, 'IN');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid data source'
        });
    }

    res.json({
      success: true,
      data: {
        metric,
        source,
        data: trendData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
