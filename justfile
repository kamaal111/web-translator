set export
set dotenv-load

SERVER_ASSETS_PATH := "server/static"
OUTPUT_SCHEMA_FILEPATH := "web/src/openapi.yaml"
CONTAINER_NAME := "web-translator"
PORT := "3000"
AUTH_CONFIG := "src/auth/better-auth.ts"
AUTH_SCHEMA := "src/db/schema/better-auth.ts"

# List available commands
default:
    just --list --unsorted

# Run dev app fullstack
[parallel]
dev: build-watch-for-server dev-server

# Run dev web server
[working-directory("web")]
dev-web: prepare-web
    bun run dev

# Build web assets
[working-directory("web")]
build-web output="dist": prepare-web
    BUILD_OUTPUT={{ output }} bun run build

# Build and watch web assets
[working-directory("web")]
build-watch-web output="dist":
    BUILD_OUTPUT={{ output }} bun run build:watch

# Build web assets for server
build-for-server:
    just build-web "../{{ SERVER_ASSETS_PATH }}"

# Build and watch web assets for server
build-watch-for-server:
    just build-watch-web "../{{ SERVER_ASSETS_PATH }}"

# Run the server Docker container
run-server: build-for-server stop-server delete-server
    #!/usr/bin/env zsh

    docker run -dp {{ PORT }}:{{ PORT }} -e DATABASE_URL=$DATABASE_URL \
        -e BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET --name {{ CONTAINER_NAME }} {{ CONTAINER_NAME }}

# Build the Docker image
build-server:
    docker build --pull -t {{ CONTAINER_NAME }} .

# Run dev server
[working-directory("server")]
dev-server: start-services build-for-server
    #!/usr/bin/env zsh

    export DEBUG="true"

    bun run dev

# Generate authentication database tables
[working-directory("server")]
make-auth-tables: prepare-server
    bunx @better-auth/cli generate --config {{ AUTH_CONFIG }} --output {{ AUTH_SCHEMA }} --yes

# Generate migrations
[working-directory("server")]
make-migrations: prepare-server
    bunx drizzle-kit generate

# Run database migrations
[working-directory("server")]
migrate:
    bunx drizzle-kit migrate

# Run tests
[parallel]
test: test-server test-web


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
[parallel]
typecheck: typecheck-server typecheck-web typecheck-schemas

# Run all quality checks
[parallel]
quality: typecheck format-check lint

# Run all verification checks
ready: quality start-services download-spec ready-web ready-server

# Start services
start-services:
    docker compose up -d

# Stop services
stop-services:
    docker compose down

# Download OpenAPI specification
download-spec: prepare-server
    #!/usr/bin/env zsh

    cd server
    bun run scripts/download-openapi-spec.ts ../{{ OUTPUT_SCHEMA_FILEPATH }}
    cd ..
    just format

# Prepare project for development
prepare: install-modules

# Install modules
install-modules:
    bun install

# Open vscode in the workspace
code:
    code web-translator.code-workspace

[private]
[working-directory("server")]
ready-server: quality-server test-server

[private]
[working-directory("server")]
quality-server: prepare-server typecheck-server

[private]
[working-directory("server")]
test-server:
    bun run test

[private]
[working-directory("web")]
test-web:
    bun run test

[private]
stop-server:
    docker stop {{ CONTAINER_NAME }} || true

[private]
delete-server:
    docker rm {{ CONTAINER_NAME }} || true

[private]
[working-directory("web")]
typecheck-web:
    bun run typecheck

[private]
[working-directory("server")]
typecheck-server:
    bun run typecheck

[private]
[working-directory("modules/schemas")]
typecheck-schemas:
    bun run typecheck

[private]
[working-directory("server")]
prepare-server:
    bun install

[private]
[working-directory("web")]
prepare-web:
    bun install
    just generate-client

[private]
[working-directory("web")]
ready-web: quality-web test-web build-web

[private]
[working-directory("web")]
quality-web: prepare-web typecheck-web

[private]
[working-directory("web")]
generate-client:
    bunx openapi-generator-cli generate \
        -i src/openapi.yaml \
        -g typescript-fetch \
        -o src/generated/api-client \
        --additional-properties=supportsES6=true,npmName=api-client,typescriptThreePlus=true
