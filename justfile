CONTAINER_NAME := "web-translator"
PORT := "3000"

# List available commands
default:
    just --list --unsorted

# Run the Docker container
run: build stop delete
    docker run -dp {{ PORT }}:{{ PORT }} --name {{ CONTAINER_NAME }} {{ CONTAINER_NAME }}

# Stop Docker container
stop:
    docker stop {{ CONTAINER_NAME }} || true

# Delete Docker container
delete:
    docker rm {{ CONTAINER_NAME }} || true

# Run dev server
dev: prepare
    #!/usr/bin/env zsh

    export DEBUG="true"

    bun run dev

# Build the Docker image
build:
    docker build --pull -t {{ CONTAINER_NAME }} .

# Run tests
test:
    bun run test

# Format code with Prettier
format:
    bun run format

# Type check
typecheck:
    bun run typecheck

# Lint the project
lint:
    bun run lint

# Check code formatting with Prettier
format-check:
    bun run format:check

# Run all quality checks
quality: format-check lint typecheck

# Run all verification checks
ready: prepare quality test build-delete

# Prepare project for development
prepare: install-modules

# Install modules
install-modules:
    bun install

# Delete image
delete-image:
    docker image rm -f {{ CONTAINER_NAME }} || true

[private]
build-delete: build delete-image
