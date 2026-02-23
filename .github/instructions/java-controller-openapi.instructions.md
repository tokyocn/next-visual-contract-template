---
applyTo: 'src/main/java/**/interfaces/rest/*Controller.java'
---

# SpringDoc OpenAPI Controller Conventions

## Class-Level Annotations

Every controller must have a `@Tag` annotation matching the bounded context:

```java
@Tag(name = "catalog", description = "Books and copies management")
@RestController
@RequestMapping("/api/v1/books")
public class BookController { ... }
```

## Method-Level Annotations

Every endpoint method must have `@Operation` with:
- `summary` — Short description (shown in Swagger UI list)
- `operationId` — Must match the OpenAPI spec's operationId exactly

```java
@Operation(summary = "Get book by ID", operationId = "getBookById")
@GetMapping("/{bookId}")
public ResponseEntity<BookResponse> getBookById(@PathVariable UUID bookId) { ... }
```

## Response Documentation

Use `@ApiResponse` for each possible HTTP status:

```java
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Book found"),
    @ApiResponse(responseCode = "404", description = "Book not found",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
})
```

Common response patterns:
- `201` for POST that creates a resource (include `Location` header)
- `200` for GET, PUT, PATCH
- `204` for DELETE
- `404` for not found
- `409` for business rule violations

## Schema Annotations

Use `@Schema` on request/response DTOs for documentation:

```java
public record CreateBookRequest(
    @Schema(description = "Book title", example = "Domain-Driven Design")
    @NotBlank String title,

    @Schema(description = "ISBN-13", example = "978-0321125217")
    @NotBlank @Size(min = 13, max = 17) String isbn
) {}
```

## Validation

- Request DTOs use Jakarta validation annotations: `@NotNull`, `@NotBlank`, `@Size`, `@Pattern`
- Controller parameters use `@Valid` for request body validation
- Path parameters use `@PathVariable` with type safety (prefer `UUID` over `String`)
