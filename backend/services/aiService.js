const citiesData = require('../data/cities.json');
const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-fallback'
});

// Trend prediction using linear regression
function predictTrend(historicalData, periods = 3) {
  const n = historicalData.length;
  if (n < 2) return null;

  // Calculate linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  historicalData.forEach((value, index) => {
    sumX += index;
    sumY += value;
    sumXY += index * value;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict future values
  const predictions = [];
  for (let i = n; i < n + periods; i++) {
    predictions.push(slope * i + intercept);
  }

  return {
    slope,
    intercept,
    predictions,
    confidence: calculateConfidence(historicalData, slope, intercept)
  };
}

// Anomaly detection using Z-score method
function detectAnomalies(data, threshold = 2.5) {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return data.map((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    return {
      index,
      value,
      zScore,
      isAnomaly: zScore > threshold,
      severity: zScore > threshold * 1.5 ? 'high' : zScore > threshold ? 'medium' : 'low'
    };
  }).filter(item => item.isAnomaly);
}

// Correlation analysis between metrics
function calculateCorrelation(metric1, metric2) {
  const n = Math.min(metric1.length, metric2.length);
  if (n < 2) return 0;

  const mean1 = metric1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = metric2.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0, denom1 = 0, denom2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = metric1[i] - mean1;
    const diff2 = metric2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denom1 * denom2);
  return denominator === 0 ? 0 : numerator / denominator;
}

// Calculate confidence interval for predictions
function calculateConfidence(data, slope, intercept) {
  const n = data.length;
  const predicted = data.map((_, index) => slope * index + intercept);
  const residuals = data.map((actual, index) => actual - predicted[index]);
  
  const mse = residuals.reduce((sum, residual) => sum + residual * residual, 0) / n;
  const rmse = Math.sqrt(mse);
  
  return {
    rmse,
    confidence: Math.max(0, 1 - rmse / Math.max(...data))
  };
}

// Generate comprehensive insights
function generateInsights(cityData, metrics) {
  const insights = [];
  const latestMetrics = getLatestMetrics(cityData);

  // Economic insights
  if (latestMetrics.gdpPerCapita < 80000) {
    insights.push({
      type: 'economic',
      severity: 'high',
      message: 'GDP per capita is below optimal levels',
      recommendation: 'Focus on economic diversification and investment attraction',
      impact: 'High potential for improvement'
    });
  }

  // Social development insights
  if (latestMetrics.hdi < 0.7) {
    insights.push({
      type: 'social',
      severity: 'high',
      message: 'Human Development Index indicates room for improvement',
      recommendation: 'Invest in education and healthcare infrastructure',
      impact: 'Significant improvement potential'
    });
  }

  // Environmental insights
  if (latestMetrics.airQualityIndex > 150) {
    insights.push({
      type: 'environmental',
      severity: 'medium',
      message: 'Air quality needs improvement',
      recommendation: 'Implement stricter emission standards and promote green energy',
      impact: 'Medium-term improvement potential'
    });
  }

  // Inequality insights
  if (latestMetrics.giniCoefficient > 0.45) {
    insights.push({
      type: 'equality',
      severity: 'high',
      message: 'High income inequality detected',
      recommendation: 'Implement progressive social policies and expand safety nets',
      impact: 'High social impact potential'
    });
    }

  return insights;
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

// Helper function to get metric data over time
function getMetricDataOverTime(city, metric) {
  if (!city.metrics) return [];
  
  // If metrics is an array, extract the metric from each entry
  if (Array.isArray(city.metrics)) {
    return city.metrics
      .map(m => m[metric])
      .filter(val => val !== undefined);
  }
  
  // If metrics is an object with year keys, extract the metric from each year
  if (typeof city.metrics === 'object' && !Array.isArray(city.metrics)) {
    const years = Object.keys(city.metrics).filter(key => !isNaN(key)).sort();
    return years
      .map(year => city.metrics[year][metric])
      .filter(val => val !== undefined);
  }
  
  return [];
}

// Perform trend analysis for multiple cities
function analyzeTrends(cities, metric, years = 5) {
  const trends = [];

  cities.forEach(city => {
    const metricData = getMetricDataOverTime(city, metric).slice(-years);

    if (metricData.length >= 2) {
      const trend = predictTrend(metricData);
      if (trend) {
        trends.push({
          city: city.name,
          currentValue: metricData[metricData.length - 1],
          trend: trend.slope > 0 ? 'increasing' : 'decreasing',
          slope: trend.slope,
          confidence: trend.confidence.confidence,
          prediction: trend.predictions[0]
        });
      }
    }
  });

  return trends.sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope));
}

// Detect anomalies across cities
function detectCityAnomalies(cities, metric) {
  const allValues = cities.map(city => {
    const latestMetrics = getLatestMetrics(city);
    return {
      city: city.name,
      value: latestMetrics[metric]
    };
  }).filter(item => item.value !== undefined);

  const values = allValues.map(item => item.value);
  const anomalies = detectAnomalies(values);

  return anomalies.map(anomaly => ({
    city: allValues[anomaly.index].city,
    value: anomaly.value,
    severity: anomaly.severity,
    zScore: anomaly.zScore
  }));
}

// Perform correlation analysis
function performCorrelationAnalysis(cities, metric1, metric2) {
  const correlations = [];

  cities.forEach(city => {
    const metric1Data = getMetricDataOverTime(city, metric1);
    const metric2Data = getMetricDataOverTime(city, metric2);

    if (metric1Data.length >= 2 && metric2Data.length >= 2) {
      const correlation = calculateCorrelation(metric1Data, metric2Data);
      correlations.push({
        city: city.name,
        metric1: metric1,
        metric2: metric2,
        correlation: correlation,
        correlationScore: correlation,
        strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
        direction: correlation > 0 ? 'positive' : 'negative'
      });
    }
  });

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// Generate performance score
function calculatePerformanceScore(cityData) {
  const latestMetrics = getLatestMetrics(cityData);
  
  // Normalize metrics to 0-100 scale
  const scores = {
    economic: Math.min(100, (latestMetrics.gdpPerCapita / 150000) * 100),
    social: latestMetrics.hdi * 100,
    environmental: Math.max(0, 100 - (latestMetrics.airQualityIndex - 50)),
    equality: Math.max(0, 100 - (latestMetrics.giniCoefficient * 100)),
    infrastructure: (latestMetrics.infrastructureIndex / 10) * 100
  };

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

  return {
    overall: Math.round(overallScore),
    breakdown: scores,
    grade: overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'D'
  };
}

const aiService = {
  async generateInsights(cityData, metrics) {
    try {
      if (openai) {
        // Use OpenAI if available
        const prompt = `Analyze the following city data and provide insights:
          City: ${cityData.name}
          Metrics: ${JSON.stringify(metrics)}
          Provide actionable insights and recommendations.`;
      
      const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      
        return completion.choices[0].message.content;
      } else {
        // Use local AI algorithms
        return generateInsights(cityData, metrics);
      }
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to local algorithms
      return generateInsights(cityData, metrics);
    }
  },

  async predictFutureTrends(cityData, metric, years = 5) {
    try {
      if (openai) {
        // Use OpenAI if available
        const prompt = `Predict future trends for ${metric} in ${cityData.name} for the next ${years} years based on historical data.`;
      
      const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      
        return completion.choices[0].message.content;
      } else {
        // Use local prediction algorithms
        const historicalData = getMetricDataOverTime(cityData, metric);
        return predictTrend(historicalData, years);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to predict future trends');
    }
  },

  predictTrend,
  detectAnomalies,
  calculateCorrelation,
  generateInsights,
  analyzeTrends,
  detectCityAnomalies,
  performCorrelationAnalysis,
  calculatePerformanceScore
};

module.exports = aiService;
