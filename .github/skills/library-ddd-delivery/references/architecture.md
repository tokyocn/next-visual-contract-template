# Architecture Quick Reference

## Stack
- Java 21, Spring Boot 3.4.1, Gradle 8.12 (Kotlin DSL)
- PostgreSQL 16, Flyway, Spring Data JPA
- Hand-written @Component mapper classes, SpringDoc OpenAPI 2.7.0

## Structure
Modular monolith with 4 bounded contexts:

```
com.library/
  catalog/        # Books and copies management
  membership/     # Member registration and status
  borrowing/      # Borrow and return flows
  reservation/    # Reservation lifecycle
  shared/         # BaseEntity, DomainEvent, GlobalExceptionHandler
```

Each context follows:
```
<context>/
  api/                          # Module API interface + DTOs (cross-context)
  application/                  # Application services (@Transactional)
  domain/model/                 # Domain entities + value objects
  domain/repository/            # Repository interfaces
  infrastructure/persistence/   # JPA entities, mappers, repo impls
  interfaces/rest/              # Controllers + REST DTOs
```

## Cross-Context Communication
- Via Module API interfaces: `CatalogService`, `MembershipService`, `ReservationService`
- Module API impls use `@Transactional(propagation = MANDATORY)` — must join caller's TX
- Strong consistency via local transactions (single database)

## Concurrency Strategy
| Resource | Lock Type | Purpose |
|----------|-----------|---------|
| Member | `FOR UPDATE` | Quota serialization |
| Book | `FOR UPDATE` | Copy-state serialization |
| BookCopy | `@Version` | Optimistic lock |
| Reservation | `FOR UPDATE` | `onCopyReturned` selection |
| Business rules | Partial unique indexes | DB-level double-write prevention |

## Key Invariant
`lockBook(bookId)` must be called before any flow changing BookCopy status.

## API Source of Truth
`docs/api/openapi.yaml` — OpenAPI 3.0 specification, version-controlled and reviewed by humans.

## Primary Design Document
`docs/implementation-plan.md`
