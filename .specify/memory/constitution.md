<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Reason: Initial constitution ratification establishing core development principles
Modified principles: N/A (initial version)
Added sections: All (initial version)
Removed sections: None
Templates requiring updates:
✅ plan-template.md - already contains Constitution Check section
✅ spec-template.md - aligned with UX and testing requirements
✅ tasks-template.md - aligned with test-first principle
✅ checklist-template.md - aligned with quality gates
✅ agent-file-template.md - aligned with structure and commands
Follow-up TODOs: None - all placeholders filled
-->

# Web Translator Constitution

## Core Principles

### I. Quality Gates Are Non-Negotiable

All code MUST pass comprehensive quality checks before merging. The command `just ready`
is the single source of truth for code quality and MUST execute successfully before any
work is considered complete.

**Rules:**

- `just ready` MUST pass: format, lint, typecheck, tests, and build for both server and web
- No ESLint suppression comments permitted (e.g., `eslint-disable`, `eslint-disable-next-line`) - fix the underlying issue
- No ESLint rule disabling in configuration - comply with all active rules
- TypeScript `any` type is forbidden - use proper types, `unknown`, or generics
- All deprecation warnings MUST be addressed following the recommended migration path

**Rationale:** Quality gates ensure consistency, catch errors early, and maintain a
healthy codebase. Suppression mechanisms hide problems rather than solving them and
create technical debt.

### II. Test-Driven Development (TDD)

Tests MUST be written before implementation and must fail initially. Claims of completion
without running tests are invalid.

**Rules:**

- Write tests that verify the fix/feature FIRST
- Run tests to ensure they FAIL before implementation
- Implement the solution
- Run tests again to ensure they PASS
- ONLY THEN claim work is complete

**Testing Requirements:**

- Server: Use `TestHelper` class for database setup and authentication
- Web: Use `screen` from `@testing-library/react` for all queries (never `within(container)` or `document.querySelector()`)
- Co-locate tests or use `__tests__/` directories
- Cover route behavior, database interactions, and edge cases

**Rationale:** Tests are the only way to verify correctness. "This should work" without
running tests is unacceptable. TDD prevents regressions and documents expected behavior.

### III. Type Safety and Validation

Strong typing and runtime validation protect against errors and document contracts.

**Rules:**

- Never use `any` type - enforced by ESLint
- Use `unknown` for truly unknown types, then narrow with type guards
- Use proper generics and type constraints
- NEVER use nullish coalescing (`??`) or boolean coalescing (`||`) when values are guaranteed to exist
- After validation, use `assert` to document guarantees: `assert(canonical, 'Already validated, so we know this exists')`
- Breaking changes to interfaces/types require finding and updating ALL usages including tests

**Rationale:** TypeScript's type system catches errors at compile time. Using `any` or
coalescing operators when values are guaranteed obscures logic and defeats the purpose
of type safety.

### IV. User Experience Consistency

All user-facing text and interfaces must be consistent, accessible, and translatable.

**Rules:**

- ALL user-facing text MUST be translatable using `react-intl`
- Use `defineMessages` in co-located `messages.ts` files
- Message IDs are UPPERCASE with dot notation (e.g., `HOME.TITLE`, `AUTH.LOGIN_FORM.EMAIL_FIELD_LABEL`)
- ALWAYS translate aria-labels and accessibility attributes using `useIntl` hook
- Never use hardcoded strings in JSX
- Follow Tailwind CSS v4 conventions
- Use Radix UI Themes for UI components

**Rationale:** Internationalization must be built in from the start, not added later.
Accessibility is mandatory, not optional. Consistent styling creates professional UX.

### V. Observability and Error Handling

Systems must be debuggable with structured logging and clear error boundaries.

**Rules:**

- Add helpful error logs using `getLogger(c).error()` (server) before throwing exceptions
- Use structured logging with context as second parameter: `getLogger(c).error('message', { userId, requestData })`
- NEVER leak internal error details to API responses - use generic error messages for exceptions
- Log internal errors with detailed context for debugging
- Track performance issues and bottlenecks

**Rationale:** Production debugging is impossible without logs. Detailed internal logs
combined with safe external messages balance debugging needs with security.

### VI. Performance Requirements

Applications must be responsive and efficient under expected load.

**Rules:**

- API responses MUST be under 200ms at p95 latency
- Frontend should target 60 fps for interactions
- Database queries MUST be optimized with proper indexes
- Bundle sizes should be minimized (code splitting, tree shaking)
- Performance regressions caught during `just ready` cycle

**Rationale:** Users abandon slow applications. Performance must be measured and
maintained as a core quality metric, not an afterthought.

## Development Standards

### Code Organization

**Monorepo Structure:**

- `server/`: Backend (Bun, Hono, Drizzle, Better Auth)
- `web/`: Frontend (Vite, React, Radix UI, Tailwind CSS)
- `modules/`: Shared modules (schemas)

**Naming Conventions:**

- Variables/Functions: `camelCase`
- Types/Classes/Components: `PascalCase`
- Filenames: `kebab-case` (e.g., `user-profile.tsx`, `auth-service.ts`)

**File Organization:**

- Co-locate related files (components, tests, messages)
- Use `__tests__/` directories for test files
- Maximum line length ~100 characters
- 2-space indentation

### Technology Standards

**Server Stack:**

- Runtime: Bun v1.3+
- Framework: Hono
- Database: Postgres with Drizzle ORM
- Auth: Better Auth
- Testing: `bun:test`

**Web Stack:**

- Build Tool: Vite
- Framework: React (functional components with hooks)
- Styling: Tailwind CSS v4
- UI Library: Radix UI Themes
- i18n: react-intl
- Testing: vitest with Testing Library

**Quality Tools:**

- Task Runner: `just`
- Linting: ESLint (strict, no suppressions)
- Formatting: Prettier
- Type Checking: TypeScript strict mode

### Workflow Requirements

**Development Workflow:**

1. Always use `just` commands from root directory
2. Start services: `just start-services` (Postgres via Docker)
3. Run migrations: `just migrate`
4. Start development: `just dev` (server + web in parallel)
5. Before committing: `just ready` MUST pass

**Prohibited Operations:**

- NEVER run dev servers directly (use `just dev`)
- NEVER perform destructive git operations (`git checkout`, `git stash`, `git reset`, `git rebase`)
- NEVER add ESLint suppressions
- NEVER use `any` type in TypeScript

**API & Documentation:**

- Base API path: `/app-api/v1`
- OpenAPI spec: `/docs/spec.json`, `/docs/spec.yaml`
- Swagger UI: `/docs/doc`
- Scalar UI: `/docs/scalar`
- Update spec: `just download-spec` (writes to `web/src/openapi.yaml`)

## Governance

### Amendment Process

1. **Proposal**: Document the change with rationale and impact analysis
2. **Version Increment**: Apply semantic versioning
   - MAJOR: Backward incompatible governance/principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements
3. **Template Sync**: Update all affected templates (plan, spec, tasks, checklists, agent files)
4. **Approval**: Constitution changes require explicit review and approval
5. **Documentation**: Update Sync Impact Report and propagate changes

### Compliance Review

- All pull requests MUST verify compliance with constitution principles
- Quality gates (`just ready`) enforce technical compliance
- Code reviews enforce architectural and style compliance
- Non-compliance must be explicitly justified with complexity tracking

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- Breaking changes increment MAJOR version
- Additions increment MINOR version
- Clarifications increment PATCH version

### Runtime Guidance

For detailed runtime development guidance, refer to [AGENTS.md](../../AGENTS.md) which
provides comprehensive instructions for:

- Critical development rules
- Project structure and module organization
- Build, test, and development commands
- Coding style and naming conventions
- Testing guidelines with TestHelper usage
- Security and configuration requirements
- API and documentation standards
- SPA routing configuration

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
