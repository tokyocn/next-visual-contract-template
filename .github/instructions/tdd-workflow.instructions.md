---
applyTo: 'src/test/java/**/*.java'
---

# TDD Workflow Discipline

## Red-Green-Refactor Cycle

### RED Phase — Write Failing Test First
1. Write a test that describes the expected behavior
2. Run the test and **observe it fail** — this confirms the test is valid
3. Do NOT write production code before seeing the test fail
4. The failure message should clearly describe what's missing

### GREEN Phase — Make It Pass
1. Write the **minimum** production code to make the failing test pass
2. Do NOT add extra features or handle cases not yet tested
3. Run the test and confirm it passes
4. If it still fails, fix the production code (not the test)

### REFACTOR Phase — Clean Up
1. Refactor production code while keeping all tests green
2. Remove duplication, improve naming, simplify logic
3. Run all tests after each refactoring change
4. Do NOT add new behavior during refactoring

## TDD Order for DDD Projects

Follow this strict order within each feature:

1. **Domain model tests** (RED) → Domain model implementation (GREEN)
   - State transitions, validation rules, business invariants
   - Test file: `src/test/java/com/library/<context>/domain/model/<Entity>Test.java`

2. **Application service tests** (RED) → Application service + infrastructure (GREEN)
   - Orchestration logic with mocked repositories and module APIs
   - Test file: `src/test/java/com/library/<context>/application/<Service>Test.java`

3. **Refactor** — Clean up both test and production code

## Test Naming Convention

Use descriptive method names following the pattern:
```
methodName_fromState_expectedOutcome
```

Examples:
- `checkout_fromAvailable_transitionsToCheckedOut`
- `checkout_fromCheckedOut_throwsIllegalStateException`
- `borrowBook_memberQuotaExceeded_throwsException`

## Test Structure

Use the Given-When-Then pattern (AAA — Arrange, Act, Assert):

```java
@Test
void shouldRejectBorrow_whenMemberQuotaExceeded() {
    // given — set up preconditions
    var member = new Member("John", MembershipType.BASIC);
    // ... exhaust quota

    // when / then — execute and verify
    assertThrows(QuotaExceededException.class, () ->
        member.validateBorrowQuota());
}
```

## Constraints

- Never mark tests as `@Disabled` without explicit rationale in comments
- Do not mock domain models — test them directly with real instances
- Each test method should test exactly one behavior
- Tests must be independent — no shared mutable state between tests
- Integration tests extend `BaseIntegrationTest` using PostgreSQL on port 15432
