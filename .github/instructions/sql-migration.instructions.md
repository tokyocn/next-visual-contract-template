---
name: 'Flyway Migration'
description: 'Conventions for SQL schema migrations using Flyway.'
applyTo: 'src/main/resources/db/migration/**/*.sql'
---

# Flyway Migration Conventions

## Naming

- Pattern: `V<number>__<description>.sql` (double underscore)
- Before creating a new migration, scan `src/main/resources/db/migration/` to find the highest existing version number, then use the next sequential number

## Create Table Pattern

```sql
CREATE TABLE books (
    id          UUID PRIMARY KEY,
    isbn        VARCHAR(17) NOT NULL,
    title       VARCHAR(500) NOT NULL,
    author      VARCHAR(300) NOT NULL,
    publisher   VARCHAR(300),
    published_year INTEGER,
    description TEXT,
    deleted_at  TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- Partial unique index: enforce uniqueness only for non-deleted records
CREATE UNIQUE INDEX uk_books_isbn ON books (isbn) WHERE deleted_at IS NULL;
```

## Schema Rules

- `UUID` type for primary keys (mapped from `BaseEntity.id`)
- `created_at TIMESTAMP NOT NULL DEFAULT now()` on all tables
- `updated_at TIMESTAMP NOT NULL DEFAULT now()` only on: books, book_copies, members
- Do NOT add `updated_at` on: borrow_records, reservations
- `version INTEGER NOT NULL DEFAULT 0` on book_copies (optimistic locking)

## Foreign Keys

```sql
CREATE TABLE book_copies (
    id          UUID PRIMARY KEY,
    book_id     UUID NOT NULL REFERENCES books(id),
    barcode     VARCHAR(50) NOT NULL,
    location    VARCHAR(200),
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    version     INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uk_book_copies_barcode ON book_copies (barcode);
```

## Partial Unique Indexes (Business Rule Enforcement)

```sql
-- Only one active borrow per copy at a time
CREATE UNIQUE INDEX uk_borrow_records_active_copy
    ON borrow_records (book_copy_id) WHERE status = 'ACTIVE';

-- Only one pending reservation per member per book
CREATE UNIQUE INDEX uk_reservations_pending_member_book
    ON reservations (member_id, book_id) WHERE status = 'PENDING';
```

## Additive Changes (ALTER TABLE)

```sql
-- V6 example: adding a new column
ALTER TABLE borrow_records ADD COLUMN fine_amount DECIMAL(10,2);

-- V7 example: adding a new table
CREATE TABLE fines (
    id              UUID PRIMARY KEY,
    borrow_record_id UUID NOT NULL REFERENCES borrow_records(id),
    member_id       UUID NOT NULL REFERENCES members(id),
    amount          DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
```

## Constraints

- Never modify existing migration files — create new migrations for changes
- New columns should have defaults or be nullable for backward compatibility
- Enum-like status columns: use `VARCHAR` not database enum types
