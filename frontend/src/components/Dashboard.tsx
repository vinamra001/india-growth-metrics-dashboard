import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import LiveDataStatus from './LiveDataStatus';
import CityMap from './CityMap';
import config from '../config';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

interface City {
  _id: string;
  name: string;
  state: string;
  lastUpdated?: string;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [mapMetric, setMapMetric] = useState<string>('gdpPerCapita');

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = config.API_URL;
      const response = await axios.get(`${apiUrl}/api/cities`, { params: { granularity } });
      const citiesData = response.data.data || response.data || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cities data');
      console.error('Error fetching data:', err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, [granularity]);

  useEffect(() => {
    fetchCities();
    const interval = setInterval(() => {
      fetchCities();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [granularity, fetchCities]);

  // Add refresh button handler
  const handleRefreshData = () => {
    // console.log('Refreshing live data from APIs...');
    fetchCities();
  };

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
      {/* Live Data Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Live Data Dashboard
          </Typography>
          <Chip 
            label="Live APIs" 
            color="success" 
            size="small" 
          />
        </Box>
        <Tooltip title="Refresh live data from APIs">
          <IconButton 
            onClick={handleRefreshData} 
            disabled={loading}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Live Data Sources Status */}
      <Box sx={{ mb: 3 }}>
        <LiveDataStatus />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small">
          <InputLabel>Granularity</InputLabel>
          <Select
            value={granularity}
            label="Granularity"
            onChange={e => setGranularity(e.target.value as any)}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          Select time series granularity for metrics
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {/* Summary Cards */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
              <Typography color="textSecondary" gutterBottom>
                Total Cities
              </Typography>
              <Typography variant="h4">
                {cities.length}
                  </Typography>
                </Box>
                <Chip label="Live" color="success" size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                From external APIs
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
              <Typography color="textSecondary" gutterBottom>
                Average GDP
              </Typography>
              <Typography variant="h4">
                    ₹{cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.gdpPerCapita || 0), 0) / cities.length / 1000).toFixed(1) : 0}K
                  </Typography>
                </Box>
                <Chip label="Live" color="success" size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Real-time from World Bank
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
              <Typography color="textSecondary" gutterBottom>
                Average HDI
              </Typography>
              <Typography variant="h4">
                    {cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.hdi || 0), 0) / cities.length).toFixed(3) : 0}
                  </Typography>
                </Box>
                <Chip label="Live" color="success" size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Real-time from WHO
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
              <Typography color="textSecondary" gutterBottom>
                Average Literacy Rate
              </Typography>
              <Typography variant="h4">
                    {cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.literacyRate || 0), 0) / cities.length).toFixed(1) : 0}%
                  </Typography>
                </Box>
                <Chip label="Live" color="success" size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Real-time from UNESCO
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* GDP Comparison Chart */}
        <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
          <Card>
            <CardHeader 
              title="GDP Comparison (Live Data)" 
              action={<Chip label="World Bank API" color="primary" size="small" />}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="metrics.gdpPerCapita" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* HDI Distribution */}
        <Box sx={{ gridColumn: { xs: '1', md: '3 / 5' } }}>
          <Card>
            <CardHeader 
              title="HDI Distribution (Live Data)" 
              action={<Chip label="WHO API" color="primary" size="small" />}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cities}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, metrics }) => `${name}: ${metrics.hdi.toFixed(3)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="metrics.hdi"
                  >
                    {cities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* City Details */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardHeader 
              title="City Details (Live Data)" 
              action={<Chip label="Multiple APIs" color="primary" size="small" />}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {cities.map((city) => (
                  <Box key={city._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {city.name}
                        </Typography>
                          <Chip label="Live" color="success" size="small" />
                        </Box>
                        <Typography color="textSecondary">
                          {city.state}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">GDP:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{(city.metrics.gdpPerCapita / 1000).toFixed(1)}K
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">HDI:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {city.metrics.hdi.toFixed(3)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Literacy:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {city.metrics.literacyRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        {city.lastUpdated && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Updated: {new Date(city.lastUpdated).toLocaleString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* After summary cards, add map metric selector and CityMap */}
      <Box sx={{ my: 4 }}>
        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Map Metric</InputLabel>
          <Select
            value={mapMetric}
            label="Map Metric"
            onChange={e => setMapMetric(e.target.value as string)}
          >
            {Object.keys(cities[0]?.metrics || {}).map(key => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <CityMap cities={cities} metric={mapMetric} />
      </Box>
    </Box>
  );
};

export default Dashboard; 