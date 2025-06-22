import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  LinearProgress,
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
  TextField
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Sort as SortIcon,
  SortByAlpha as SortByAlphaIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import config from '../config';

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

interface Metric {
  category: string;
  key: string;
  label: string;
  unit: string;
}

const Rankings: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('hdi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    fetchCities();
  }, []);

  const metrics: Metric[] = [
    { category: 'Economic', key: 'gdpPerCapita', label: 'GDP per Capita', unit: '₹' },
    { category: 'Social', key: 'hdi', label: 'Human Development Index', unit: '' },
    { category: 'Social', key: 'literacyRate', label: 'Literacy Rate', unit: '%' },
    { category: 'Health', key: 'healthcareExpenditure', label: 'Healthcare Expenditure', unit: '₹' },
    { category: 'Environment', key: 'airQualityIndex', label: 'Air Quality Index', unit: '' },
    { category: 'Infrastructure', key: 'infrastructureQualityIndex', label: 'Infrastructure Quality', unit: '' },
    { category: 'Digital', key: 'internetPenetration', label: 'Internet Penetration', unit: '%' },
    { category: 'Equality', key: 'giniCoefficient', label: 'Gini Coefficient', unit: '' }
  ];

  const filteredAndSortedCities = cities
    .filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a.metrics[selectedMetric as keyof City['metrics']] || 0;
      const bValue = b.metrics[selectedMetric as keyof City['metrics']] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    })
    .slice(0, 20);

  const selectedMetricData = metrics.find(m => m.key === selectedMetric);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading rankings...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        City Rankings
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Metric</InputLabel>
          <Select
            value={selectedMetric}
            label="Metric"
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {metrics.map(metric => (
              <MenuItem key={metric.key} value={metric.key}>
                {metric.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Order</InputLabel>
          <Select
            value={sortOrder}
            label="Order"
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <MenuItem value="desc">Descending</MenuItem>
            <MenuItem value="asc">Ascending</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Search cities"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Rankings Table */}
        <Card>
          <CardHeader 
            title={`Top 20 Cities by ${selectedMetricData?.label}`}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {sortOrder === 'desc' ? <TrendingUpIcon color="primary" /> : <TrendingDownIcon color="primary" />}
              </Box>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>{selectedMetricData?.label}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedCities.map((city, index) => (
                    <TableRow key={city._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{city.name}</TableCell>
                      <TableCell>{city.state}</TableCell>
                      <TableCell>
                        {selectedMetricData?.unit}
                        {city.metrics[selectedMetric as keyof City['metrics']]?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader title={`${selectedMetricData?.label} Distribution`} />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredAndSortedCities.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey={`metrics.${selectedMetric}`} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Rankings; 