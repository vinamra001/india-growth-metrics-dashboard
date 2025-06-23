# Frontend Environment Configuration

## Setup Instructions

1. Create a `.env` file in the frontend directory
2. Copy the following configuration and update the values:

```env
# Frontend Environment Variables

# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Environment
REACT_APP_ENVIRONMENT=development

# OpenAI API Key (if needed for client-side features)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=your_google_analytics_id

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_SHARING=true
```

## Required Environment Variables

### REACT_APP_API_URL
- **Description:** Backend API base URL
- **Default:** http://localhost:5000
- **Example:** `REACT_APP_API_URL=http://localhost:5000`

### REACT_APP_ENVIRONMENT
- **Description:** Application environment
- **Default:** development
- **Example:** `REACT_APP_ENVIRONMENT=development`

## Optional Environment Variables

### REACT_APP_OPENAI_API_KEY
- **Description:** OpenAI API key for client-side AI features
- **Required:** No (if using backend AI service)
- **Example:** `REACT_APP_OPENAI_API_KEY=sk-your-api-key-here`

### REACT_APP_GA_TRACKING_ID
- **Description:** Google Analytics tracking ID
- **Required:** No
- **Example:** `REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX`

### Feature Flags
- **REACT_APP_ENABLE_AI_FEATURES:** Enable/disable AI features
- **REACT_APP_ENABLE_EXPORT:** Enable/disable export functionality
- **REACT_APP_ENABLE_SHARING:** Enable/disable sharing features

## Production Configuration

For production deployment, update these values:

```env
REACT_APP_API_URL=https://india-growth-metrics-dashboard.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_GA_TRACKING_ID=your_production_ga_id
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_SHARING=true
```

## Development Configuration

For local development:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_SHARING=true
```

## Important Notes

- All React environment variables must start with `REACT_APP_`
- Environment variables are embedded during build time
- Changes to environment variables require a rebuild
- Never commit sensitive keys to version control
- Use different configurations for different environments

## Troubleshooting

If you encounter issues:

1. Ensure all environment variables start with `REACT_APP_`
2. Restart the development server after changing environment variables
3. Check that the API URL is accessible
4. Verify feature flags are set correctly
5. Clear browser cache if needed 