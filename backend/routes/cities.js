const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const upload = multer({ storage: multer.memoryStorage() });

// World Cities API endpoint
const WORLD_CITIES_API = 'https://world-cities-api.com/cities';
const DEFAULT_METRICS = [
  'gdpPerCapita', 'population', 'unemploymentRate',
  'lifeExpectancy', 'educationIndex', 'healthIndex'
];

// Get all cities with live data - always fresh from APIs
router.get('/', async (req, res) => {
  try {
    console.log('Fetching fresh live data from external APIs...');
    const citiesData = await dataService.getAllCitiesData();
    console.log(`Successfully fetched live data for ${citiesData.length} cities`);
    res.json(citiesData);
  } catch (error) {
    console.error('Error fetching live cities data:', error);
    res.status(500).json({ 
      message: 'Error fetching live data from external APIs',
      error: error.message 
    });
  }
});

// Get city by ID with live data
router.get('/:id', async (req, res) => {
  try {
    const granularity = req.query.granularity || 'monthly';
    const citiesData = await dataService.getAllCitiesData();
    const city = citiesData.find(c => c._id === req.params.id);
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    // Fetch detailed city data with granularity
    const cityData = await dataService.getCityData(city.name, granularity);
    res.json({
      success: true,
      data: cityData,
      source: 'Live API Data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live city data',
      error: error.message
    });
  }
});

// Get cities by metric ranking with live data
router.get('/rank/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { limit = 10, order = 'desc' } = req.query;
    
    const citiesData = await dataService.getAllCitiesData();
    const citiesWithMetrics = citiesData.map(city => ({
      ...city,
      latestMetrics: city.metrics
    })).filter(city => city.latestMetrics[metric] !== undefined);
    
    const sortedCities = citiesWithMetrics.sort((a, b) => {
      const aValue = a.latestMetrics[metric];
      const bValue = b.latestMetrics[metric];
      return order === 'desc' ? bValue - aValue : aValue - bValue;
    }).slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: sortedCities.map(city => ({
        _id: city._id,
        name: city.name,
        state: city.state,
        country: city.country,
        metric: metric,
        value: city.latestMetrics[metric],
        lastUpdated: city.lastUpdated
      })),
      source: 'Live API Data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live city rankings',
      error: error.message
    });
  }
});

// Get cities by state with live data
router.get('/state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const citiesData = await dataService.getAllCitiesData();
    const cities = citiesData.filter(city => 
      city.state && city.state.toLowerCase() === state.toLowerCase()
    );
    
    res.json({
      success: true,
      data: cities,
      count: cities.length,
      source: 'Live API Data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live cities by state',
      error: error.message
    });
  }
});

// Search cities by name with live data
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const citiesData = await dataService.getAllCitiesData();
    const cities = citiesData.filter(city => 
      city.name && city.name.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      success: true,
      data: cities,
      count: cities.length,
      source: 'Live API Data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching live cities',
      error: error.message
    });
  }
});

// Get live data sources status
router.get('/api/status', async (req, res) => {
  try {
    console.log('Checking live API connectivity...');
    const [worldBankData, whoData, imfData] = await Promise.all([
      dataService.getWorldBankData(),
      dataService.getWHOData(),
      dataService.getIMFData()
    ]);

    const status = {
      worldBank: worldBankData ? 'Connected' : 'Disconnected',
      who: whoData ? 'Connected' : 'Disconnected',
      imf: imfData ? 'Connected' : 'Disconnected',
      lastChecked: new Date().toISOString()
    };

    console.log('API Status:', status);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking API status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking live API status',
      error: error.message
    });
  }
});

// Get specific live data from external APIs
router.get('/api/worldbank', async (req, res) => {
  try {
    const data = await dataService.getWorldBankData();
    res.json({
      success: true,
      data: data,
      source: 'World Bank API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching World Bank live data',
      error: error.message
    });
  }
});

router.get('/api/who', async (req, res) => {
  try {
    const data = await dataService.getWHOData();
    res.json({
      success: true,
      data: data,
      source: 'WHO Global Health Observatory'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching WHO live data',
      error: error.message
    });
  }
});

router.get('/api/imf', async (req, res) => {
  try {
    const data = await dataService.getIMFData();
    res.json({
      success: true,
      data: data,
      source: 'IMF Data API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching IMF live data',
      error: error.message
    });
  }
});

// Get real-time dashboard summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    console.log('Fetching live dashboard summary...');
    const citiesData = await dataService.getAllCitiesData();
    
    const summary = {
      totalCities: citiesData.length,
      averageGDP: citiesData.length > 0 ? 
        citiesData.reduce((sum, city) => sum + (city.metrics.gdpPerCapita || 0), 0) / citiesData.length : 0,
      averageHDI: citiesData.length > 0 ? 
        citiesData.reduce((sum, city) => sum + (city.metrics.hdi || 0), 0) / citiesData.length : 0,
      averageLiteracy: citiesData.length > 0 ? 
        citiesData.reduce((sum, city) => sum + (city.metrics.literacyRate || 0), 0) / citiesData.length : 0,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Live External APIs'
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching live dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live dashboard data',
      error: error.message
    });
  }
});

// User data upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    let records = [];
    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const csvString = fileBuffer.toString('utf-8');
      const lines = csvString.split('\n');
      const headers = lines[0].split(',');
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const record = {};
        headers.forEach((h, idx) => { record[h.trim()] = values[idx] ? values[idx].trim() : null; });
        records.push(record);
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }
    if (!records.length) {
      return res.status(400).json({ success: false, message: 'No data found in file' });
    }
    // Simple analytics: group by city, summarize metrics, trends
    const cityGroups = {};
    records.forEach(r => {
      const city = r.city || r.City || r.name || r.Name;
      if (!city) return;
      if (!cityGroups[city]) cityGroups[city] = [];
      cityGroups[city].push(r);
    });
    const analytics = Object.entries(cityGroups).map(([city, data]) => {
      // For each metric, compute average and trend (last - first)
      const metrics = {};
      const keys = Object.keys(data[0]).filter(k => k !== 'city' && k !== 'City' && k !== 'name' && k !== 'Name' && k !== 'month' && k !== 'Month');
      keys.forEach(metric => {
        const values = data.map(d => parseFloat(d[metric])).filter(v => !isNaN(v));
        if (values.length) {
          metrics[metric] = {
            average: values.reduce((a, b) => a + b, 0) / values.length,
            trend: values[values.length - 1] - values[0]
          };
        }
      });
      return { city, metrics, count: data.length };
    });
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing file', error: error.message });
  }
});

module.exports = router; 