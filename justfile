SERVER_ASSETS_PATH := "server/static"

# List available commands
default:
    just --list --unsorted

# Run dev app fullstack
[parallel]
dev: build-watch-for-server dev-server

# Run dev web server
dev-web:
    just web/dev

# Build web assets
build-web output="dist":
    just web/build {{ output }}

# Build and watch web assets
build-watch-web output="dist":
    just web/build-watch {{ output }}

# Build web assets for server
build-for-server:
    just build-web "../{{ SERVER_ASSETS_PATH }}"

# Build and watch web assets for server
build-watch-for-server:
    just build-watch-web "../{{ SERVER_ASSETS_PATH }}"

# Run the server Docker container
run-server: build-for-server
    just server/run

# Run dev server
dev-server: start-services build-for-server
    just server/dev

# Generate authentication database tables
make-auth-tables:
    just server/make-auth-tables

# Generate migrations
make-migrations:
    just server/make-migrations

# Run database migrations
migrate:
    just server/migrate

# Run tests
test:
    just server/test


# Format code with Prettier
format:
    bun run format

# Check code formatting with Prettier
format-check:
    bun run format:check

# Lint the project
lint:
    bun run lint

# Type check
typecheck:
    just server/typecheck
    just web/typecheck

# Run all quality checks
quality: prepare format-check lint

# Run all verification checks
ready: quality
    just server/ready
    just web/ready

# Start services
start-services:
    docker compose up -d

# Stop services
stop-services:
    docker compose down

# Prepare project for development
prepare: install-modules

# Install modules
install-modules:
    bun install
