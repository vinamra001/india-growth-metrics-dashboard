const calculateCityMetrics = (cityData) => {
  // Calculate composite indices
  const calculateCompositeIndex = (metrics, weights) => {
    return metrics.reduce((sum, metric, index) => {
      return sum + (metric * weights[index]);
    }, 0) / weights.reduce((sum, weight) => sum + weight, 0);
  };

  // Calculate growth rates
  const calculateGrowthRate = (current, previous) => {
    return ((current - previous) / previous) * 100;
  };

  // Calculate correlation coefficients
  const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
  };

  // Calculate HDI
  const hdi = cityData.hdi || (
    (cityData.lifeExpectancy / 85) +
    (cityData.educationIndex || 0) +
    (cityData.incomeIndex || 0)
  ) / 3;

  // Calculate composite indices with weights
  const weights = {
    economic: [0.4, 0.3, 0.3], // GDP, GNI, GDP per capita
    social: [0.5, 0.3, 0.2],  // HDI, literacy, healthcare
    environmental: [0.4, 0.3, 0.3], // Air quality, renewable energy, forest area
    governance: [0.4, 0.3, 0.3]  // Corruption index, internet penetration, infrastructure
  };

  const compositeIndices = {
    economic: calculateCompositeIndex([
      cityData.gdp || 0,
      cityData.gni || 0,
      cityData.gdpPerCapita || 0
    ], weights.economic),

    social: calculateCompositeIndex([
      hdi,
      cityData.literacyRate || 0,
      cityData.healthcareIndex || 0
    ], weights.social),

    environmental: calculateCompositeIndex([
      cityData.airQualityIndex || 0,
      cityData.renewableEnergy || 0,
      cityData.forestArea || 0
    ], weights.environmental),

    governance: calculateCompositeIndex([
      cityData.corruptionPerceptionsIndex || 0,
      cityData.internetPenetration || 0,
      cityData.infrastructureQualityIndex || 0
    ], weights.governance)
  };

  // Calculate growth rates (if historical data available)
  const growthRates = {};
  if (cityData.previousYearData) {
    Object.keys(cityData.previousYearData).forEach(metric => {
      if (typeof cityData[metric] === 'number' && typeof cityData.previousYearData[metric] === 'number') {
        growthRates[metric] = calculateGrowthRate(cityData[metric], cityData.previousYearData[metric]);
      }
    });
  }

  // Calculate correlations between key metrics
  const correlations = {};
  const metricsToCorrelate = [
    'gdp', 'gni', 'gdpPerCapita',
    'hdi', 'literacyRate', 'lifeExpectancy',
    'airQualityIndex', 'renewableEnergy'
  ];

  metricsToCorrelate.forEach(metric1 => {
    correlations[metric1] = {};
    metricsToCorrelate.forEach(metric2 => {
      if (metric1 !== metric2 && cityData[metric1] && cityData[metric2]) {
        correlations[metric1][metric2] = calculateCorrelation(
          [cityData[metric1]],
          [cityData[metric2]]
        );
      }
    });
  });

  return {
    compositeIndices,
    growthRates,
    correlations,
    hdi
  };
};

module.exports = {
  calculateCityMetrics
};
