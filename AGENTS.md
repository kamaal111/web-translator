# Repository Guidelines

## Critical Development Rules

- **ALWAYS verify your work with relevant commands BEFORE claiming completion**
  - For linting changes: run `just lint` to verify
  - For type changes: run `just typecheck` to verify
  - For tests: run `just test` to verify
  - For formatting: run `just format` to verify
  - **ALWAYS run `just ready` as the FINAL verification before finishing ANY task**
- **NEVER claim a task is done until ALL checks from `just ready` pass** (format, lint, typecheck, tests, build)
  - **ALWAYS run `just ready` from the root directory before finishing any task**
  - **If `just ready` fails, you MUST fix all errors before saying you're done**
  - This is NON-NEGOTIABLE - no exceptions
- **NEVER add ESLint suppression comments** (e.g., `eslint-disable`, `eslint-disable-next-line`) - ALWAYS fix the underlying issue instead
  - Restructure code, separate concerns, fix types, or refactor - but NEVER suppress warnings
  - ESLint rules exist for good reasons - respect them and fix the root cause
  - This is NON-NEGOTIABLE - no exceptions
- **NEVER disable or turn off ESLint rules** - if a rule is failing, fix the code to comply with it
  - Do not modify ESLint configuration to suppress errors
  - Fix the underlying code issue instead
- **NEVER use the `any` type in TypeScript** - always use proper types, `unknown`, or generics
  - This is enforced by ESLint rules and will cause lint failures
  - Use `unknown` when the type is truly unknown, then narrow it with type guards
  - Use proper generics and type constraints instead of escaping the type system
- **NEVER run dev servers yourself** (e.g., `bun run dev`, `just dev-server`) - they run in background and are difficult to kill
- **NEVER perform destructive git operations** (e.g., `git checkout`, `git stash`, `git reset`, `git rebase`) - these change the working directory state
- **ALWAYS use justfile commands** when available for debugging and development tasks (check `just` to list available commands)
- **When making breaking changes to interfaces/types, find and update ALL usages including tests**
- **ALWAYS add helpful error logs** for debugging purposes using `getLogger(c).error()` (server) or appropriate logging mechanism
  - Log internal errors with detailed context before throwing exceptions
  - Use structured logging: pass additional context as second parameter (e.g., `getLogger(c).error('message', { userId, requestData })`)
  - NEVER leak internal error details to API responses - use generic error messages for exceptions
  - Use `getLogger(c)` from `context/logging` for server-side logging
- **CAREFULLY read and address deprecation warnings** from linters or compilers
  - If a function, method, or package is marked as deprecated, ALWAYS follow the recommended migration path
  - Do not ignore deprecation warnings, as they indicate future breaking changes
  - Update the code to use the new recommended APIs instead of deprecated ones
- **NEVER use nullish coalescing (??) or boolean coalescing (||) when values are guaranteed to exist**
  - If you know for certain that a value exists (e.g., after validation or in a transform after refine), use `assert` to document the guarantee
  - Example: `assert(canonical, 'Already validated, so we know this exists'); return canonical;`
  - Do NOT write: `return value ?? fallback` or `return value || fallback` when validation ensures the value exists
  - Coalescing should only be used when there's genuine optionality, not to paper over type system limitations

## Project Structure & Module Organization

The project is a monorepo with the following structure:

- `server/`: Backend application (Bun, Hono, Drizzle, Better Auth).
  - `src/index.ts`: Server entry point.
  - `src/db/`: Database schema and configuration.
  - `src/auth/`: Authentication configuration.
- `web/`: Frontend application (Vite, React, Tailwind).
  - `src/main.tsx`: Frontend entry point.
  - `src/pages/`: Application pages.
  - `src/components/`: Reusable UI components.
- `justfile`: Root command runner.
- `package.json`: Root dependencies (linting, formatting) and workspace configuration.

## Build, Test, and Development Commands

**ALWAYS use `just` commands from the root directory.**

- **Start Development:** `just dev` (Runs server and web in parallel)
- **Run Tests:** `just test` (Runs server and web tests)
- **Database Migrations:**
  - Apply migrations: `just migrate`
  - Generate migrations: `just make-migrations`
- **Quality Check:** `just ready` (Runs format, lint, typecheck, tests, and build for both server and web)
- **Quality (no build/tests):** `just quality` (typecheck, format-check, lint)
- **Docker:**
  - Run server in Docker: `just run-server`
  - Start/stop services (Postgres): `just start-services` / `just stop-services`
- **OpenAPI:**
  - Download spec from app: `just download-spec` (writes to `web/src/openapi.yaml` and runs Prettier)
  - Web client generation runs during `prepare-web` as part of `just ready`/`just dev`

## Coding Style & Naming Conventions

- **Language:** TypeScript, ESM modules.
- **Indentation:** 2 spaces; max line length ~100 chars.
- **Naming:**
  - Variables/Functions: `camelCase`
  - Types/Classes/Components: `PascalCase`
  - Filenames: `kebab-case` (e.g., `user-profile.tsx`, `auth-service.ts`)
- **Frontend (Web):**
  - Use Functional Components with Hooks.
  - Styling: Tailwind CSS (v4).
  - UI Library: Radix UI Themes.
  - **Internationalization (i18n):**
    - **ALWAYS use `messages.ts` files** for all user-facing text, following the pattern from other components
    - Use `defineMessages` from `react-intl` to define message descriptors
    - Message IDs should be UPPERCASE with dots (e.g., `HOME.TITLE`, `AUTH.LOGIN_FORM.EMAIL_FIELD_LABEL`)
    - **ALWAYS translate aria-labels and other accessibility attributes** using `useIntl` hook
    - Example: `aria-label={intl.formatMessage(messages.loadingProjects)}`
    - Never use hardcoded strings in JSX - all text must be translatable
- **Backend (Server):**
  - Framework: Hono.
  - Database: Drizzle ORM.
- **Lint/Format:** Run `just format` to fix formatting issues. Match existing style.

## Testing Guidelines

- **Framework:** `bun:test` (Server) and `vitest` (Web).
- **Location:** Co-locate tests or use `__tests__` directories.
- **Scope:** Cover route behavior, database interactions, and edge cases.
- **Dependency Injection:** Use `createApp({ db, auth, logger })` pattern in server tests to override dependencies.
- **Run Tests:** `just test`.
- **CRITICAL: ALWAYS write tests BEFORE claiming a fix works**
  - **NEVER say "this should work" or "the fix is done" without running tests**
  - When fixing bugs or adding features that affect runtime behavior:
    1. Write comprehensive tests that verify the fix/feature
    2. Run the tests to see them pass
    3. ONLY THEN claim the work is complete
  - Example: When fixing SPA routing, write tests for all route patterns FIRST, then implement the fix
  - This is NON-NEGOTIABLE - tests are the only way to verify correctness
- **Component Testing (Web):**
  - **ALWAYS use `screen` from `@testing-library/react` for queries** - NEVER use `within(container)` or `document.querySelector()`
  - Import: `import { screen } from '@testing-library/react'`
  - Query elements directly: `screen.getByPlaceholderText('...')`, `screen.getByRole('...')`, `screen.getByLabelText('...')`, etc.
  - Anti-patterns:
    - `const { container } = render(...); within(container).getBy...()`
    - `document.querySelector('.some-class')`
  - Correct pattern: `render(...); screen.getBy...()`
  - Using `screen` aligns with Testing Library best practices and makes tests more maintainable and accessible

### Server Test Setup with TestHelper

- **TestHelper Class:** Located in `server/src/__tests__/test-helper.ts` - provides test database setup and authentication utilities.
- **Basic Setup Pattern:**

  ```typescript
  import { beforeAll, afterAll, describe, test, expect } from 'bun:test';
  import TestHelper from '../__tests__/test-helper';

  const helper = new TestHelper();

  describe('My Tests', () => {
    beforeAll(helper.beforeAll); // Sets up test DB and creates default user
    afterAll(helper.afterAll); // Cleans up test DB

    test('my test', async () => {
      // Test implementation
    });
  });
  ```

### Using the Default User in Tests

The TestHelper automatically creates a **default user** during `beforeAll()` setup. Use this default user for tests that don't require special user characteristics.

- **Default User Credentials:**
  - Email: `test@example.com`
  - Password: `TestPassword123!`
  - Name: `Test User`

- **Sign in as default user:**

  ```typescript
  test('should access protected resource', async () => {
    const response = await helper.signInAsDefaultUser();
    expect(response.status).toBe(200);

    const token = response.headers.get('set-auth-token');
    // Use token for subsequent authenticated requests
  });
  ```

- **When to use custom users:**
  - If you need specific user attributes (different name, email)
  - If you're testing duplicate email handling
  - If you need multiple users in the same test

  ```typescript
  test('should handle multiple users', async () => {
    // Default user already exists from beforeAll
    const defaultUserResponse = await helper.signInAsDefaultUser();

    // Create a custom user for comparison
    const customUserResponse = await helper.signUpUser('custom@example.com', 'Custom User');

    // Test interaction between users
  });
  ```

- **Helper Methods Available:**
  - `helper.signInAsDefaultUser()` - Sign in with default user credentials (most common)
  - `helper.signUpUser(email, name)` - Create a new user with custom details
  - `helper.signInUser(email)` - Sign in an existing user by email (uses default password)
  - `helper.app` - Access to the Hono app instance for making requests

- **Best Practice:** Prefer `signInAsDefaultUser()` unless your test specifically requires custom user attributes. This keeps tests simpler and more maintainable.

## Security & Configuration Tips

- **Server Port:** Defaults to `3000`.
- **Environment:** Use `.env` (see `.env.example`) — required: `DATABASE_URL` (Postgres), `BETTER_AUTH_SECRET`.
- **Dependencies:** Prefer Bun primitives where suitable (e.g., `Bun.file`) and Hono for routing. Database is Postgres via Drizzle.
- **Services:** Postgres runs via Docker Compose. Use `just start-services` before running migrations or tests that hit the DB.

## API & Docs

- **Base Path:** App API is served under `/app-api/v1`.
- **Docs:**
  - JSON spec: `/docs/spec.json`
  - YAML spec: `/docs/spec.yaml`
  - Swagger UI: `/docs/doc`
  - Scalar UI: `/docs/scalar`
- **Spec Workflow:** `just download-spec` generates `web/src/openapi.yaml`; the web app generates a typed client during prepare/build.

## SPA Routing Configuration

- **Web Router:** `server/src/web/router.ts` contains the `WEB_ROUTES` array that defines which paths serve the HTML template
- **Pattern Matching:** The template middleware (`server/src/web/middleware/template.ts`) supports dynamic route patterns
  - Use `:paramName` syntax for dynamic segments (e.g., `/projects/:id`, `/users/:userId`)
  - The middleware automatically matches these patterns against incoming requests
  - Example: Adding `/projects/:id` to `WEB_ROUTES` allows the SPA to handle any URL like `/projects/123` or `/projects/abc`
- **When to Update WEB_ROUTES:**
  - Whenever you add a new client-side route in React Router
  - For any route that should serve the HTML template instead of 404ing
  - Remember: API routes under `/app-api/` are NOT in WEB_ROUTES and should never serve HTML
- **Testing SPA Routes:**
  - Always add tests in `server/src/web/__tests__/router.test.ts` when adding new routes
  - Verify that the route serves HTML with a 200 status
  - Verify that API routes still return JSON, not HTML
