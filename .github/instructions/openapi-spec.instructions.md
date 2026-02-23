---
applyTo: 'docs/api/**/*.yaml'
---

# OpenAPI 3.0 Specification Conventions

## General Structure

- Use OpenAPI 3.0.3 specification
- Single file: `docs/api/openapi.yaml`
- Version-controlled and reviewed by humans

## Tags

One tag per bounded context:
- `catalog` — Books and copies management
- `membership` — Member registration and status
- `borrowing` — Borrow and return flows
- `reservation` — Reservation lifecycle

## OperationId Naming

Format: `<verb><Resource>` in camelCase.
- `createBook`, `getBookById`, `listBooks`
- `borrowBook`, `returnBook`
- `createReservation`, `cancelReservation`
- `registerMember`, `getMemberById`

## Request/Response Bodies

- Use `$ref` to `#/components/schemas/` for all request and response bodies
- Schema naming: `Create<Resource>Request`, `Update<Resource>Request`, `<Resource>Response`
- Use `format` for common types: `uuid` for IDs, `date` for dates, `date-time` for timestamps
- Mark required fields explicitly in `required` arrays

## Error Responses

All error responses use RFC 9457 ProblemDetail format:

```yaml
components:
  schemas:
    ProblemDetail:
      type: object
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
          format: uri
```

Standard error mappings:
- `400` — Validation failures (Jakarta Bean Validation)
- `404` — Resource not found
- `409` — Business rule violation (quota exceeded, invalid state transition)
- `422` — Semantically invalid request

## Validation Mapping

OpenAPI validation constraints must match Jakarta Bean Validation annotations:
- `minLength` / `maxLength` → `@Size`
- `pattern` → `@Pattern`
- `minimum` / `maximum` → `@Min` / `@Max`
- required field → `@NotNull` / `@NotBlank`

## Paths

- Use kebab-case for path segments: `/book-copies`, `/borrow-records`
- Resource IDs as path parameters: `/books/{bookId}`
- Plural nouns for collections: `/books`, `/members`
- Nested resources for strong ownership: `/books/{bookId}/copies`
