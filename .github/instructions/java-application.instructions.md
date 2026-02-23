---
name: 'Application Service'
description: 'Conventions for application services and Module API implementations.'
applyTo: 'src/main/java/**/application/**/*.java'
---

# Application Service Conventions

## Application Services

- `@Service` + `@Transactional` at class level
- `@Transactional(readOnly = true)` for read-only operations
- Constructor injection with `private final` fields
- Private `toResponse()` helper for domain-to-DTO conversion

```java
@Service
@Transactional
public class BookApplicationService {

    private final BookRepository bookRepository;

    public BookApplicationService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public BookResponse createBook(CreateBookRequest request) {
        ISBN isbn = new ISBN(request.isbn());
        if (bookRepository.existsByIsbn(isbn.value())) {
            throw new IllegalArgumentException("A book with ISBN " + isbn.value() + " already exists");
        }
        Book book = new Book(isbn, request.title(), request.author(),
                request.publisher(), request.publishedYear(), request.description());
        return toResponse(bookRepository.save(book));
    }

    @Transactional(readOnly = true)
    public BookResponse getBook(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found: " + id));
        return toResponse(book);
    }

    private BookResponse toResponse(Book book) {
        return new BookResponse(book.getId(), book.getIsbn().value(), book.getTitle(),
                book.getAuthor(), book.getPublisher(), book.getPublishedYear(),
                book.getDescription(), book.getCreatedAt(), book.getUpdatedAt());
    }
}
```

## Module API Implementations

- `@Transactional(propagation = Propagation.MANDATORY)` on every method — must join caller's TX
- Implement the interface from `api/` package

```java
@Service
public class CatalogServiceImpl implements CatalogService {

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void lockBook(UUID bookId) {
        bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new EntityNotFoundException("Book not found: " + bookId));
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void checkoutCopy(UUID bookCopyId) {
        BookCopy copy = bookCopyRepository.findById(bookCopyId)
                .orElseThrow(() -> new EntityNotFoundException("Copy not found: " + bookCopyId));
        copy.checkout();
        bookCopyRepository.save(copy);
    }
}
```
