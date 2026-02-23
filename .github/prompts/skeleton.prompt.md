---
agent: 'Skeleton Generator'
description: 'Generate compilable code stubs from the API contract with zero business logic.'
model: 'Claude Sonnet 4.5'
tools: ['search', 'read', 'edit', 'execute']
---

# Skeleton Phase

Generate compilable code stubs from the approved API contract.

## Input

1. Read `.github/handoffs/02-api-contract-to-skeleton.md` for the contract summary
2. Read `.github/handoffs/01-design-to-api-contract.md` for the full design context
3. Read `docs/api/openapi.yaml` for the complete API specification

## Process

1. Create Flyway migrations for new tables/columns
2. Create domain model classes with fields and stub methods
3. Create repository interfaces
4. Create JPA entities matching the Flyway schema
5. Create hand-written `@Component` mapper stubs
6. Create application service stubs with `@Transactional`
7. Create request/response DTOs matching OpenAPI schemas
8. Create controller stubs with SpringDoc annotations
9. Verify compilation: `./gradlew compileJava`

All method bodies throw `UnsupportedOperationException("Not yet implemented")`.

## Output

Write `.github/handoffs/03-skeleton-to-tdd.md` with:
- Compilation status (must be SUCCESS)
- Created files list
- Stub methods (TDD work items)
- Suggested TDD order
