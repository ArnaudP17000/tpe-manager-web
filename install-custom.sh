#!/bin/bash

# Colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NOCOLOR='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker to proceed.${NOCOLOR}"
    exit 1
fi

# Define directory structure
BASE_DIR="/docker/tpe-manager"
DATA_DIR="/docker/tpe-manager/data"

# Create directory structure
mkdir -p $BASE_DIR $DATA_DIR

# Generate backend files
echo -e "${YELLOW}Generating backend files...${NOCOLOR}"
# Here you would typically generate or copy your backend files

# Generate frontend files
echo -e "${YELLOW}Generating frontend files...${NOCOLOR}"
# Here you would typically generate or copy your frontend files

# Create docker-compose.yml
cat <<EOF > $BASE_DIR/docker-compose.yml
version: '3.8'
services:
  your_service:
    image: your_image
    volumes:
      - ./data:/data
    healthcheck:
      test: "exit 0"
      interval: 30s
      timeout: 10s
      retries: 5
EOF

# Generate .env file with secure passwords
cat <<EOF > $BASE_DIR/.env
DATABASE_PASSWORD=$(openssl rand -base64 12)
# Add other environment variables as needed
EOF

# Build Docker images
echo -e "${GREEN}Building Docker images...${NOCOLOR}"
docker-compose -f $BASE_DIR/docker-compose.yml build

# Start services
echo -e "${GREEN}Starting services...${NOCOLOR}"
docker-compose -f $BASE_DIR/docker-compose.yml up -d

# Create default admin users
# This would typically include commands to initialize your application

# Final summary
echo -e "${GREEN}TPE Manager installation complete!${NOCOLOR}"
echo -e "${YELLOW}Please configure your Nginx Proxy Manager to route to the service.${NOCOLOR}"
