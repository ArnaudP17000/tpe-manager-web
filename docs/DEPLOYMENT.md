# Deployment Guide

This guide covers deploying TPE Manager Web to production environments.

## Production Checklist

Before deploying to production, ensure you have:

- [ ] Changed all default passwords
- [ ] Generated a strong SECRET_KEY
- [ ] Configured proper CORS origins
- [ ] Set DEBUG=False
- [ ] Configured SSL/TLS certificates
- [ ] Set up backup strategy
- [ ] Configured monitoring
- [ ] Set up logging
- [ ] Configured firewall rules
- [ ] Set up domain name

## Environment Variables

### Required Changes for Production

```env
# Use strong, unique passwords
POSTGRES_PASSWORD=your_very_strong_password_here

# Generate a secure secret key (32+ characters)
SECRET_KEY=your_very_long_secure_secret_key_min_32_chars

# Set environment to production
ENVIRONMENT=production
DEBUG=False

# Configure your domain for CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Update API URL for frontend
REACT_APP_API_URL=https://yourdomain.com/api
```

## Deployment Options

### Option 1: Docker Compose (Recommended for Small/Medium Scale)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
```

#### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/ArnaudP17000/tpe-manager-web.git
cd tpe-manager-web

# Copy and edit environment file
cp .env.example .env
nano .env  # Edit with production values
```

#### 3. SSL/TLS Setup with Let's Encrypt

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot-data:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"

  certbot:
    image: certbot/certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
      - certbot-data:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email your@email.com --agree-tos --no-eff-email -d yourdomain.com -d www.yourdomain.com

volumes:
  certbot-data:
```

#### 4. Deploy

```bash
# Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Option 2: Kubernetes

For larger scale deployments, consider using Kubernetes. Create deployment manifests for:
- PostgreSQL StatefulSet
- Backend Deployment
- Frontend Deployment
- Nginx Ingress
- Secrets and ConfigMaps

### Option 3: Cloud Platforms

#### AWS ECS/Fargate
- Use AWS RDS for PostgreSQL
- Deploy containers on ECS
- Use Application Load Balancer
- Configure CloudWatch for monitoring

#### Google Cloud Run
- Use Cloud SQL for PostgreSQL
- Deploy as Cloud Run services
- Use Cloud Load Balancing

#### Azure Container Instances
- Use Azure Database for PostgreSQL
- Deploy as Container Instances
- Use Azure Front Door

## Database

### Backup Strategy

#### Automated Daily Backups

Create `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
docker compose exec -T db pg_dump -U tpe_user tpe_manager | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

#### Manual Backup

```bash
docker compose exec db pg_dump -U tpe_user tpe_manager > backup.sql
```

#### Restore

```bash
docker compose exec -T db psql -U tpe_user tpe_manager < backup.sql
```

## Monitoring

### Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:8000/health
```

### Logging

#### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

#### Log Management

For production, consider:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki** with Grafana
- **Cloud Provider Logging** (CloudWatch, Stackdriver)

### Monitoring Tools

Recommended tools:
- **Prometheus + Grafana** for metrics
- **Sentry** for error tracking
- **New Relic** or **DataDog** for APM

## Security

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### SSL/TLS Configuration

Update `nginx/nginx-ssl.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

Already included in nginx.conf:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

Consider adding:
- Content-Security-Policy
- Strict-Transport-Security

## Performance Optimization

### Database

```sql
-- Create indexes
CREATE INDEX idx_tpe_service_name ON tpes(service_name);
CREATE INDEX idx_tpe_shop_id ON tpes(shop_id);
CREATE INDEX idx_tpe_model ON tpes(tpe_model);
```

### Nginx Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest of config
}
```

### PostgreSQL Tuning

Edit postgresql.conf:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
```

## Scaling

### Horizontal Scaling

To scale the application:

```bash
# Scale backend
docker compose up -d --scale backend=3

# Update nginx upstream configuration
upstream backend {
    server backend:8000;
    server backend:8000;
    server backend:8000;
}
```

### Database Replication

For high availability, set up PostgreSQL replication:
- Primary-Replica setup
- Use connection pooling (PgBouncer)
- Implement read replicas for read-heavy operations

## Troubleshooting

### Application Won't Start

1. Check logs: `docker compose logs`
2. Verify environment variables
3. Check database connection
4. Verify port availability

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Slow Performance

1. Check database indexes
2. Enable query logging
3. Monitor API response times
4. Check network latency

## Maintenance

### Updates

```bash
# Pull latest code
git pull

# Rebuild containers
docker compose build

# Restart with zero downtime
docker compose up -d --no-deps backend
```

### Database Migrations

When updating the schema:

```bash
# Create migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migration
docker compose exec backend alembic upgrade head
```

## Support

For issues or questions:
- Check logs: `docker compose logs`
- Review documentation
- Open an issue on GitHub
