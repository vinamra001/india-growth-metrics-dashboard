# API Documentation

## Base URL
`http://localhost:5000`

## Authentication
- No authentication required for public endpoints
- Protected endpoints use JWT token in Authorization header
- Token format: Bearer <token>

## Metrics Endpoints

### GET /api/metrics
Get city metrics with optional filters

Parameters:
- `year`: number (optional) - Filter by year
- `search`: string (optional) - Search cities
- `category`: string (optional) - Filter by metric category

Response:
```json
{
  "data": [
    {
      "name": "string",
      "state": "string",
      "metrics": {
        "economic": {},
        "social": {},
        "health": {},
        "environment": {},
        "governance": {},
        "economicEquality": {}
      }
    }
  ]
}
```

### POST /api/metrics
Create or update city metrics

Request Body:
```json
{
  "name": "string",
  "state": "string",
  "year": number,
  "metrics": {
    "economic": {},
    "social": {},
    "health": {},
    "environment": {},
    "governance": {},
    "economicEquality": {}
  }
}
```

### POST /api/ai/analyze
Get AI-powered analysis of metrics

Request Body:
```json
{
  "metrics": [],
  "years": number,
  "cities": []
}
```

Response:
```json
{
  "trends": [],
  "anomalies": [],
  "correlations": [],
  "recommendations": []
}
```

## Export Endpoints

### POST /api/export/csv
Export metrics as CSV

Request Body:
```json
{
  "cities": [],
  "metrics": [],
  "year": number
}
```

### POST /api/export/pdf
Export analysis as PDF

Request Body:
```json
{
  "data": {},
  "format": "string"
}
```

## Error Responses

400 Bad Request:
```json
{
  "error": "string",
  "details": "string"
}
```

401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "details": "Invalid token"
}
```

500 Internal Server Error:
```json
{
  "error": "string",
  "details": "string"
}`
