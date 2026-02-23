---
name: 'Test Conventions'
description: 'Testing patterns for unit tests, integration tests, and concurrency tests.'
applyTo: 'src/test/java/**/*.java'
---

# Test Conventions

## Unit Tests — Domain Model

- Test directly without mocking
- Use `methodName_fromState_expectedOutcome` naming
- Create helper methods for test object construction
- Test both valid transitions and invalid transitions (`assertThrows`)

```java
package com.library.catalog.domain.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class BookCopyTest {

    private BookCopy createCopyWithStatus(CopyStatus status) {
        return new BookCopy(UUID.randomUUID(), UUID.randomUUID(), "BC-001", "A1",
                status, 0, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void checkout_fromAvailable_transitionsToCheckedOut() {
        BookCopy copy = createCopyWithStatus(CopyStatus.AVAILABLE);

        copy.checkout();

        assertEquals(CopyStatus.CHECKED_OUT, copy.getStatus());
    }

    @Test
    void checkout_fromCheckedOut_throwsIllegalStateException() {
        BookCopy copy = createCopyWithStatus(CopyStatus.CHECKED_OUT);
        assertThrows(IllegalStateException.class, copy::checkout);
    }
}
```

## Unit Tests — Value Objects

- Test validation rules in compact constructor

```java
class ISBNTest {

    @Test
    void validIsbn13_createsSuccessfully() {
        ISBN isbn = new ISBN("978-0-13-468599-1");
        assertNotNull(isbn);
    }

    @Test
    void blankIsbn_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> new ISBN(""));
    }

    @Test
    void invalidLength_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> new ISBN("12345"));
    }
}
```

## Integration Tests

- Extend `BaseIntegrationTest` — connects to PostgreSQL on port 15432
- `@Transactional` at class level for automatic rollback
- Create all test data within the test (no shared fixtures)
- Use real application services, not mocks

```java
package com.library.borrowing.application;

import com.library.BaseIntegrationTest;
import com.library.borrowing.interfaces.rest.BorrowRequest;
import com.library.borrowing.interfaces.rest.BorrowResponse;
import com.library.catalog.application.BookApplicationService;
import com.library.catalog.application.BookCopyApplicationService;
import com.library.catalog.interfaces.rest.*;
import com.library.membership.application.MemberApplicationService;
import com.library.membership.interfaces.rest.CreateMemberRequest;
import com.library.membership.interfaces.rest.MemberResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@Transactional
class BorrowFlowIntegrationTest extends BaseIntegrationTest {

    @Autowired private BorrowApplicationService borrowApplicationService;
    @Autowired private BookApplicationService bookApplicationService;
    @Autowired private BookCopyApplicationService bookCopyApplicationService;
    @Autowired private MemberApplicationService memberApplicationService;

    @Test
    void borrowAndReturnFlow() {
        // given — create all test data
        BookResponse book = bookApplicationService.createBook(
                new CreateBookRequest("978-0-13-468599-1", "Clean Architecture",
                        "Robert C. Martin", "Prentice Hall", 2017, "A guide"));
        BookCopyResponse copy = bookCopyApplicationService.addCopy(
                book.id(), new AddCopyRequest("BC-001", "Shelf A1"));
        MemberResponse member = memberApplicationService.createMember(
                new CreateMemberRequest("Alice", "alice@example.com", "555-0100"));

        // when — borrow
        BorrowResponse borrowResponse = borrowApplicationService.borrowBook(
                new BorrowRequest(member.id(), copy.id()));

        // then
        assertNotNull(borrowResponse.id());
        assertEquals("ACTIVE", borrowResponse.status());

        // when — return
        BorrowResponse returnResponse = borrowApplicationService.returnBook(borrowResponse.id());

        // then
        assertEquals("RETURNED", returnResponse.status());
        assertNotNull(returnResponse.returnDate());
    }

    @Test
    void borrowLimitExceeded() {
        MemberResponse member = memberApplicationService.createMember(
                new CreateMemberRequest("Bob", "bob@example.com", "555-0200"));
        BookResponse book = bookApplicationService.createBook(
                new CreateBookRequest("978-0-13-235088-4", "Clean Code",
                        "Robert C. Martin", "Prentice Hall", 2008, "Handbook"));

        // Borrow up to limit (5)
        for (int i = 1; i <= 5; i++) {
            BookCopyResponse c = bookCopyApplicationService.addCopy(
                    book.id(), new AddCopyRequest("BL-" + i, "Shelf B" + i));
            borrowApplicationService.borrowBook(new BorrowRequest(member.id(), c.id()));
        }

        // 6th borrow should fail
        BookCopyResponse extra = bookCopyApplicationService.addCopy(
                book.id(), new AddCopyRequest("BL-6", "Shelf B6"));
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                borrowApplicationService.borrowBook(new BorrowRequest(member.id(), extra.id())));
        assertEquals("Member has reached the maximum borrow limit of 5", ex.getMessage());
    }
}
```

## Concurrency Tests

- Use `ExecutorService` + `CountDownLatch` for simultaneous execution
- Do NOT use `@Transactional` (each thread needs its own transaction)

```java
@Test
void shouldHandleConcurrentBorrows() throws Exception {
    // given — create shared test data (outside threads)
    int threadCount = 5;
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    CountDownLatch latch = new CountDownLatch(1);
    List<Future<?>> futures = new ArrayList<>();

    // when — all threads try to borrow the same copy simultaneously
    for (int i = 0; i < threadCount; i++) {
        futures.add(executor.submit(() -> {
            latch.await();
            borrowApplicationService.borrowBook(new BorrowRequest(memberId, copyId));
            return null;
        }));
    }
    latch.countDown();  // release all threads at once

    // then — exactly one should succeed, rest should fail
    int successCount = 0;
    for (Future<?> f : futures) {
        try { f.get(); successCount++; } catch (ExecutionException ignored) {}
    }
    assertEquals(1, successCount);
    executor.shutdown();
}
```

## BaseIntegrationTest

```java
@SpringBootTest
public abstract class BaseIntegrationTest {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:postgresql://localhost:15432/library_test");
        registry.add("spring.datasource.username", () -> "test");
        registry.add("spring.datasource.password", () -> "test");
    }
}
```

## Required Coverage Per Change

- Happy path: minimum 1 test
- Invalid state transition: minimum 1 test
- Concurrency scenario (for borrowing/reservation changes): minimum 1 test
