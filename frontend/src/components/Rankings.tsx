import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Star,
  StarBorder,
  Sort,
  SortByAlpha
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';
import config from '../config';

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

const Rankings: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('gdp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/cities`);
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
  };

  const metricOptions = [
    { value: 'gdp', label: 'GDP', icon: '💰' },
    { value: 'hdi', label: 'Human Development Index', icon: '👥' },
    { value: 'literacyRate', label: 'Literacy Rate', icon: '📚' },
    { value: 'healthcareExpenditure', label: 'Healthcare Expenditure', icon: '💊' },
    { value: 'internetPenetration', label: 'Internet Penetration', icon: '🌐' },
    { value: 'renewableEnergy', label: 'Renewable Energy', icon: '🌱' },
    { value: 'airQualityIndex', label: 'Air Quality Index', icon: '🌬️' },
    { value: 'infrastructureQualityIndex', label: 'Infrastructure Quality', icon: '🏗️' },
  ];

  const getMetricIcon = (metric: string) => {
    const option = metricOptions.find(opt => opt.value === metric);
    return option ? option.icon : '📊';
  };

  const formatMetricValue = (value: number, metric: string) => {
    if (metric.includes('Rate') || metric.includes('Index')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (metric.includes('gdp') || metric.includes('expenditure')) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    if (metric === 'hdi') {
      return value.toFixed(3);
    }
    return value.toFixed(1);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return '#cd7f32'; // bronze
    return 'default';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <EmojiEvents sx={{ color: 'gold' }} />;
    if (rank === 2) return <Star sx={{ color: 'silver' }} />;
    if (rank === 3) return <Star sx={{ color: '#cd7f32' }} />;
    return <StarBorder />;
  };

  const getMetricValue = (city: City, metric: string): number => {
    return city.metrics[metric as keyof City['metrics']] || 0;
  };

  const sortedCities = [...cities].sort((a, b) => {
    const aValue = getMetricValue(a, selectedMetric);
    const bValue = getMetricValue(b, selectedMetric);
    
    if (sortOrder === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  const chartData = sortedCities.slice(0, 10).map((city, index) => ({
    name: city.name,
    rank: index + 1,
    value: getMetricValue(city, selectedMetric),
    formattedValue: formatMetricValue(getMetricValue(city, selectedMetric), selectedMetric),
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🏆 City Rankings
      </Typography>

      {/* Metric Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
              <FormControl fullWidth>
                <InputLabel>Select Metric</InputLabel>
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  label="Select Metric"
                >
                  {metricOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '3' } }}>
              <Typography variant="body2" color="text.secondary">
                Showing top {Math.min(10, sortedCities.length)} cities
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '4' } }}>
              <Typography variant="body2" color="text.secondary">
                Total: {cities.length} cities
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Rankings Chart */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Card>
            <CardHeader 
              title={`${metricOptions.find(m => m.value === selectedMetric)?.label} Rankings`}
              subheader="Top 10 Cities"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Rankings Table */}
        <Box>
          <Card>
            <CardHeader 
              title="Detailed Rankings"
              subheader={`Sorted by ${metricOptions.find(m => m.value === selectedMetric)?.label}`}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedCities.slice(0, 10).map((city, index) => (
                      <TableRow key={city._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getRankIcon(index + 1)}
                            <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
                              #{index + 1}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {city.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2">{city.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {city.state}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatMetricValue(getMetricValue(city, selectedMetric), selectedMetric)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Performance Summary */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardHeader title="Performance Summary" />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="gold">
                  🥇
                </Typography>
                <Typography variant="h6">
                  {sortedCities && sortedCities[0]?.name ? sortedCities[0].name : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best Performance
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="silver">
                  🥈
                </Typography>
                <Typography variant="h6">
                  {sortedCities && sortedCities[1]?.name ? sortedCities[1].name : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Second Best
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="#cd7f32">
                  🥉
                </Typography>
                <Typography variant="h6">
                  {sortedCities && sortedCities[2]?.name ? sortedCities[2].name : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Third Best
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="text.secondary">
                  📊
                </Typography>
                <Typography variant="h6">
                  {cities.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Cities
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Rankings; 