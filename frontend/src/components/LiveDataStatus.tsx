import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

interface ApiStatus {
  worldBank: string;
  who: string;
  imf: string;
  lastChecked: string;
}

const LiveDataStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/cities/api/status`);
      setApiStatus(response.data.data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch live data status');
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'disconnected':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatLastChecked = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading && !apiStatus) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Live Data Sources Status"
        subheader="Real-time connection status to external data APIs"
        action={
          <Tooltip title="Refresh Status">
            <IconButton onClick={fetchStatus} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {lastRefresh && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Last refreshed: {formatLastChecked(lastRefresh.toISOString())}
          </Typography>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {apiStatus && Object.entries(apiStatus).filter(([key]) => key !== 'lastChecked').map(([source, status]) => (
            <Box key={source}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize' }}>
                      {source === 'worldBank' ? 'World Bank' : source.toUpperCase()}
                    </Typography>
                    {getStatusIcon(status)}
                  </Box>
                  
                  <Box mb={1}>
                    <Chip
                      label={status}
                      color={getStatusColor(status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={status === 'Connected' ? 'Available' : 'Unavailable'}
                      color={status === 'Connected' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last checked: {formatLastChecked(apiStatus.lastChecked)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Data is automatically refreshed every 5 minutes. External APIs include World Bank, WHO, and IMF for real-time economic and health indicators.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LiveDataStatus; 