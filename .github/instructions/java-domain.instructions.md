---
name: 'DDD Domain Model'
description: 'Conventions for domain models, value objects, and entities in the Library Management System.'
applyTo: 'src/main/java/**/domain/model/**/*.java'
---

# Domain Model Conventions

## Entity Classes

- Extend `com.library.shared.domain.BaseEntity` which generates UUID in constructor
- Domain models are plain Java classes — NOT JPA entities
- No public setters for invariant fields; use constructor initialization
- Use business methods for state transitions
- Validate invariants in constructor and state-transition methods
- Throw `IllegalStateException` for invalid state transitions
- Provide two constructors: business constructor (new entity) + full-args constructor (reconstruction from DB)

```java
public class BookCopy extends BaseEntity {

    private UUID bookId;
    private String barcode;
    private CopyStatus status;
    private int version;

    // Protected no-arg constructor
    protected BookCopy() { super(); }

    // Business constructor — for creating new entities
    public BookCopy(UUID bookId, String barcode, String location) {
        super();  // BaseEntity generates UUID + sets createdAt/updatedAt
        this.bookId = bookId;
        this.barcode = barcode;
        this.status = CopyStatus.AVAILABLE;  // default initial state
    }

    // Full-args constructor — for reconstruction from persistence
    public BookCopy(UUID id, UUID bookId, String barcode, String location, CopyStatus status,
                    int version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, createdAt, updatedAt);
        this.bookId = bookId;
        this.barcode = barcode;
        this.status = status;
        this.version = version;
    }

    // State transition — validate current state, throw if invalid
    public void checkout() {
        if (status != CopyStatus.AVAILABLE) {
            throw new IllegalStateException("Cannot checkout copy: current status is " + status);
        }
        this.status = CopyStatus.CHECKED_OUT;
        setUpdatedAt(LocalDateTime.now());
    }

    // Getters only — no public setters for invariant fields (bookId, barcode)
    public UUID getBookId() { return bookId; }
    public CopyStatus getStatus() { return status; }
}
```

## Value Objects

- Implement as immutable Java `record` with compact constructor validation

```java
public record ISBN(String value) {
    public ISBN {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("ISBN must not be blank");
        }
        String normalized = value.replace("-", "");
        if (normalized.length() != 10 && normalized.length() != 13) {
            throw new IllegalArgumentException("ISBN must be 10 or 13 digits");
        }
    }
}
```

## Bounded Context Isolation

- Domain models must NOT reference models from other bounded contexts
- Domain models must NOT contain JPA annotations (`@Entity`, `@Column`, etc.)
- Cross-context data passes through `api/dto/` types only
