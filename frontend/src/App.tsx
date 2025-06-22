import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Compare as CompareIcon,
  TrendingUp as RankingsIcon,
  Insights as InsightsIcon,
  Menu as MenuIcon,
  Analytics as AnalyticsIcon,
  Psychology as AdvancedIcon,
  CloudSync
} from '@mui/icons-material';
import Dashboard from './components/Dashboard';
import CityComparison from './components/CityComparison';
import Rankings from './components/Rankings';
import Insights from './components/Insights';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import LiveDataStatus from './components/LiveDataStatus';

// Create a beautiful theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [value, setValue] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Initialize data and perform any necessary setup
    const initializeApp = async () => {
      try {
        // Simulate data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error('App initialization error:', err);
      }
    };
    initializeApp();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, component: <Dashboard /> },
    { label: 'City Comparison', icon: <CompareIcon />, component: <CityComparison /> },
    { label: 'Rankings', icon: <RankingsIcon />, component: <Rankings /> },
    { label: 'Insights', icon: <InsightsIcon />, component: <Insights /> },
    { label: 'Advanced Analytics', icon: <AdvancedIcon />, component: <AdvancedAnalytics /> },
    { label: 'Live Data Status', icon: <CloudSync />, component: <LiveDataStatus /> },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          India Growth Metrics
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            key={item.label}
            onClick={() => {
              setValue(index);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              backgroundColor: value === index ? 'primary.light' : 'transparent',
              color: value === index ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: value === index ? 'primary.main' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: value === index ? 'white' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed" color="primary" elevation={4} sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              India Growth Metrics Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {!isMobile && (
            <Drawer
              variant="permanent"
              sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: 240,
                  boxSizing: 'border-box',
                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {drawer}
            </Drawer>
          )}

          {isMobile && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 240,
                  boxSizing: 'border-box',
                },
              }}
            >
              {drawer}
            </Drawer>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {isMobile && (
              <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  {menuItems.map((item, index) => (
                    <Tab
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      iconPosition="start"
                      sx={{ minHeight: 64 }}
                    />
                  ))}
                </Tabs>
              </Paper>
            )}

            <Container maxWidth="xl">
              {menuItems.map((item, index) => (
                <TabPanel key={item.label} value={value} index={index}>
                  {item.component}
                </TabPanel>
              ))}
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
