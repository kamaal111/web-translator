# List available commands
default:
    just --list --unsorted

# Run dev server
dev: prepare
    bun run dev

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
ready: prepare quality test

# Prepare project for development
prepare: install-modules

# Install modules
install-modules:
    bun install
