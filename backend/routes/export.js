const express = require('express');
const router = express.Router();
const citiesData = require('../data/cities.json');

// Export data as CSV
router.post('/csv', (req, res) => {
  try {
    const { cities, metrics, year } = req.body;
    
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ message: 'Cities array is required' });
    }

    // Get the selected cities data
    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    
    // Create CSV header
    let csvContent = 'City,State,Year';
    
    // Add metric headers
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        csvContent += `,${metric}`;
      });
    } else {
      // Add all metrics if none specified
      const allMetrics = [
        'GDP', 'GNI', 'GDP per Capita', 'Unemployment Rate', 'Inflation Rate',
        'Foreign Direct Investment', 'Export/Import Ratio', 'Public Debt as % of GDP',
        'HDI', 'Life Expectancy', 'Infant Mortality Rate', 'Literacy Rate',
        'Education Index', 'Gender Inequality Index', 'Population Growth Rate',
        'Urban Population %', 'Healthcare Expenditure per Capita', 'Physicians per 1000',
        'Hospital Beds per 1000', 'Clean Water Access %', 'Vaccination Coverage %',
        'CO2 Emissions per Capita', 'Renewable Energy %', 'Forest Area %',
        'Air Quality Index', 'Environmental Performance Index', 'Corruption Perceptions Index',
        'Internet Penetration %', 'Mobile Phone Subscriptions', 'Infrastructure Quality Index',
        'Political Stability Index', 'Gini Coefficient', 'Poverty Rate', 'Social Protection Coverage %'
      ];
      allMetrics.forEach(metric => {
        csvContent += `,${metric}`;
      });
    }
    csvContent += '\n';

    // Add data rows
    selectedCities.forEach(city => {
      const cityMetrics = city.metrics.find(m => m.year === year) || city.metrics[city.metrics.length - 1];
      
      if (cityMetrics) {
        let row = `${city.name},${city.state},${cityMetrics.year}`;
        
        if (metrics && metrics.length > 0) {
          metrics.forEach(metric => {
            const metricKey = getMetricKey(metric);
            row += `,${cityMetrics[metricKey] || 0}`;
          });
        } else {
          // Add all metrics
          row += `,${cityMetrics.gdp || 0},${cityMetrics.gni || 0},${cityMetrics.gdpPerCapita || 0}`;
          row += `,${cityMetrics.unemploymentRate || 0},${cityMetrics.inflationRate || 0}`;
          row += `,${cityMetrics.foreignDirectInvestment || 0},${cityMetrics.exportImportRatio || 0}`;
          row += `,${cityMetrics.publicDebtGDP || 0},${cityMetrics.hdi || 0},${cityMetrics.lifeExpectancy || 0}`;
          row += `,${cityMetrics.infantMortalityRate || 0},${cityMetrics.literacyRate || 0}`;
          row += `,${cityMetrics.educationIndex || 0},${cityMetrics.genderInequalityIndex || 0}`;
          row += `,${cityMetrics.populationGrowthRate || 0},${cityMetrics.urbanPopulation || 0}`;
          row += `,${cityMetrics.healthcareExpenditure || 0},${cityMetrics.physiciansPer1000 || 0}`;
          row += `,${cityMetrics.hospitalBedsPer1000 || 0},${cityMetrics.cleanWaterAccess || 0}`;
          row += `,${cityMetrics.vaccinationCoverage || 0},${cityMetrics.co2EmissionsPerCapita || 0}`;
          row += `,${cityMetrics.renewableEnergy || 0},${cityMetrics.forestArea || 0}`;
          row += `,${cityMetrics.airQualityIndex || 0},${cityMetrics.environmentalPerformanceIndex || 0}`;
          row += `,${cityMetrics.corruptionPerceptionsIndex || 0},${cityMetrics.internetPenetration || 0}`;
          row += `,${cityMetrics.mobilePhoneSubscriptions || 0},${cityMetrics.infrastructureQualityIndex || 0}`;
          row += `,${cityMetrics.politicalStabilityIndex || 0},${cityMetrics.giniCoefficient || 0}`;
          row += `,${cityMetrics.povertyRate || 0},${cityMetrics.socialProtectionCoverage || 0}`;
        }
        
        csvContent += row + '\n';
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="india-growth-metrics-${year || 'all'}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
});

// Export data as JSON
router.post('/json', (req, res) => {
  try {
    const { cities, year } = req.body;
    
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ message: 'Cities array is required' });
    }

    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    
    // Filter by year if specified
    const filteredData = selectedCities.map(city => ({
      ...city,
      metrics: year 
        ? city.metrics.filter(m => m.year === year)
        : city.metrics
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="india-growth-metrics-${year || 'all'}.json"`);
    res.json(filteredData);
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ message: 'Failed to export JSON' });
  }
});

// Helper function to convert metric display names to keys
function getMetricKey(metricName) {
  const metricMap = {
    'GDP': 'gdp',
    'GNI': 'gni',
    'GDP per Capita': 'gdpPerCapita',
    'Unemployment Rate': 'unemploymentRate',
    'Inflation Rate': 'inflationRate',
    'Foreign Direct Investment': 'foreignDirectInvestment',
    'Export/Import Ratio': 'exportImportRatio',
    'Public Debt as % of GDP': 'publicDebtGDP',
    'HDI': 'hdi',
    'Life Expectancy': 'lifeExpectancy',
    'Infant Mortality Rate': 'infantMortalityRate',
    'Literacy Rate': 'literacyRate',
    'Education Index': 'educationIndex',
    'Gender Inequality Index': 'genderInequalityIndex',
    'Population Growth Rate': 'populationGrowthRate',
    'Urban Population %': 'urbanPopulation',
    'Healthcare Expenditure per Capita': 'healthcareExpenditure',
    'Physicians per 1000': 'physiciansPer1000',
    'Hospital Beds per 1000': 'hospitalBedsPer1000',
    'Clean Water Access %': 'cleanWaterAccess',
    'Vaccination Coverage %': 'vaccinationCoverage',
    'CO2 Emissions per Capita': 'co2EmissionsPerCapita',
    'Renewable Energy %': 'renewableEnergy',
    'Forest Area %': 'forestArea',
    'Air Quality Index': 'airQualityIndex',
    'Environmental Performance Index': 'environmentalPerformanceIndex',
    'Corruption Perceptions Index': 'corruptionPerceptionsIndex',
    'Internet Penetration %': 'internetPenetration',
    'Mobile Phone Subscriptions': 'mobilePhoneSubscriptions',
    'Infrastructure Quality Index': 'infrastructureQualityIndex',
    'Political Stability Index': 'politicalStabilityIndex',
    'Gini Coefficient': 'giniCoefficient',
    'Poverty Rate': 'povertyRate',
    'Social Protection Coverage %': 'socialProtectionCoverage'
  };
  
  return metricMap[metricName] || metricName.toLowerCase().replace(/\s+/g, '');
}

module.exports = router; 