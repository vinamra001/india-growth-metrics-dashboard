import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import axios from 'axios';
import {
  CheckCircle
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar
} from 'recharts';

interface City {
  _id: string;
  name: string;
  state: string;
  metrics: {
    gdp: number;
    gdpPerCapita: number;
    hdi: number;
    infantMortalityRate: number;
    literacyRate: number;
    educationIndex: number;
    genderInequalityIndex: number;
    populationGrowthRate: number;
    urbanPopulation: number;
    healthcareExpenditure: number;
    physiciansPer1000: number;
    hospitalBedsPer1000: number;
    cleanWaterAccess: number;
    vaccinationCoverage: number;
    co2EmissionsPerCapita: number;
    renewableEnergy: number;
    forestArea: number;
    airQualityIndex: number;
    environmentalPerformanceIndex: number;
    corruptionPerceptionsIndex: number;
    internetPenetration: number;
    mobilePhoneSubscriptions: number;
    infrastructureQualityIndex: number;
    politicalStabilityIndex: number;
    giniCoefficient: number;
    povertyRate: number;
    socialProtectionCoverage: number;
  };
}

const CityComparison: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cities');
      const citiesData = response.data.data || response.data || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
      if (citiesData.length >= 2) {
        setSelectedCities([citiesData[0].name, citiesData[1].name]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch cities data');
      console.error('Error fetching data:', err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCityData = cities.filter(city => selectedCities.includes(city.name));

  const comparisonData = selectedCityData.map(city => ({
    name: city.name,
    gdp: city.metrics.gdp,
    hdi: city.metrics.hdi,
    literacyRate: city.metrics.literacyRate,
    healthcareExpenditure: city.metrics.healthcareExpenditure,
    internetPenetration: city.metrics.internetPenetration,
    airQualityIndex: city.metrics.airQualityIndex,
  }));

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading cities data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🏙️ City Comparison
      </Typography>

      {/* City Selection */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Select Cities to Compare" />
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Search Cities"
                variant="outlined"
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Add City</InputLabel>
                <Select
                  value=""
                  label="Add City"
                >
                  {cities
                    .filter(city => !selectedCities.includes(city.name))
                    .map(city => (
                      <MenuItem key={city._id} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Selected Cities */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Cities ({selectedCities.length}/4):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedCities.map(cityName => (
                <Chip
                  key={cityName}
                  label={cityName}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      {selectedCityData.length >= 2 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* GDP Comparison */}
          <Box>
            <Card>
              <CardHeader title="GDP Comparison" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="gdp" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* HDI Comparison */}
          <Box>
            <Card>
              <CardHeader title="HDI Comparison" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="hdi" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Detailed Comparison Table */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Card>
              <CardHeader title="Detailed Metrics Comparison" />
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        {selectedCityData.map(city => (
                          <TableCell key={city._id} align="center">
                            {city.name}
                          </TableCell>
                        ))}
                        <TableCell>Best</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { key: 'gdp', label: 'GDP (₹K)', format: (v: number) => `₹${(v / 1000).toFixed(1)}K` },
                        { key: 'hdi', label: 'HDI', format: (v: number) => v.toFixed(3) },
                        { key: 'literacyRate', label: 'Literacy Rate (%)', format: (v: number) => `${(v * 100).toFixed(1)}%` },
                        { key: 'healthcareExpenditure', label: 'Healthcare Expenditure (₹K)', format: (v: number) => `₹${(v / 1000).toFixed(1)}K` },
                        { key: 'internetPenetration', label: 'Internet Penetration (%)', format: (v: number) => `${(v * 100).toFixed(1)}%` },
                        { key: 'airQualityIndex', label: 'Air Quality Index', format: (v: number) => v.toFixed(1) },
                      ].map(metric => {
                        const values = selectedCityData.map(city => city.metrics[metric.key as keyof City['metrics']] || 0);
                        const bestValue = Math.max(...values);
                        const bestCity = selectedCityData.find(city => 
                          (city.metrics[metric.key as keyof City['metrics']] || 0) === bestValue
                        );

                        return (
                          <TableRow key={metric.key}>
                            <TableCell component="th" scope="row">
                              {metric.label}
                            </TableCell>
                            {selectedCityData.map(city => {
                              const value = city.metrics[metric.key as keyof City['metrics']] || 0;
                              return (
                                <TableCell key={city._id} align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {metric.format(value)}
                                    {value === bestValue && <CheckCircle color="success" sx={{ ml: 1 }} />}
                                  </Box>
                                </TableCell>
                              );
                            })}
                            <TableCell align="center">
                              <Chip 
                                label={bestCity?.name || ''} 
                                color="success" 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {selectedCityData.length < 2 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select at least 2 cities to compare their metrics.
        </Alert>
      )}
    </Box>
  );
};

export default CityComparison; 