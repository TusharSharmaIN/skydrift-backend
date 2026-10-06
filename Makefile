.PHONY: up down logs build clean restart test

# Start the dev environment with hot-reload
up:
	docker compose --env-file .env.local up -d

# Stop all containers
down:
	docker compose down

# Follow application logs
logs:
	docker compose logs -f api

# Rebuild containers
build:
	docker compose --env-file .env.local build

# Restart container
restart:
	docker compose restart api

# Run unit tests inside the container
test:
	docker compose exec api npm run test

# Clean volumes and node_modules
clean:
	docker compose down -v