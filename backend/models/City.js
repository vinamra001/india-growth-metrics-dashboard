const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  // Economic Indicators
  gdp: { type: Number, required: true },
  gni: { type: Number, required: true },
  gdpPerCapita: { type: Number, required: true },
  unemploymentRate: { type: Number, required: true },
  inflationRate: { type: Number, required: true },
  foreignDirectInvestment: { type: Number, required: true },
  exportImportRatio: { type: Number, required: true },
  publicDebtGDP: { type: Number, required: true },
  
  // Social Development
  hdi: { type: Number, required: true },
  lifeExpectancy: { type: Number, required: true },
  infantMortalityRate: { type: Number, required: true },
  literacyRate: { type: Number, required: true },
  educationIndex: { type: Number, required: true },
  genderInequalityIndex: { type: Number, required: true },
  populationGrowthRate: { type: Number, required: true },
  urbanPopulation: { type: Number, required: true },
  
  // Health & Well-being
  healthcareExpenditure: { type: Number, required: true },
  physiciansPer1000: { type: Number, required: true },
  hospitalBedsPer1000: { type: Number, required: true },
  cleanWaterAccess: { type: Number, required: true },
  vaccinationCoverage: { type: Number, required: true },
  
  // Environment & Sustainability
  co2EmissionsPerCapita: { type: Number, required: true },
  renewableEnergy: { type: Number, required: true },
  forestArea: { type: Number, required: true },
  airQualityIndex: { type: Number, required: true },
  environmentalPerformanceIndex: { type: Number, required: true },
  
  // Governance & Infrastructure
  corruptionPerceptionsIndex: { type: Number, required: true },
  internetPenetration: { type: Number, required: true },
  mobilePhoneSubscriptions: { type: Number, required: true },
  infrastructureQualityIndex: { type: Number, required: true },
  politicalStabilityIndex: { type: Number, required: true },
  
  // Economic Equality
  giniCoefficient: { type: Number, required: true },
  povertyRate: { type: Number, required: true },
  socialProtectionCoverage: { type: Number, required: true }
});

const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  coordinates: coordinatesSchema,
  metrics: metricsSchema,
  year: { type: Number, required: true, default: 2023 }
}, {
  timestamps: true
});

module.exports = mongoose.model('City', citySchema); 