.PHONY: help install start stop restart logs clean build status

help:
	@echo "TPE Manager Web - Available Commands:"
	@echo "  make install   - Initial setup (copy .env, build containers)"
	@echo "  make start     - Start all services"
	@echo "  make stop      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make logs      - Show logs from all services"
	@echo "  make clean     - Stop and remove all containers and volumes"
	@echo "  make build     - Rebuild all containers"
	@echo "  make status    - Show running containers"

install:
	@echo "Setting up TPE Manager Web..."
	@if [ ! -f .env ]; then cp .env.example .env; echo ".env file created"; else echo ".env file already exists"; fi
	@docker compose build
	@echo "Installation complete! Run 'make start' to start the application."

start:
	@echo "Starting TPE Manager Web..."
	@docker compose up -d
	@echo "Application started!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost/api"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Default credentials:"
	@echo "  Admin - username: admin, password: admin123"
	@echo "  User - username: user, password: user123"

stop:
	@echo "Stopping TPE Manager Web..."
	@docker compose down

restart:
	@echo "Restarting TPE Manager Web..."
	@docker compose restart

logs:
	@docker compose logs -f

clean:
	@echo "Cleaning up TPE Manager Web..."
	@docker compose down -v
	@echo "All containers and volumes removed!"

build:
	@echo "Building containers..."
	@docker compose build --no-cache

status:
	@docker compose ps
