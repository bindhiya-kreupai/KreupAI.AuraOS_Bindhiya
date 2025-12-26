#!/bin/bash

# AuraOS Infrastructure Initialization Script
# Starts all infrastructure services and initializes them

set -e

echo "======================================"
echo "  AuraOS Infrastructure Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"
echo ""

# Stop existing containers
echo "Stopping existing infrastructure containers..."
docker-compose -f docker-compose.infrastructure.yml down

# Start infrastructure services
echo -e "\n${YELLOW}Starting infrastructure services...${NC}\n"
docker-compose -f docker-compose.infrastructure.yml up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}Waiting for services to be healthy...${NC}\n"

check_service() {
    local service=$1
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.infrastructure.yml ps | grep $service | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✓${NC} $service is ready"
            return 0
        fi
        echo "Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}✗${NC} $service failed to start"
    return 1
}

# Check each service
check_service "postgres"
check_service "redis"
check_service "rabbitmq"
check_service "elasticsearch"

echo -e "\n${GREEN}All infrastructure services are running!${NC}\n"

# Display access information
echo "======================================"
echo "  Service URLs"
echo "======================================"
echo ""
echo "PostgreSQL:     localhost:5432"
echo "  Username:     auraos"
echo "  Password:     auraos_dev_2024"
echo "  Database:     auraos_dev"
echo ""
echo "Redis:          localhost:6379"
echo "  Password:     auraos_redis_2024"
echo ""
echo "RabbitMQ:       localhost:5672"
echo "  Management:   http://localhost:15672"
echo "  Username:     auraos"
echo "  Password:     auraos_rabbit_2024"
echo ""
echo "Elasticsearch:  http://localhost:9200"
echo "Kibana:         http://localhost:5601"
echo ""
echo "Adminer (DB):   http://localhost:8080"
echo ""
echo "======================================"
echo ""

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
pnpm prisma migrate dev

echo -e "\n${GREEN}Infrastructure setup complete!${NC}"
echo ""
echo "To stop all services, run:"
echo "  docker-compose -f docker-compose.infrastructure.yml down"
echo ""
