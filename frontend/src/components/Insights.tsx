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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Analytics,
  EmojiEvents,
  CheckCircle,
  Info,
  AttachMoney,
  People,
  HealthAndSafety,
  School,
  Speed,
  Warning,
  ExpandMore
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const Insights: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cities');
      // Handle the response structure properly
      const citiesData = response.data.data || response.data || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch insights data');
      console.error('Error fetching data:', err);
      setCities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'gdp':
      case 'gdpPerCapita':
        return <AttachMoney color="primary" />;
      case 'hdi':
        return <People color="success" />;
      case 'healthcareExpenditure':
        return <HealthAndSafety color="info" />;
      case 'literacyRate':
        return <School color="secondary" />;
      case 'renewableEnergy':
        return <Speed color="success" />;
      case 'internetPenetration':
        return <Speed color="primary" />;
      default:
        return <TrendingUp color="primary" />;
    }
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

  const calculateInsights = () => {
    if (!cities.length) return null;

    const avgGDP = cities.reduce((sum, city) => sum + (city.metrics.gdpPerCapita || 0), 0) / cities.length;
    const avgHDI = cities.reduce((sum, city) => sum + (city.metrics.hdi || 0), 0) / cities.length;
    const avgLiteracy = cities.reduce((sum, city) => sum + (city.metrics.literacyRate || 0), 0) / cities.length;
    const avgHealthcare = cities.reduce((sum, city) => sum + (city.metrics.healthcareExpenditure || 0), 0) / cities.length;

    const topGDP = cities.sort((a, b) => (b.metrics.gdpPerCapita || 0) - (a.metrics.gdpPerCapita || 0)).slice(0, 3);
    const topHDI = cities.sort((a, b) => (b.metrics.hdi || 0) - (a.metrics.hdi || 0)).slice(0, 3);
    const topLiteracy = cities.sort((a, b) => (b.metrics.literacyRate || 0) - (a.metrics.literacyRate || 0)).slice(0, 3);
    const worstAirQuality = cities.sort((a, b) => (a.metrics.airQualityIndex || 0) - (b.metrics.airQualityIndex || 0)).slice(0, 3);

    return {
      averages: { avgGDP, avgHDI, avgLiteracy, avgHealthcare },
      topPerformers: { topGDP, topHDI, topLiteracy },
      challenges: { worstAirQuality }
    };
  };

  const insightsData = calculateInsights();

  const pieData = cities.map(city => ({
    name: city.name,
    value: city.metrics.gdpPerCapita || 0,
  }));

  const hdiData = cities.map(city => ({
    name: city.name,
    HDI: city.metrics.hdi,
    Literacy: city.metrics.literacyRate * 100,
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
        💡 Data Insights & Analysis
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cities
              </Typography>
              <Typography variant="h4">
                {cities.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average GDP
              </Typography>
              <Typography variant="h4">
                ₹{cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.gdpPerCapita || 0), 0) / cities.length / 1000).toFixed(1) : 0}K
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average HDI
              </Typography>
              <Typography variant="h4">
                {cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.hdi || 0), 0) / cities.length).toFixed(2) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Literacy
              </Typography>
              <Typography variant="h4">
                {cities.length > 0 ? (cities.reduce((sum, city) => sum + (city.metrics.literacyRate || 0), 0) / cities.length).toFixed(1) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <Card>
            <CardHeader title="GDP Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cities.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="metrics.gdpPerCapita" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardHeader title="HDI vs Literacy Rate" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cities.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="metrics.hdi" fill="#82ca9d" />
                  <Bar dataKey="metrics.literacyRate" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Top Performers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <Box>
          <Card>
            <CardHeader title="Top GDP Cities" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {cities
                  .sort((a, b) => b.metrics.gdpPerCapita - a.metrics.gdpPerCapita)
                  .slice(0, 5)
                  .map((city, index) => (
                    <Box key={city.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {index + 1}. {city.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ₹{(city.metrics.gdpPerCapita || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardHeader title="Top HDI Cities" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {cities
                  .sort((a, b) => b.metrics.hdi - a.metrics.hdi)
                  .slice(0, 5)
                  .map((city, index) => (
                    <Box key={city.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {index + 1}. {city.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(city.metrics.hdi || 0).toFixed(3)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardHeader title="Top Literacy Cities" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {cities
                  .sort((a, b) => b.metrics.literacyRate - a.metrics.literacyRate)
                  .slice(0, 5)
                  .map((city, index) => (
                    <Box key={city.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {index + 1}. {city.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(city.metrics.literacyRate || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Challenges Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, mt: 2 }}>
        <Box>
          <Card>
            <CardHeader title="Areas for Improvement" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" color="error">
                  Cities with Lowest HDI
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cities
                    .sort((a, b) => a.metrics.hdi - b.metrics.hdi)
                    .slice(0, 3)
                    .map((city, index) => (
                      <Box key={city.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {index + 1}. {city.name}
                        </Typography>
                        <Typography variant="body2" color="error">
                          HDI: {(city.metrics.hdi || 0).toFixed(3)}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Insights; 