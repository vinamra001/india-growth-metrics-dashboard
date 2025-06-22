const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  economic: {
    gdp: { type: Number },
    gni: { type: Number },
    gdpPerCapita: { type: Number },
    unemploymentRate: { type: Number },
    inflationRate: { type: Number },
    foreignDirectInvestment: { type: Number },
    exportImportRatio: { type: Number },
    publicDebt: { type: Number }
  },
  social: {
    hdi: { type: Number },
    lifeExpectancy: { type: Number },
    infantMortalityRate: { type: Number },
    literacyRate: { type: Number },
    educationIndex: { type: Number },
    genderInequalityIndex: { type: Number },
    populationGrowthRate: { type: Number },
    urbanPopulation: { type: Number }
  },
  health: {
    healthcareExpenditure: { type: Number },
    physiciansPer1000: { type: Number },
    hospitalBedsPer1000: { type: Number },
    cleanWaterAccess: { type: Number },
    vaccinationCoverage: { type: Number }
  },
  environment: {
    co2Emissions: { type: Number },
    renewableEnergy: { type: Number },
    forestArea: { type: Number },
    airQualityIndex: { type: Number },
    environmentalPerformanceIndex: { type: Number }
  },
  governance: {
    corruptionIndex: { type: Number },
    internetPenetration: { type: Number },
    mobileSubscriptions: { type: Number },
    infrastructureQuality: { type: Number },
    politicalStability: { type: Number }
  },
  economicEquality: {
    giniCoefficient: { type: Number },
    povertyRate: { type: Number },
    socialProtectionCoverage: { type: Number }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Metric', metricSchema);
