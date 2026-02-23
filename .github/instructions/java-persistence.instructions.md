---
name: 'JPA Persistence Layer'
description: 'Conventions for JPA entities, hand-written @Component mapper classes, and repository implementations.'
applyTo: 'src/main/java/**/infrastructure/persistence/**/*.java'
---

# Persistence Layer Conventions

## JPA Entities

- Live in `infrastructure/persistence/` package, separate from domain models
- Class name pattern: `*JpaEntity` (e.g., `BookJpaEntity`, `MemberJpaEntity`)
- Do NOT use `@GeneratedValue` — `BaseEntity` generates UUIDs in constructor
- Tables without `updated_at` column (borrow_records, reservations): do NOT add `updatedAt` field
- Use `@Version` on `BookCopyJpaEntity` for optimistic locking
- All fields have public getters and setters (unlike domain models)

```java
package com.library.catalog.infrastructure.persistence;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "books")
@EntityListeners(AuditingEntityListener.class)
public class BookJpaEntity {

    @Id
    private UUID id;          // NO @GeneratedValue

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String publisher;
    private Integer publishedYear;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime deletedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected BookJpaEntity() {}

    // Public getters and setters for all fields
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    // ... all other getters/setters
}
```

## Mapper Classes

- Plain `@Component` classes (NOT generated mapper frameworks like MapStruct)
- `toJpaEntity()`: create new JPA entity, copy all fields via setters
- `toDomainModel()`: call the domain model's full-args constructor (domain has no setters)
- Convert value objects explicitly (e.g., `ISBN` record <-> `String`)

```java
package com.library.catalog.infrastructure.persistence;

import com.library.catalog.domain.model.Book;
import com.library.catalog.domain.model.ISBN;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookJpaEntity toJpaEntity(Book book) {
        if (book == null) return null;
        BookJpaEntity entity = new BookJpaEntity();
        entity.setId(book.getId());
        entity.setIsbn(book.getIsbn() != null ? book.getIsbn().value() : null);
        entity.setTitle(book.getTitle());
        entity.setAuthor(book.getAuthor());
        entity.setPublisher(book.getPublisher());
        entity.setPublishedYear(book.getPublishedYear());
        entity.setDescription(book.getDescription());
        entity.setDeletedAt(book.getDeletedAt());
        entity.setCreatedAt(book.getCreatedAt());
        entity.setUpdatedAt(book.getUpdatedAt());
        return entity;
    }

    public Book toDomainModel(BookJpaEntity entity) {
        if (entity == null) return null;
        // Use full-args constructor — domain model has no setters for these fields
        return new Book(
                entity.getId(),
                entity.getIsbn() != null ? new ISBN(entity.getIsbn()) : null,
                entity.getTitle(),
                entity.getAuthor(),
                entity.getPublisher(),
                entity.getPublishedYear(),
                entity.getDescription(),
                entity.getDeletedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
```

## Spring Data JPA Repositories

- Interface extending `JpaRepository<*JpaEntity, UUID>`
- Pessimistic locking: `@Lock(LockModeType.PESSIMISTIC_WRITE)` + `@Query`

```java
package com.library.catalog.infrastructure.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface JpaBookRepository extends JpaRepository<BookJpaEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BookJpaEntity b WHERE b.id = :id")
    Optional<BookJpaEntity> findByIdForUpdate(@Param("id") UUID id);

    boolean existsByIsbn(String isbn);
}
```

## Repository Implementations

- Implement domain repository interface from `domain/repository/`
- `@Repository` annotation, constructor injection
- Delegate to `Jpa*Repository`, convert via mapper

```java
package com.library.catalog.infrastructure.persistence;

import com.library.catalog.domain.model.Book;
import com.library.catalog.domain.repository.BookRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class BookRepositoryImpl implements BookRepository {

    private final JpaBookRepository jpaBookRepository;
    private final BookMapper bookMapper;

    public BookRepositoryImpl(JpaBookRepository jpaBookRepository, BookMapper bookMapper) {
        this.jpaBookRepository = jpaBookRepository;
        this.bookMapper = bookMapper;
    }

    @Override
    public Book save(Book book) {
        BookJpaEntity entity = bookMapper.toJpaEntity(book);
        BookJpaEntity saved = jpaBookRepository.save(entity);
        return bookMapper.toDomainModel(saved);
    }

    @Override
    public Optional<Book> findById(UUID id) {
        return jpaBookRepository.findById(id)
                .map(bookMapper::toDomainModel);
    }

    @Override
    public Optional<Book> findByIdForUpdate(UUID id) {
        return jpaBookRepository.findByIdForUpdate(id)
                .map(bookMapper::toDomainModel);
    }
}
```

