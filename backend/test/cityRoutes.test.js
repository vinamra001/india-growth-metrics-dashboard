const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const City = require('../models/City');

// Mock data
const mockCity = {
  name: 'Test City',
  state: 'Test State',
  country: 'Test Country',
  coordinates: {
    lat: 12.34,
    lng: 56.78
  },
  metrics: {
    gdp: 100000,
    gdpPerCapita: 50000,
    hdi: 0.8,
    unemploymentRate: 4.5,
    airQualityIndex: 50,
    renewableEnergy: 20,
    povertyRate: 10
  },
  year: 2023
};

// Database connection
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clear database
afterEach(async () => {
  await City.deleteMany({});
});

// Close connection
afterAll(async () => {
  await mongoose.connection.close();
});

describe('City Routes', () => {
  // Test GET /api/cities
  it('should get all cities', async () => {
    const response = await request(app).get('/api/cities');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Test POST /api/cities
  it('should create a new city', async () => {
    const response = await request(app)
      .post('/api/cities')
      .send(mockCity);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.name).toBe(mockCity.name);
  });

  // Test GET /api/cities/:id
  it('should get a city by ID', async () => {
    // Create a city first
    const createdCity = await City.create(mockCity);
    
    const response = await request(app)
      .get(`/api/cities/${createdCity._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(createdCity._id.toString());
  });

  // Test PUT /api/cities/:id
  it('should update a city', async () => {
    const createdCity = await City.create(mockCity);
    const updatedMetrics = { gdp: 150000 };

    const response = await request(app)
      .put(`/api/cities/${createdCity._id}`)
      .send({ metrics: updatedMetrics });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.metrics.gdp).toBe(updatedMetrics.gdp);
  });

  // Test DELETE /api/cities/:id
  it('should delete a city', async () => {
    const createdCity = await City.create(mockCity);

    const response = await request(app)
      .delete(`/api/cities/${createdCity._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify deletion
    const deletedCity = await City.findById(createdCity._id);
    expect(deletedCity).toBeNull();
  });

  // Test validation
  it('should validate city data', async () => {
    const invalidCity = { ...mockCity };
    delete invalidCity.name; // Remove required field

    const response = await request(app)
      .post('/api/cities')
      .send(invalidCity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('name is required');
  });
});

describe('Analytics Endpoints', () => {
  // Test trend analysis
  it('should analyze trends', async () => {
    // Create test cities
    const cities = await City.create([mockCity, { ...mockCity, name: 'Test City 2' }]);

    const response = await request(app)
      .post('/api/ai/trend-analysis')
      .send({
        cities: cities.map(c => c._id),
        metric: 'gdp',
        years: 5
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.trends).toBeDefined();
  });

  // Test anomaly detection
  it('should detect anomalies', async () => {
    const cities = await City.create([mockCity, { ...mockCity, name: 'Test City 2' }]);

    const response = await request(app)
      .post('/api/ai/anomaly-detection')
      .send({
        cities: cities.map(c => c._id),
        metric: 'gdp'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.anomalies).toBeDefined();
  });
});

describe('Export Endpoints', () => {
  // Test PDF export
  it('should export to PDF', async () => {
    const cities = await City.create([mockCity, { ...mockCity, name: 'Test City 2' }]);

    const response = await request(app)
      .post('/api/export/pdf')
      .send({
        cities: cities.map(c => c._id),
        metrics: ['gdp', 'hdi'],
        filename: 'test-report'
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
  });

  // Test CSV export
  it('should export to CSV', async () => {
    const cities = await City.create([mockCity, { ...mockCity, name: 'Test City 2' }]);

    const response = await request(app)
      .post('/api/export/csv')
      .send({
        cities: cities.map(c => c._id),
        metrics: ['gdp', 'hdi'],
        filename: 'test-data'
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv');
  });
});
