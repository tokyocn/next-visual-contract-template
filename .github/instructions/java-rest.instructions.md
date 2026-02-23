---
name: 'REST Controller'
description: 'Conventions for REST controllers, request/response DTOs, and API design.'
applyTo: 'src/main/java/**/interfaces/rest/**/*.java'
---

# REST Controller Conventions

## Controllers

- `@RestController` + `@RequestMapping("/api/<resource>")`
- No business logic — delegate to application services
- No `@Transactional` — transactions owned by application services
- Use `@Valid` on request bodies
- Constructor injection

```java
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookApplicationService bookApplicationService;

    public BookController(BookApplicationService bookApplicationService) {
        this.bookApplicationService = bookApplicationService;
    }

    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody CreateBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookApplicationService.createBook(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBook(@PathVariable UUID id) {
        return ResponseEntity.ok(bookApplicationService.getBook(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable UUID id) {
        bookApplicationService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Request DTOs

- Java `record` with Jakarta validation annotations
- Naming: `Create*Request`, `Update*Request`

```java
public record CreateBookRequest(
        @NotBlank(message = "ISBN is required") String isbn,
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Author is required") String author,
        String publisher,
        Integer publishedYear,
        String description
) {}
```

## Response DTOs

- Java `record`, naming: `*Response`
- Never expose JPA version fields or internal status codes

```java
public record BookResponse(
        UUID id, String isbn, String title, String author,
        String publisher, Integer publishedYear, String description,
        LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```

## HTTP Status Convention

| Operation | Status | Method |
|-----------|--------|--------|
| Create | `201 Created` | `ResponseEntity.status(HttpStatus.CREATED).body(...)` |
| Read | `200 OK` | `ResponseEntity.ok(...)` |
| Update | `200 OK` | `ResponseEntity.ok(...)` |
| Delete | `204 No Content` | `ResponseEntity.noContent().build()` |
| Not Found | `404` | Throw `EntityNotFoundException` (handled by `GlobalExceptionHandler`) |
