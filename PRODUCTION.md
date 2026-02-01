# Production Deployment Guide

This guide explains how to deploy the nfcelta application in production using Docker and nginx.

## Files Overview

- `Dockerfile.prod` - Multi-stage production Dockerfile
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `nginx.conf` - nginx reverse proxy configuration
- `.env.example` - Environment variables template
- `.dockerignore` - Files to exclude from Docker builds

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Setup

1. Create environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and set secure values:
```bash
# Update these values
POSTGRES_PASSWORD=your_secure_password_here
NGINX_PORT=80  # Change if needed
```

## Deployment

### Start the application:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stop the application:
```bash
docker-compose -f docker-compose.prod.yml down
```

### Rebuild after code changes:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Architecture

The production setup consists of three services:

1. **PostgreSQL** (postgres:18-alpine)
   - Database service
   - Data persisted in named volume
   - Health checks enabled

2. **Application** (Bun + Hono)
   - Built using multi-stage Dockerfile
   - Runs as non-root user
   - Health checks enabled
   - Only accessible via nginx

3. **nginx**
   - Reverse proxy on port 80 (configurable)
   - Gzip compression enabled
   - Security headers configured
   - Health checks enabled

## Security Features

- Application runs as non-root user
- Services isolated in Docker network
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Environment variables for sensitive data
- Production dependencies only

## Monitoring

### Health checks:
```bash
# Application health
curl http://localhost/health

# Service status
docker-compose -f docker-compose.prod.yml ps
```

### Database access:
```bash
docker exec -it nfcelta-postgres psql -U app_usr -d nfcelta
```

## Maintenance

### Database backup:
```bash
docker exec nfcelta-postgres pg_dump -U app_usr nfcelta > backup.sql
```

### Database restore:
```bash
docker exec -i nfcelta-postgres psql -U app_usr nfcelta < backup.sql
```

### Update application:
```bash
git pull
docker-compose -f docker-compose.prod.yml up -d --build app
```

## SSL/HTTPS (Recommended)

For production, add SSL certificates. Options:

1. Use Let's Encrypt with certbot
2. Add SSL configuration to nginx.conf
3. Use a reverse proxy like Traefik or Caddy

Example nginx SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    # ... rest of configuration
}
```

## Troubleshooting

### Check service logs:
```bash
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs nginx
docker-compose -f docker-compose.prod.yml logs postgres
```

### Restart services:
```bash
docker-compose -f docker-compose.prod.yml restart app
```

### Clean rebuild:
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```
