const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// K-means clustering algorithm
function kMeansClustering(data, k, maxIterations = 100) {
  if (data.length === 0 || k <= 0) {
    return { clusters: [], centroids: [], iterations: 0 };
  }

  // Initialize clusters array
  let clusters = Array.from({ length: k }, () => []);
  
  // Initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * data.length);
    centroids.push({ ...data[randomIndex] });
  }

  let iterations = 0;
  let converged = false;

  while (iterations < maxIterations && !converged) {
    // Reset clusters
    clusters = Array.from({ length: k }, () => []);
    
    // Assign each data point to nearest centroid
    data.forEach(point => {
      let minDistance = Infinity;
      let nearestCentroidIndex = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = calculateDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCentroidIndex = index;
        }
      });
      
      clusters[nearestCentroidIndex].push(point);
    });
    
    // Calculate new centroids
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) {
        // If cluster is empty, use a random data point
        const randomIndex = Math.floor(Math.random() * data.length);
        return { ...data[randomIndex] };
      }
      
      const centroid = {};
      const numericKeys = Object.keys(cluster[0]).filter(key => typeof cluster[0][key] === 'number');
      
      numericKeys.forEach(key => {
        const sum = cluster.reduce((acc, point) => acc + (point[key] || 0), 0);
        centroid[key] = sum / cluster.length;
      });
      
      // Preserve non-numeric fields from first point
      Object.keys(cluster[0]).forEach(key => {
        if (typeof cluster[0][key] !== 'number') {
          centroid[key] = cluster[0][key];
        }
      });
      
      return centroid;
    });
    
    // Check for convergence
    converged = centroids.every((centroid, index) => {
      const newCentroid = newCentroids[index];
      return calculateDistance(centroid, newCentroid) < 0.001;
    });
    
    centroids = newCentroids;
    iterations++;
  }

  return { clusters, centroids, iterations };
}

// Calculate Euclidean distance between two points
function calculateDistance(point1, point2) {
  const numericKeys = Object.keys(point1).filter(key => typeof point1[key] === 'number');
  let sum = 0;
  
  numericKeys.forEach(key => {
    sum += Math.pow(point1[key] - point2[key], 2);
  });
  
  return Math.sqrt(sum);
}

// Normalize data for clustering
function normalizeData(data) {
  const numericKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
  const minMax = {};
  
  // Calculate min and max for each numeric field
  numericKeys.forEach(key => {
    const values = data.map(item => item[key]);
    minMax[key] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });
  
  // Normalize data
  return data.map(item => {
    const normalized = { ...item };
    numericKeys.forEach(key => {
      const range = minMax[key].max - minMax[key].min;
      if (range > 0) {
        normalized[key] = (item[key] - minMax[key].min) / range;
      }
    });
    return normalized;
  });
}

// Helper function to get latest metrics regardless of data structure
function getLatestMetrics(city) {
  if (!city.metrics) return null;
  
  // If metrics is an array, get the last element
  if (Array.isArray(city.metrics)) {
    return city.metrics[city.metrics.length - 1] || {};
  }
  
  // If metrics is an object with year keys, get the latest year
  if (typeof city.metrics === 'object' && !Array.isArray(city.metrics)) {
    const years = Object.keys(city.metrics).filter(key => !isNaN(key)).sort();
    if (years.length > 0) {
      return city.metrics[years[years.length - 1]];
    }
    // If no year keys, return the metrics object directly
    return city.metrics;
  }
  
  return {};
}

// Get city clusters based on performance metrics
router.post('/cities', async (req, res) => {
  try {
    const { k = 4, metrics = ['hdi', 'gdpPerCapita', 'literacyRate', 'lifeExpectancy'] } = req.body;
    
    // Get live data from dataService
    const citiesData = await dataService.getAllCitiesData();
    
    // Prepare data for clustering
    const clusteringData = citiesData.map(city => {
      const dataPoint = {
        _id: city._id,
        name: city.name,
        state: city.state,
        country: city.country || 'India'
      };
      
      // Add selected metrics with proper null checks
      const latestMetrics = getLatestMetrics(city);
      metrics.forEach(metric => {
        dataPoint[metric] = latestMetrics[metric] !== undefined ? latestMetrics[metric] : 0;
      });
      
      return dataPoint;
    });

    // Normalize data
    const normalizedData = normalizeData(clusteringData);
    
    // Perform clustering
    const { clusters, centroids, iterations } = kMeansClustering(normalizedData, k);
    
    // Format results
    const results = clusters.map((cluster, index) => {
      const cities = cluster.map(city => ({
        _id: city._id,
        name: city.name,
        state: city.state,
        country: city.country,
        metrics: metrics.reduce((acc, metric) => {
          acc[metric] = city[metric];
          return acc;
        }, {})
      }));
      
      const centroid = centroids[index];
      const clusterMetrics = metrics.reduce((acc, metric) => {
        acc[metric] = centroid[metric];
        return acc;
      }, {});
      
      return {
        clusterId: index + 1,
        cities,
        centroid: clusterMetrics,
        size: cities.length,
        characteristics: analyzeClusterCharacteristics(cities, metrics)
      };
    });

    res.json({
      success: true,
      clusters: results,
      totalIterations: iterations,
      metrics: metrics,
      totalCities: citiesData.length
    });
  } catch (error) {
    console.error('Clustering error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing clustering analysis',
      error: error.message
    });
  }
});

// Get scenario analysis ("What if" modeling)
router.post('/scenario-analysis', async (req, res) => {
  try {
    const { cityId, scenarios } = req.body;
    
    if (!cityId || !scenarios) {
      return res.status(400).json({ message: 'City ID and scenarios are required' });
    }

    const citiesData = await dataService.getAllCitiesData();
    const city = citiesData.find(c => c._id === cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const latestMetrics = getLatestMetrics(city);

    const results = [];

    scenarios.forEach(scenario => {
      const projectedMetrics = { ...latestMetrics };
      
      // Apply scenario changes with null checks
      if (scenario.investmentIncrease) {
        projectedMetrics.gdp = (latestMetrics.gdp || 0) * (1 + scenario.investmentIncrease / 100);
        projectedMetrics.gdpPerCapita = projectedMetrics.gdp / (city.population || 1000000);
      }
      
      if (scenario.educationInvestment) {
        projectedMetrics.literacyRate = Math.min(100, (latestMetrics.literacyRate || 0) + scenario.educationInvestment);
        projectedMetrics.educationIndex = Math.min(1, (latestMetrics.educationIndex || 0) + scenario.educationInvestment / 100);
        projectedMetrics.hdi = calculateProjectedHDI(projectedMetrics);
      }
      
      if (scenario.healthcareInvestment) {
        projectedMetrics.lifeExpectancy = Math.min(85, (latestMetrics.lifeExpectancy || 0) + scenario.healthcareInvestment);
        projectedMetrics.infantMortalityRate = Math.max(0, (latestMetrics.infantMortalityRate || 0) - scenario.healthcareInvestment);
        projectedMetrics.hdi = calculateProjectedHDI(projectedMetrics);
      }
      
      if (scenario.environmentalInvestment) {
        projectedMetrics.airQualityIndex = Math.max(0, (latestMetrics.airQualityIndex || 0) - scenario.environmentalInvestment);
        projectedMetrics.renewableEnergy = Math.min(100, (latestMetrics.renewableEnergy || 0) + scenario.environmentalInvestment);
      }

      results.push({
        scenarioName: scenario.name,
        description: scenario.description,
        currentMetrics: latestMetrics,
        projectedMetrics: projectedMetrics,
        improvements: calculateImprovements(latestMetrics, projectedMetrics),
        timeline: scenario.timeline || '5 years',
        cost: scenario.cost || 'Medium'
      });
    });

    res.json({
      city: {
        _id: city._id,
        name: city.name,
        state: city.state
      },
      scenarios: results
    });
  } catch (error) {
    console.error('Scenario analysis error:', error);
    res.status(500).json({ message: 'Failed to perform scenario analysis' });
  }
});

// Get goal tracking (SDG progress)
router.get('/sdg-progress', async (req, res) => {
  try {
    const sdgGoals = [
      {
        id: 1,
        name: 'No Poverty',
        target: 'Reduce poverty rate to below 5%',
        metrics: ['povertyRate'],
        targetValue: 5.0
      },
      {
        id: 3,
        name: 'Good Health and Well-being',
        target: 'Improve life expectancy to 75+ years',
        metrics: ['lifeExpectancy', 'infantMortalityRate'],
        targetValue: 75.0
      },
      {
        id: 4,
        name: 'Quality Education',
        target: 'Achieve 95%+ literacy rate',
        metrics: ['literacyRate', 'educationIndex'],
        targetValue: 95.0
      },
      {
        id: 7,
        name: 'Affordable and Clean Energy',
        target: 'Increase renewable energy to 30%+',
        metrics: ['renewableEnergy'],
        targetValue: 30.0
      },
      {
        id: 8,
        name: 'Decent Work and Economic Growth',
        target: 'Maintain unemployment rate below 5%',
        metrics: ['unemploymentRate', 'gdpPerCapita'],
        targetValue: 5.0
      },
      {
        id: 10,
        name: 'Reduced Inequalities',
        target: 'Reduce Gini coefficient below 0.35',
        metrics: ['giniCoefficient'],
        targetValue: 0.35
      },
      {
        id: 11,
        name: 'Sustainable Cities and Communities',
        target: 'Improve air quality index below 100',
        metrics: ['airQualityIndex'],
        targetValue: 100.0
      }
    ];

    const citiesData = await dataService.getAllCitiesData();
    const cityProgress = citiesData.map(city => {
      const latestMetrics = getLatestMetrics(city);

      const progress = [];

      sdgGoals.forEach(goal => {
        const metricValue = latestMetrics[goal.metrics[0]];
        
        // Skip if metric value is undefined or null
        if (metricValue === undefined || metricValue === null) {
          return;
        }
        
        const isOnTrack = goal.metrics[0] === 'giniCoefficient' || goal.metrics[0] === 'unemploymentRate' || goal.metrics[0] === 'airQualityIndex' || goal.metrics[0] === 'infantMortalityRate'
          ? metricValue <= goal.targetValue
          : metricValue >= goal.targetValue;

        progress.push({
          goalId: goal.id,
          goalName: goal.name,
          target: goal.target,
          currentValue: metricValue,
          targetValue: goal.targetValue,
          isOnTrack: isOnTrack,
          progress: calculateProgress(metricValue, goal.targetValue, goal.metrics[0])
        });
      });

      return {
        city: {
          _id: city._id,
          name: city.name,
          state: city.state
        },
        progress: progress,
        overallProgress: progress.length > 0 ? progress.filter(p => p.isOnTrack).length / progress.length : 0
      };
    });

    res.json({
      sdgGoals: sdgGoals,
      cityProgress: cityProgress,
      summary: {
        totalCities: cityProgress.length,
        averageProgress: cityProgress.reduce((sum, city) => sum + city.overallProgress, 0) / cityProgress.length
      }
    });
  } catch (error) {
    console.error('SDG progress error:', error);
    res.status(500).json({ message: 'Failed to calculate SDG progress' });
  }
});

// Helper function to analyze cluster characteristics
function analyzeClusterCharacteristics(cities, metrics) {
  const characteristics = {};
  
  metrics.forEach(metric => {
    const values = cities.map(city => city.metrics[metric]);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    characteristics[metric] = {
      average: avg,
      min: min,
      max: max,
      range: max - min
    };
  });
  
  return characteristics;
}

// Helper function to calculate projected HDI
function calculateProjectedHDI(metrics) {
  // Simplified HDI calculation
  const lifeExpectancyIndex = (metrics.lifeExpectancy - 20) / (85 - 20);
  const educationIndex = metrics.educationIndex;
  const gniIndex = Math.log(metrics.gdpPerCapita) / Math.log(75000);
  
  return (lifeExpectancyIndex + educationIndex + gniIndex) / 3;
}

// Helper function to calculate improvements
function calculateImprovements(current, projected) {
  const improvements = {};
  
  Object.keys(projected).forEach(key => {
    if (typeof projected[key] === 'number' && typeof current[key] === 'number') {
      const change = projected[key] - current[key];
      const percentChange = (change / current[key]) * 100;
      
      improvements[key] = {
        absolute: change,
        percentage: percentChange,
        improved: change > 0
      };
    }
  });
  
  return improvements;
}

// Helper function to calculate progress percentage
function calculateProgress(current, target, metric) {
  if (metric === 'giniCoefficient' || metric === 'unemploymentRate' || metric === 'airQualityIndex' || metric === 'infantMortalityRate') {
    // Lower is better for these metrics
    return Math.max(0, Math.min(100, ((target - current) / target) * 100));
  } else {
    // Higher is better for other metrics
    return Math.max(0, Math.min(100, (current / target) * 100));
  }
}

module.exports = router; 