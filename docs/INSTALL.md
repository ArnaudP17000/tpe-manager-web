# Installation Guide

This guide provides detailed instructions for installing and setting up TPE Manager Web.

## Prerequisites

### Required Software

- **Docker** (version 20.10 or later)
- **Docker Compose** (version 2.0 or later)
- **Git**

### System Requirements

- **RAM**: Minimum 4GB, recommended 8GB
- **Disk Space**: Minimum 2GB free space
- **OS**: Linux, macOS, or Windows with WSL2

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ArnaudP17000/tpe-manager-web.git
cd tpe-manager-web
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file and update the following variables:

```env
# Database Configuration
POSTGRES_DB=tpe_manager
POSTGRES_USER=tpe_user
POSTGRES_PASSWORD=change_this_strong_password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend Configuration
SECRET_KEY=change_this_to_a_strong_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=False

# CORS Configuration
CORS_ORIGINS=http://localhost,http://yourdomain.com

# Frontend Configuration
REACT_APP_API_URL=http://localhost/api
```

⚠️ **Important**: Always change default passwords and secret keys in production!

### 3. Using Make (Recommended)

```bash
# Install (creates .env if needed and builds containers)
make install

# Start all services
make start

# Check status
make status

# View logs
make logs
```

### 4. Using Docker Compose Directly

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Verify Installation

After starting the services, verify that all containers are running:

```bash
docker compose ps
```

You should see 4 services running:
- `tpe-manager-db` (PostgreSQL)
- `tpe-manager-backend` (FastAPI)
- `tpe-manager-frontend` (React/Nginx)
- `tpe-manager-nginx` (Reverse Proxy)

### 6. Access the Application

Once all services are running, access:

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 7. Login

Use the default credentials to login:

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

⚠️ **Security Note**: Change these default credentials immediately after first login!

## Post-Installation

### Create Additional Admin User

```bash
docker compose exec backend python scripts/create_admin.py
```

### Backup Database

```bash
docker compose exec db pg_dump -U tpe_user tpe_manager > backup.sql
```

### Restore Database

```bash
docker compose exec -T db psql -U tpe_user tpe_manager < backup.sql
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker compose logs [service_name]
```

### Database Connection Issues

1. Ensure PostgreSQL container is healthy:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

### Frontend Not Loading

1. Check if frontend container is running:
   ```bash
   docker compose ps frontend
   ```

2. Rebuild frontend:
   ```bash
   docker compose up -d --build frontend
   ```

### Port Already in Use

If port 80 or 8000 is already in use, modify `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Change 80 to 8080
```

## Uninstallation

To completely remove TPE Manager:

```bash
# Stop and remove containers, networks, and volumes
make clean

# Or using docker compose
docker compose down -v

# Remove images (optional)
docker rmi $(docker images | grep tpe-manager | awk '{print $3}')
```

## Next Steps

- Read the [API Documentation](API.md)
- Learn about [Deployment](DEPLOYMENT.md)
- Customize the application for your needs
