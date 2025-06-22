import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Analytics,
  ShowChart,
  Psychology,
  ExpandMore,
  CloudUpload
} from '@mui/icons-material';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import config from '../config';

interface City {
  _id: string;
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  metrics: {
    gdpPerCapita: number;
    population: number;
    unemploymentRate: number;
    lifeExpectancy: number;
    educationIndex: number;
    healthIndex: number;
    hdi?: number;
    literacyRate?: number;
  };
}

interface Anomaly {
  city: string;
  metric: keyof City['metrics'];
  value: number;
  zScore: number;
  severity: 'high' | 'medium';
}

interface Correlation {
  metric1: keyof City['metrics'];
  metric2: keyof City['metrics'];
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  direction: 'positive' | 'negative';
  correlationScore?: number;
}

interface Cluster {
  clusterId: number;
  cities: City[];
  centroid: any;
  size: number;
  characteristics: any;
}

interface Trend {
  city: string;
  currentValue: number;
  prediction: number;
  trend: string;
  confidence?: number;
}

const DEFAULT_METRICS = ['gdpPerCapita', 'population', 'unemploymentRate', 'lifeExpectancy', 'educationIndex', 'healthIndex'];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

const AdvancedAnalytics: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [openScenarioDialog, setOpenScenarioDialog] = useState<boolean>(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/cities`);
      const citiesData = response.data.data || response.data || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setError('');
    } catch (error) {
      console.error('Error fetching cities:', error);
      setError('Failed to fetch cities data');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async () => {
    if (DEFAULT_METRICS.length < 2) {
      setError('Please select at least 2 metrics for analysis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch anomalies
      const anomaliesResponse = await axios.post(`${config.API_URL}/api/ai/anomaly-detection`, {
        cities: cities.map(c => c._id),
        metric: DEFAULT_METRICS[0]
      });
      setAnomalies(anomaliesResponse.data.anomalies || []);

      // Fetch correlations
      const correlationResponse = await axios.post(`${config.API_URL}/api/ai/correlation-analysis`, {
        cities: cities.map(c => c._id),
        metric1: DEFAULT_METRICS[0],
        metric2: DEFAULT_METRICS[1]
      });
      setCorrelations(correlationResponse.data.correlations || []);

      // Fetch clustering
      const clusteringResponse = await axios.post(`${config.API_URL}/api/clustering/cities`, {
        k: 4,
        metrics: DEFAULT_METRICS
      });
      setClusters(clusteringResponse.data.clusters || []);

      // Fetch trends
      const trendsResponse = await axios.post(`${config.API_URL}/api/ai/trend-analysis`, {
        cities: cities.map(c => c._id),
        metric: DEFAULT_METRICS[0],
        years: 5
      });
      setTrends(trendsResponse.data.trends || []);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to perform analysis');
    } finally {
      setLoading(false);
    }
  };

  const performScenarioAnalysis = async () => {
    if (!selectedCity) {
      setError('Please select a city for scenario analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/api/clustering/scenario-analysis`, {
        cityId: selectedCity,
        scenarios: [
          {
            name: 'Investment Boost',
            description: 'Increase investment in key sectors',
            investmentIncrease: 10,
            timeline: '3 years',
            cost: 'High'
          },
          {
            name: 'Education Focus',
            description: 'Prioritize education and skill development',
            educationInitiatives: 5,
            timeline: '5 years',
            cost: 'Medium'
          },
          {
            name: 'Healthcare Enhancement',
            description: 'Improve healthcare infrastructure and accessibility',
            healthcareImprovement: 15,
            timeline: '4 years',
            cost: 'High'
          },
          {
            name: 'Environmental Protection',
            description: 'Implement environmental protection measures',
            environmentalMeasures: 8,
            timeline: '3 years',
            cost: 'Medium'
          }
        ]
      });
      setScenarios(response.data.scenarios);
      setOpenScenarioDialog(true);
    } catch (error) {
      console.error('Scenario analysis error:', error);
      setError('Failed to perform scenario analysis');
    } finally {
      setLoading(false);
    }
  };

  const getClusterChartData = () => {
    return clusters.map((cluster, index) => ({
      name: `Cluster ${cluster.clusterId}`,
      size: cluster.size,
      hdi: cluster.centroid.hdi || 0,
      gdpPerCapita: cluster.centroid.gdpPerCapita || 0,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const getTrendChartData = () => {
    return trends.map(trend => ({
      city: trend.city,
      currentValue: trend.currentValue,
      prediction: trend.prediction,
      trend: trend.trend
    }));
  };

  const getCorrelationChartData = () => {
    return correlations.map(corr => ({
      city: corr.metric1,
      correlation: corr.correlationScore || corr.correlation,
      direction: corr.direction,
      strength: corr.strength
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setUploadError('');
    setUploadResult(null);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${config.API_URL}/api/cities/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(response.data);
      handleNotification('File uploaded and analyzed successfully!', 'success');
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
      handleNotification('File upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Add a simple notification handler
  const handleNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    alert(`${severity.toUpperCase()}: ${message}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
        Advanced Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth>
                <InputLabel>Select City</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  label="Select City"
                  disabled={loading}
                >
                  {cities.length === 0 && !loading && (
                    <MenuItem disabled>No cities available</MenuItem>
                  )}
                  {loading && (
                    <MenuItem disabled>Loading cities...</MenuItem>
                  )}
                  {cities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Button
                variant="contained"
                onClick={analyzeData}
                disabled={loading}
                startIcon={<ShowChart />}
                fullWidth
              >
                Analyze Data
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Button
                variant="outlined"
                onClick={performScenarioAnalysis}
                disabled={loading || !selectedCity}
                startIcon={<Psychology />}
                fullWidth
              >
                Scenario Analysis
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={uploading}
                fullWidth
              >
                Upload Data
                <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={handleFileUpload} />
              </Button>
            </Box>
          </Box>
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
          {uploadResult && Array.isArray(uploadResult.analytics) && uploadResult.analytics.map((result: any, index: number) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardHeader title={`${result.city} Analysis`} />
              <CardContent>
                <Typography variant="h6" gutterBottom>Metrics Summary:</Typography>
                {Object.entries(result.metrics).map(([metric, data]: [string, any]) => (
                  <Box key={metric} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {metric}: Average {data.average?.toFixed(2)}, Trend {data.trend?.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="caption" color="text.secondary">
                  Records analyzed: {result.count}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Analyzing data...
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Clustering Analysis */}
        {clusters.length > 0 && (
          <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
            <Card>
              <CardHeader
                title="City Clustering Analysis"
                subheader={`${clusters.length} clusters based on ${DEFAULT_METRICS.join(', ')}`}
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getClusterChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="size"
                    >
                      {getClusterChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {clusters.map(cluster => (
                    <Accordion key={cluster.clusterId}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>
                          Cluster {cluster.clusterId} ({cluster.size} cities)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" gutterBottom>
                          Cities: {(cluster.cities || []).map(c => c.name).join(', ')}
                        </Typography>
                        <Typography variant="body2">
                          Characteristics: {Object.entries(cluster.characteristics || {}).map(([key, value]: [string, any]) => 
                            `${key}: ${value.average?.toFixed(2) || 'N/A'}`
                          ).join(', ')}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Trend Analysis Results */}
        {trends.length > 0 && (
          <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
            <Card>
              <CardHeader
                title="Trend Analysis"
                subheader={`${DEFAULT_METRICS[0]} trends across cities`}
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTrendChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="currentValue" fill="#8884d8" name="Current" />
                    <Bar dataKey="prediction" fill="#82ca9d" name="Predicted" />
                  </BarChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {trends.slice(0, 5).map((trend, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {trend.city}: {trend.trend} trend (confidence: {((trend.confidence || 0.8) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Anomaly Detection Results */}
        {anomalies.length > 0 && (
          <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
            <Card>
              <CardHeader
                title="Anomaly Detection"
                subheader={`Detected ${anomalies.length} anomalies in ${DEFAULT_METRICS[0]}`}
              />
              <CardContent>
                <List>
                  {anomalies.map((anomaly, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={anomaly.city}
                        secondary={`Value: ${anomaly.value.toFixed(2)}, Z-Score: ${anomaly.zScore.toFixed(2)}`}
                      />
                      <Chip
                        label={anomaly.severity}
                        color={anomaly.severity === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Correlation Analysis Results */}
        {correlations.length > 0 && (
          <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
            <Card>
              <CardHeader
                title="Correlation Analysis"
                subheader={`${DEFAULT_METRICS[0]} vs ${DEFAULT_METRICS[1]}`}
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="correlation" />
                    <YAxis />
                    <Tooltip />
                    <Scatter data={getCorrelationChartData()} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {correlations.slice(0, 5).map((corr, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {corr.metric1} vs {corr.metric2}: {corr.strength} {corr.direction} correlation ({((corr.correlationScore || corr.correlation) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Scenario Analysis Dialog */}
      <Dialog
        open={openScenarioDialog}
        onClose={() => setOpenScenarioDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Scenario Analysis Results</DialogTitle>
        <DialogContent>
          {scenarios.map((scenario: any, index: number) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {scenario.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scenario.description}
                </Typography>
                <Typography variant="body2">
                  Timeline: {scenario.timeline} | Cost: {scenario.cost}
                </Typography>
                {scenario.projectedMetrics && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Projected Improvements:
                    </Typography>
                    {Object.entries(scenario.projectedMetrics).map(([metric, value]: [string, any]) => (
                      <Typography key={metric} variant="body2">
                        {metric}: {typeof value === 'number' ? value.toFixed(2) : value}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScenarioDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAnalytics;