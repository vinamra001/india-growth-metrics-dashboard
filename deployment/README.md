# Deployment Guide

## Prerequisites

- Node.js (v14+)
- MongoDB
- OpenAI API Key
- Git
- Docker (optional)

## Environment Variables

Create a `.env` file in both frontend and backend directories:

```
# Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/city-dashboard
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=production

# Frontend .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_OPENAI_API_KEY=your-openai-key
```

## Manual Deployment

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Build and start:
```bash
npm run build
npm start
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build and serve:
```bash
npm run build
npm start
```

## Docker Deployment

### Build Docker Images

```bash
docker build -t city-dashboard-backend -f backend/Dockerfile .
docker build -t city-dashboard-frontend -f frontend/Dockerfile .
```

### Run Docker Containers

```bash
docker-compose up -d
```

## Production Configuration

### SSL/TLS

1. Generate SSL certificates:
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

2. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring

1. Set up PM2 for process management:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

2. Configure logging:
```bash
pm2 logs
```

## Backup Strategy

1. MongoDB Backup:
```bash
mongodump --uri="mongodb://localhost:27017/city-dashboard" --out=/backups/
```

2. Automated Backups:
```bash
crontab -e
# Add this line:
0 0 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/city-dashboard" --out=/backups/
```

## Security Measures

1. Rate Limiting:
```javascript
const rateLimit = require('express-rate-limit');

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));
```

2. CORS Configuration:
```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Troubleshooting

1. Common Issues:
   - MongoDB connection errors
   - CORS issues
   - Rate limiting
   - SSL certificate problems

2. Logs Location:
   - Backend: `/var/log/city-dashboard/backend.log`
   - Frontend: `/var/log/city-dashboard/frontend.log`

## Maintenance

1. Regular Updates:
   - Node.js updates
   - Package updates
   - Security patches

2. Backup Schedule:
   - Daily backups
   - Monthly archives
   - Offsite storage
