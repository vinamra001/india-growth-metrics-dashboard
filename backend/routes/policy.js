const express = require('express');
const router = express.Router();
const citiesData = require('../data/cities.json');

// Get policy insights for cities
router.post('/insights', (req, res) => {
  try {
    const { cities, metrics } = req.body;
    
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ message: 'Cities array is required' });
    }

    const selectedCities = citiesData.filter(city => cities.includes(city._id));
    const insights = [];

    selectedCities.forEach(city => {
      const latestMetrics = city.metrics[city.metrics.length - 1];
      const cityInsights = {
        city: city.name,
        state: city.state,
        insights: [],
        recommendations: [],
        successStories: [],
        similarCities: []
      };

      // Analyze HDI performance
      if (latestMetrics.hdi < 0.7) {
        cityInsights.insights.push({
          category: 'Human Development',
          issue: 'Low HDI score indicates need for improvement in education, health, and living standards',
          priority: 'High'
        });
        cityInsights.recommendations.push({
          category: 'Education',
          action: 'Increase investment in primary and secondary education',
          expectedImpact: 'Improve literacy rates and education index'
        });
        cityInsights.recommendations.push({
          category: 'Healthcare',
          action: 'Expand healthcare infrastructure and accessibility',
          expectedImpact: 'Improve life expectancy and reduce infant mortality'
        });
      }

      // Analyze economic performance
      if (latestMetrics.gdpPerCapita < 80000) {
        cityInsights.insights.push({
          category: 'Economic Development',
          issue: 'Low GDP per capita suggests need for economic diversification and job creation',
          priority: 'High'
        });
        cityInsights.recommendations.push({
          category: 'Economic Policy',
          action: 'Implement skill development programs and attract foreign investment',
          expectedImpact: 'Increase GDP per capita and reduce unemployment'
        });
      }

      // Analyze environmental performance
      if (latestMetrics.airQualityIndex > 150) {
        cityInsights.insights.push({
          category: 'Environmental Health',
          issue: 'Poor air quality indicates need for environmental protection measures',
          priority: 'Medium'
        });
        cityInsights.recommendations.push({
          category: 'Environmental Policy',
          action: 'Implement stricter emission standards and promote public transportation',
          expectedImpact: 'Improve air quality index and reduce CO2 emissions'
        });
      }

      // Analyze inequality
      if (latestMetrics.giniCoefficient > 0.45) {
        cityInsights.insights.push({
          category: 'Social Equality',
          issue: 'High income inequality requires targeted social protection programs',
          priority: 'High'
        });
        cityInsights.recommendations.push({
          category: 'Social Policy',
          action: 'Implement progressive taxation and expand social protection coverage',
          expectedImpact: 'Reduce income inequality and poverty rates'
        });
      }

      // Analyze infrastructure
      if (latestMetrics.infrastructureQualityIndex < 6.0) {
        cityInsights.insights.push({
          category: 'Infrastructure',
          issue: 'Infrastructure quality needs improvement for better economic growth',
          priority: 'Medium'
        });
        cityInsights.recommendations.push({
          category: 'Infrastructure Development',
          action: 'Invest in transportation, utilities, and digital infrastructure',
          expectedImpact: 'Improve infrastructure quality index and attract investment'
        });
      }

      // Find similar cities for benchmarking
      const similarCities = findSimilarCities(city, selectedCities);
      cityInsights.similarCities = similarCities;

      // Add success stories based on best performers
      cityInsights.successStories = getSuccessStories(city, selectedCities);

      insights.push(cityInsights);
    });

    res.json({ insights });
  } catch (error) {
    console.error('Policy insights error:', error);
    res.status(500).json({ message: 'Failed to generate policy insights' });
  }
});

// Get success stories and best practices
router.get('/success-stories', (req, res) => {
  try {
    const successStories = [
      {
        city: 'Mumbai',
        category: 'Economic Development',
        story: 'Successfully diversified economy through financial services and entertainment industry',
        metrics: {
          gdp: 310000,
          gdpPerCapita: 125000,
          unemploymentRate: 4.2
        },
        lessons: [
          'Focus on service sector development',
          'Invest in financial infrastructure',
          'Promote entrepreneurship and startups'
        ]
      },
      {
        city: 'Bangalore',
        category: 'Technology and Innovation',
        story: 'Became India\'s IT hub through strategic investment in education and infrastructure',
        metrics: {
          internetPenetration: 85.0,
          infrastructureQualityIndex: 7.2,
          educationIndex: 0.780
        },
        lessons: [
          'Invest in higher education and research',
          'Develop technology parks and incubators',
          'Create favorable business environment'
        ]
      },
      {
        city: 'Kerala Cities',
        category: 'Human Development',
        story: 'Achieved high HDI through focus on education and healthcare',
        metrics: {
          hdi: 0.820,
          literacyRate: 94.0,
          lifeExpectancy: 75.0
        },
        lessons: [
          'Prioritize public health and education',
          'Implement universal healthcare programs',
          'Focus on gender equality and social inclusion'
        ]
      }
    ];

    res.json({ successStories });
  } catch (error) {
    console.error('Success stories error:', error);
    res.status(500).json({ message: 'Failed to fetch success stories' });
  }
});

// Get policy recommendations by category
router.get('/recommendations/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    const recommendations = {
      'economic': [
        {
          title: 'Diversify Economic Base',
          description: 'Reduce dependence on single industry and promote multiple sectors',
          implementation: 'Medium-term (2-3 years)',
          cost: 'High',
          impact: 'High'
        },
        {
          title: 'Improve Ease of Doing Business',
          description: 'Streamline regulations and reduce bureaucratic hurdles',
          implementation: 'Short-term (6-12 months)',
          cost: 'Low',
          impact: 'Medium'
        },
        {
          title: 'Invest in Infrastructure',
          description: 'Develop transportation, utilities, and digital infrastructure',
          implementation: 'Long-term (3-5 years)',
          cost: 'Very High',
          impact: 'Very High'
        }
      ],
      'social': [
        {
          title: 'Universal Healthcare',
          description: 'Implement comprehensive healthcare coverage for all citizens',
          implementation: 'Medium-term (2-3 years)',
          cost: 'High',
          impact: 'Very High'
        },
        {
          title: 'Quality Education for All',
          description: 'Improve access to quality education at all levels',
          implementation: 'Long-term (3-5 years)',
          cost: 'High',
          impact: 'Very High'
        },
        {
          title: 'Social Protection Programs',
          description: 'Expand social safety nets and poverty alleviation programs',
          implementation: 'Short-term (6-12 months)',
          cost: 'Medium',
          impact: 'High'
        }
      ],
      'environmental': [
        {
          title: 'Renewable Energy Transition',
          description: 'Increase share of renewable energy in total energy mix',
          implementation: 'Long-term (3-5 years)',
          cost: 'High',
          impact: 'High'
        },
        {
          title: 'Public Transportation',
          description: 'Develop efficient and affordable public transportation systems',
          implementation: 'Medium-term (2-3 years)',
          cost: 'High',
          impact: 'Medium'
        },
        {
          title: 'Waste Management',
          description: 'Implement comprehensive waste management and recycling programs',
          implementation: 'Short-term (6-12 months)',
          cost: 'Medium',
          impact: 'Medium'
        }
      ]
    };

    const categoryRecommendations = recommendations[category.toLowerCase()] || [];
    res.json({ recommendations: categoryRecommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// Helper function to find similar cities
function findSimilarCities(targetCity, allCities) {
  const targetMetrics = targetCity.metrics[targetCity.metrics.length - 1];
  
  return allCities
    .filter(city => city._id !== targetCity._id)
    .map(city => {
      const cityMetrics = city.metrics[city.metrics.length - 1];
      const similarity = calculateSimilarity(targetMetrics, cityMetrics);
      return {
        city: city.name,
        state: city.state,
        similarity: similarity,
        metrics: {
          hdi: cityMetrics.hdi,
          gdpPerCapita: cityMetrics.gdpPerCapita,
          populationGrowthRate: cityMetrics.populationGrowthRate
        }
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
}

// Helper function to calculate similarity between cities
function calculateSimilarity(metrics1, metrics2) {
  const keyMetrics = ['hdi', 'gdpPerCapita', 'literacyRate', 'lifeExpectancy'];
  let similarity = 0;
  
  keyMetrics.forEach(metric => {
    const diff = Math.abs(metrics1[metric] - metrics2[metric]);
    const max = Math.max(metrics1[metric], metrics2[metric]);
    similarity += (max - diff) / max;
  });
  
  return similarity / keyMetrics.length;
}

// Helper function to get success stories
function getSuccessStories(targetCity, allCities) {
  const targetMetrics = targetCity.metrics[targetCity.metrics.length - 1];
  const stories = [];
  
  // Find cities with better performance in key areas
  allCities.forEach(city => {
    const cityMetrics = city.metrics[city.metrics.length - 1];
    
    if (cityMetrics.hdi > targetMetrics.hdi + 0.05) {
      stories.push({
        city: city.name,
        area: 'Human Development',
        improvement: `HDI: ${targetMetrics.hdi.toFixed(3)} → ${cityMetrics.hdi.toFixed(3)}`,
        strategy: 'Focus on education and healthcare investment'
      });
    }
    
    if (cityMetrics.gdpPerCapita > targetMetrics.gdpPerCapita * 1.2) {
      stories.push({
        city: city.name,
        area: 'Economic Growth',
        improvement: `GDP per capita: ${targetMetrics.gdpPerCapita} → ${cityMetrics.gdpPerCapita}`,
        strategy: 'Economic diversification and investment attraction'
      });
    }
  });
  
  return stories.slice(0, 3);
}

module.exports = router; 