# Environment Configuration

## Setup Instructions

1. Create a `.env` file in the backend directory
2. Copy the following configuration and update the values:

```env
# Backend Environment Variables

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/india-growth-metrics

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://india-growth-metr-git-862989-vinamrakumar-vishwakarmas-projects.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Required Environment Variables

### PORT
- **Description:** The port number on which the server will run
- **Default:** 5000
- **Example:** `PORT=5000`

### NODE_ENV
- **Description:** The environment mode (development, production, test)
- **Default:** development
- **Example:** `NODE_ENV=development`

### MONGODB_URI
- **Description:** MongoDB connection string
- **Default:** mongodb://localhost:27017/india-growth-metrics
- **Example:** `MONGODB_URI=mongodb://localhost:27017/india-growth-metrics`

### OPENAI_API_KEY
- **Description:** Your OpenAI API key for AI-powered features
- **Required:** Yes (for AI features)
- **Example:** `OPENAI_API_KEY=sk-your-api-key-here`

### JWT_SECRET
- **Description:** Secret key for JWT token generation
- **Required:** Yes (for authentication)
- **Example:** `JWT_SECRET=your-secret-key-here`

### ALLOWED_ORIGINS
- **Description:** Comma-separated list of allowed CORS origins
- **Default:** http://localhost:3000
- **Example:** `ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com`

## Production Configuration

For production deployment, update these values:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
OPENAI_API_KEY=your_production_openai_key
JWT_SECRET=your_production_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique values for JWT_SECRET
- Keep your OpenAI API key secure
- Regularly rotate your secrets
- Use environment-specific configurations

## Troubleshooting

If you encounter issues:

1. Check that all required variables are set
2. Verify MongoDB connection string format
3. Ensure OpenAI API key is valid
4. Check CORS configuration matches your frontend URL 