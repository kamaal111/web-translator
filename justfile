# List available commands
[group('meta')]
default:
    just --list --unsorted

# Run dev web server
[group('web')]
dev-web:
    just web/dev

# Run the server Docker container
[group('server')]
run-server:
    just server/run

# Run dev server
[group('server')]
dev-server: start-services
    just server/dev

# Generate authentication database tables
[group('server')]
make-auth-tables:
    just server/make-auth-tables

# Generate migrations
[group('server')]
make-migrations:
    just server/make-migrations

# Run database migrations
[group('server')]
migrate:
    just server/migrate

# Run tests
[group('testing')]
test:
    just server/test


# Format code with Prettier
[group('quality')]
format:
    bun run format

# Check code formatting with Prettier
[group('quality')]
format-check:
    bun run format:check

# Lint the project
[group('quality')]
lint:
    bun run lint

# Type check
[group('quality')]
typecheck:
    just server/typecheck

# Run all quality checks
[group('quality')]
quality: prepare format-check lint

# Run all verification checks
[group('quality')]
ready: quality
    just server/ready

# Start services
[group('container')]
start-services:
    docker compose up -d

# Stop services
[group('container')]
stop-services:
    docker compose down

# Prepare project for development
[group('development')]
prepare: install-modules

# Install modules
[group('development')]
install-modules:
    bun install
