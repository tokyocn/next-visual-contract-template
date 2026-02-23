# Library Management System — Copilot Instructions

## Project Overview
This is a Spring Boot 3.4.x modular monolith implementing a Library Management System with DDD (Domain-Driven Design). Java 21, PostgreSQL 16, Gradle 8.12.

## Bounded Contexts
Four contexts: `catalog`, `membership`, `borrowing`, `reservation`. Each follows the package structure:
`com.library.<context>.{api, application, domain/model, domain/repository, infrastructure/persistence, interfaces/rest}`

## Mandatory Rules

1. **DDD Boundaries**: Never bypass Module API interfaces (`CatalogService`, `MembershipService`, `ReservationService`) for cross-context access. No direct imports of domain models between contexts.

2. **Transaction Ownership**: Application services own `@Transactional`. Module API impls use `@Transactional(propagation = MANDATORY)`. Controllers have no transaction annotations.

3. **Domain Model Pattern**: Domain models extend `BaseEntity` (UUID generated in constructor). They are plain Java classes — NOT JPA entities. No `@GeneratedValue`.

4. **Persistence Separation**: JPA entities live in `infrastructure/persistence/`. Hand-written `@Component` mapper classes convert between domain and JPA. `toDomainModel()` calls the domain model's full-args constructor. `toJpaEntity()` creates a JPA entity and copies fields via setters.

5. **Concurrency Invariant**: `lockBook(bookId)` must be called before any flow changing BookCopy status. Member `FOR UPDATE` for quota serialization.

6. **Testing**: Every behavior change requires test updates. Integration tests use PostgreSQL on port 15432 (NOT Testcontainers). Extend `BaseIntegrationTest`.

7. **Incremental Changes**: Prefer incremental edits with explicit test updates over broad refactors.

## API Source of Truth
`docs/api/openapi.yaml` — OpenAPI 3.0 specification. All REST endpoints, schemas, and validation rules are defined here.

## Design Source of Truth
`docs/implementation-plan.md` — always check existing invariants before proposing changes.

## Delivery Pipeline
Use the agents in `.github/agents/` for structured delivery:
- `/design` — Design phase (DDD analysis, Mermaid diagrams)
- `/api-contract` — API contract phase (OpenAPI spec generation)
- `/skeleton` — Skeleton generation phase (compilable stubs)
- `/tdd` — Core TDD phase (Red-Green-Refactor)
- `/verify` — Integration verification phase (contract compliance, GO/NO-GO)
- `/release` — PR publishing
- `/full-pipeline` — All phases sequentially
