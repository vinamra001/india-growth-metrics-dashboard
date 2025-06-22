import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCities = [
  {
    _id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    metrics: {
      gdp: 310000,
      gdpPerCapita: 125000,
      hdi: 0.794,
      infantMortalityRate: 12.3,
      literacyRate: 0.897,
      educationIndex: 0.756,
      genderInequalityIndex: 0.437,
      populationGrowthRate: 1.2,
      urbanPopulation: 85.3,
      healthcareExpenditure: 8500,
      physiciansPer1000: 1.8,
      hospitalBedsPer1000: 2.1,
      cleanWaterAccess: 92.5,
      vaccinationCoverage: 87.3,
      co2EmissionsPerCapita: 2.1,
      renewableEnergy: 15.2,
      forestArea: 8.5,
      airQualityIndex: 156,
      environmentalPerformanceIndex: 42.3,
      corruptionPerceptionsIndex: 40,
      internetPenetration: 78.5,
      mobilePhoneSubscriptions: 125.3,
      infrastructureQualityIndex: 6.8,
      politicalStabilityIndex: 45.2,
      giniCoefficient: 0.42,
      povertyRate: 12.8,
      socialProtectionCoverage: 68.5
    }
  }
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: mockCities
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total Cities/i)).toBeInTheDocument();
    });
  });

  test('displays city data after loading', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.getByText('Maharashtra')).toBeInTheDocument();
    });
  });

  test('handles city selection', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const cityCard = screen.getByText('Mumbai');
      fireEvent.click(cityCard);
      expect(window.location.pathname).toBe('/city/Mumbai/2022');
    });
  });

  test('handles year selection', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const yearSelect = screen.getByLabelText('Year');
      fireEvent.change(yearSelect, { target: { value: '2023' } });
      expect(yearSelect).toHaveValue('2023');
    });
  });

  test('handles metric selection', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const gdpMetric = screen.getByText('GDP');
      fireEvent.click(gdpMetric);
      expect(screen.getByText('₹ Crores')).toBeInTheDocument();
    });
  });

  test('handles comparison', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const compareButton = screen.getByLabelText('Compare');
      fireEvent.click(compareButton);
      expect(screen.getByText('City Comparison')).toBeInTheDocument();
    });
  });

  test('handles export', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const exportButton = screen.getByLabelText('Export');
      fireEvent.click(exportButton);
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });
  });
});
