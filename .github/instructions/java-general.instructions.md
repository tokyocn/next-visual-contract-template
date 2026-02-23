---
name: 'Java General'
description: 'Project-wide Java coding conventions that apply to all Java files in the Library Management System.'
applyTo: 'src/main/java/**/*.java'
---

# Java General Coding Rules

## Language & Framework

- Java 21, Spring Boot 3.4.x
- Use Java 21 features: records, sealed classes, pattern matching where appropriate
- Do NOT use Lombok — this project does not use Lombok

## Dependency Injection

- Constructor injection only — no `@Autowired` field injection
- Dependencies as `private final` fields
- Single constructor (Spring auto-detects it, no `@Autowired` needed)

```java
@Service
public class BookApplicationService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookApplicationService(BookRepository bookRepository,
                                  BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
    }
}
```

## Immutable Data Carriers

- Use Java `record` for: DTOs, value objects, events, API payloads
- Use plain classes for: domain entities (need mutable state), JPA entities (need setters)

```java
// record — DTO, value object, event
public record BookCopyDto(UUID id, UUID bookId, String barcode, String location, String status) {}
public record ISBN(String value) { /* validation in compact constructor */ }
public record BookReturnedEvent(UUID borrowRecordId, UUID bookCopyId, UUID memberId) {}

// class — entity with mutable state
public class BookCopy extends BaseEntity { /* state transition methods */ }
```

## Exception Strategy

- `IllegalArgumentException` — invalid input (→ 400 Bad Request)
- `EntityNotFoundException` (`jakarta.persistence`) — resource not found (→ 404 Not Found)
- `IllegalStateException` — business rule violation (→ 409 Conflict)
- `OptimisticLockException` — concurrent modification (→ 409 Conflict)
- All mapped in `GlobalExceptionHandler` using `ProblemDetail` (RFC 7807)

```java
// Domain/application layer — throw standard exceptions
if (member.getStatus() != MemberStatus.ACTIVE) {
    throw new IllegalStateException("Member is not active. Current status: " + member.getStatus());
}

// GlobalExceptionHandler — returns RFC 7807 ProblemDetail
@ExceptionHandler(IllegalStateException.class)
public ProblemDetail handleConflict(IllegalStateException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
}
```

## Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Package | `com.library.<context>.<layer>` | `com.library.catalog.domain.model` |
| Domain entity | `<Noun>` | `Book`, `BookCopy`, `Member` |
| Value object | `<Noun>` (record) | `ISBN`, `Email`, `BorrowPeriod` |
| Enum | `<Noun>Status` | `CopyStatus`, `MemberStatus` |
| JPA entity | `<Noun>JpaEntity` | `BookJpaEntity`, `MemberJpaEntity` |
| Domain repository | `<Noun>Repository` (interface) | `BookRepository` |
| JPA repository | `Jpa<Noun>Repository` | `JpaBookRepository` |
| Repository impl | `<Noun>RepositoryImpl` | `BookRepositoryImpl` |
| Mapper | `<Noun>Mapper` | `BookMapper`, `BookCopyMapper` |
| Application service | `<Noun>ApplicationService` | `BookApplicationService` |
| Module API interface | `<Context>Service` | `CatalogService`, `MembershipService` |
| Module API impl | `<Context>ServiceImpl` | `CatalogServiceImpl` |
| Controller | `<Noun>Controller` | `BookController` |
| Request DTO | `Create<Noun>Request` / `Update<Noun>Request` | `CreateBookRequest` |
| Response DTO | `<Noun>Response` | `BookResponse` |
| Domain event | `<Noun><Verb>Event` (record) | `BookBorrowedEvent`, `BookReturnedEvent` |

## Transaction Rules

| Layer | Annotation | Reason |
|-------|------------|--------|
| Application service | `@Transactional` | Owns the transaction |
| Application service (read) | `@Transactional(readOnly = true)` | Optimize read queries |
| Module API impl | `@Transactional(propagation = MANDATORY)` | Must join caller's TX |
| Controller | None | No transaction annotation |
| Domain model | None | No Spring dependency |

## Package Boundaries

```
com.library.<context>/
  api/              → CAN be imported by other contexts
  api/dto/          → CAN be imported by other contexts
  application/      → CANNOT be imported by other contexts
  domain/model/     → CANNOT be imported by other contexts
  domain/repository/ → CANNOT be imported by other contexts
  infrastructure/   → CANNOT be imported by other contexts
  interfaces/rest/  → CANNOT be imported by other contexts
```

## Style

- No wildcard imports (`import java.util.*` — use specific imports)
- `final` on local variables is optional — do not add unless the team prefers it
- Use `var` sparingly — only when the type is obvious from the right-hand side
- Braces on same line (K&R style)
- Prefer early return over nested if-else
