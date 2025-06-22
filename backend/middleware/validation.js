const validateCityMetrics = (req, res, next) => {
  const requiredMetrics = [
    'gdp', 'gni', 'gdpPerCapita', 'unemploymentRate',
    'hdi', 'lifeExpectancy', 'literacyRate',
    'airQualityIndex', 'renewableEnergy', 'povertyRate',
    'coordinates', 'year'
  ];

  const { body } = req;
  const errors = [];

  // Validate required fields
  requiredMetrics.forEach(metric => {
    if (!body[metric]) {
      errors.push(`${metric} is required`);
    }
  });

  // Validate coordinates
  if (body.coordinates) {
    if (!body.coordinates.lat || !body.coordinates.lng) {
      errors.push('Coordinates must include both lat and lng');
    }
  }

  // Validate year
  if (body.year) {
    if (typeof body.year !== 'number' || body.year < 1900 || body.year > 2100) {
      errors.push('Year must be a valid number between 1900 and 2100');
    }
  }

  // Validate metric ranges
  const metricRanges = {
    gdp: { min: 0 },
    gni: { min: 0 },
    gdpPerCapita: { min: 0 },
    unemploymentRate: { min: 0, max: 100 },
    hdi: { min: 0, max: 1 },
    lifeExpectancy: { min: 0, max: 120 },
    literacyRate: { min: 0, max: 100 },
    airQualityIndex: { min: 0 },
    renewableEnergy: { min: 0, max: 100 },
    povertyRate: { min: 0, max: 100 }
  };

  Object.entries(metricRanges).forEach(([metric, range]) => {
    if (body[metric] !== undefined) {
      if (body[metric] < range.min || (range.max && body[metric] > range.max)) {
        errors.push(`${metric} must be between ${range.min} and ${range.max || 'any positive number'}`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateCityMetrics
};
