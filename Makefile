# AuraOS Docker Makefile
# Quick commands for Docker operations

.PHONY: help build up down restart logs clean test backup restore

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)AuraOS Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==============================================================================
# DEVELOPMENT
# ==============================================================================

dev: ## Start development environment with all tools
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker compose --profile dev up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "Web: http://localhost:3000"
	@echo "PgAdmin: http://localhost:5050"
	@echo "Redis Commander: http://localhost:8081"

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose build
	@echo "$(GREEN)Build complete!$(NC)"

up: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@make status

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker compose down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker compose restart
	@echo "$(GREEN)Services restarted!$(NC)"

logs: ## Show logs (use SERVICE=web for specific service)
	@if [ -z "$(SERVICE)" ]; then \
		docker compose logs -f; \
	else \
		docker compose logs -f $(SERVICE); \
	fi

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@docker compose ps

# ==============================================================================
# PRODUCTION
# ==============================================================================

prod: ## Start production environment with Nginx
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker compose --profile production up -d
	@echo "$(GREEN)Production environment started!$(NC)"

prod-build: ## Build and start production
	@echo "$(BLUE)Building and starting production...$(NC)"
	docker compose --profile production up -d --build
	@echo "$(GREEN)Production deployment complete!$(NC)"

# ==============================================================================
# DATABASE
# ==============================================================================

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	docker compose exec web pnpm --filter @aura/database prisma migrate deploy
	@echo "$(GREEN)Migrations complete!$(NC)"

db-seed: ## Seed database
	@echo "$(BLUE)Seeding database...$(NC)"
	docker compose exec web pnpm --filter @aura/database prisma db seed
	@echo "$(GREEN)Database seeded!$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	docker compose exec web pnpm --filter @aura/database prisma studio

db-shell: ## Open PostgreSQL shell
	@echo "$(BLUE)Connecting to PostgreSQL...$(NC)"
	docker compose exec postgres psql -U auraos -d auraos

backup: ## Backup database to backups/ directory
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	@docker compose exec postgres pg_dump -U auraos auraos > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)Backup complete: backups/backup-$$(date +%Y%m%d-%H%M%S).sql$(NC)"

restore: ## Restore database from file (use FILE=path/to/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	@docker compose exec -T postgres psql -U auraos auraos < $(FILE)
	@echo "$(GREEN)Database restored!$(NC)"

# ==============================================================================
# CACHE
# ==============================================================================

cache-clear: ## Clear Redis cache
	@echo "$(YELLOW)Clearing Redis cache...$(NC)"
	docker compose exec redis redis-cli -a $$(grep REDIS_PASSWORD .env | cut -d '=' -f2) FLUSHALL
	@echo "$(GREEN)Cache cleared!$(NC)"

cache-monitor: ## Monitor Redis
	@echo "$(BLUE)Monitoring Redis...$(NC)"
	docker compose exec redis redis-cli -a $$(grep REDIS_PASSWORD .env | cut -d '=' -f2) MONITOR

# ==============================================================================
# TESTING
# ==============================================================================

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	docker compose exec web pnpm --filter web test
	@echo "$(GREEN)Tests complete!$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	docker compose exec web pnpm --filter web test:watch

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	docker compose exec web pnpm --filter web test:coverage

# ==============================================================================
# MAINTENANCE
# ==============================================================================

clean: ## Stop services and remove volumes (CAUTION: deletes data)
	@echo "$(RED)This will delete all data. Are you sure? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	@echo "$(YELLOW)Stopping services and removing volumes...$(NC)"
	docker compose down -v
	@echo "$(GREEN)Cleanup complete!$(NC)"

clean-build: ## Remove all Docker build cache
	@echo "$(YELLOW)Removing build cache...$(NC)"
	docker builder prune -a -f
	@echo "$(GREEN)Build cache cleared!$(NC)"

clean-all: ## Remove everything (images, volumes, cache)
	@echo "$(RED)This will remove all Docker data. Are you sure? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	@echo "$(YELLOW)Removing all Docker data...$(NC)"
	docker compose down -v --rmi all
	docker builder prune -a -f
	@echo "$(GREEN)Complete cleanup done!$(NC)"

# ==============================================================================
# UTILITIES
# ==============================================================================

shell: ## Open shell in web container
	@echo "$(BLUE)Opening shell in web container...$(NC)"
	docker compose exec web sh

health: ## Check application health
	@echo "$(BLUE)Checking application health...$(NC)"
	@curl -s http://localhost:3000/api/health | jq '.'

stats: ## Show resource usage
	@echo "$(BLUE)Docker Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

disk: ## Show Docker disk usage
	@echo "$(BLUE)Docker Disk Usage:$(NC)"
	@docker system df -v

update: ## Update Docker images
	@echo "$(BLUE)Updating Docker images...$(NC)"
	docker compose pull
	@echo "$(GREEN)Images updated!$(NC)"

# ==============================================================================
# QUICK ACTIONS
# ==============================================================================

quick-start: build up db-migrate ## Quick start: build, start, and migrate
	@echo "$(GREEN)AuraOS is ready!$(NC)"
	@echo "Access at: http://localhost:3000"

quick-reset: down clean build up db-migrate db-seed ## Reset everything and start fresh
	@echo "$(GREEN)Fresh installation complete!$(NC)"

# ==============================================================================
# INFO
# ==============================================================================

info: ## Show environment information
	@echo "$(BLUE)Environment Information:$(NC)"
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker compose version)"
	@echo "Node.js version (in container): $$(docker compose exec web node --version 2>/dev/null || echo 'Container not running')"
	@echo ""
	@echo "$(BLUE)Services:$(NC)"
	@docker compose ps

version: ## Show AuraOS version
	@echo "$(BLUE)AuraOS Version:$(NC)"
	@grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/'
