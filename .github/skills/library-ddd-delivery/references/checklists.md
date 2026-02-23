# Phase Checklists

## Phase 1: Design
- [ ] Feature requirements extracted with explicit constraints
- [ ] Impacted bounded contexts identified
- [ ] Transaction boundaries defined
- [ ] Concurrency strategy specified (which locks, which entities)
- [ ] API changes documented (REST + Module API)
- [ ] Persistence changes planned (Flyway + JPA)
- [ ] Mermaid diagrams included (context interaction, state transitions, sequence)
- [ ] Acceptance criteria are testable (not vague)
- [ ] Non-goals stated to prevent scope creep
- [ ] File-level implementation plan complete

## Phase 2: API Contract
- [ ] OpenAPI 3.0.3 spec is valid YAML
- [ ] All endpoints have unique operationId in camelCase
- [ ] Tags match bounded contexts (catalog, membership, borrowing, reservation)
- [ ] Request/response bodies use $ref to #/components/schemas/
- [ ] Schema naming follows convention: Create*Request, Update*Request, *Response
- [ ] Error responses use ProblemDetail format
- [ ] Validation constraints match Jakarta annotations (documented in mapping table)
- [ ] Required fields are in required arrays
- [ ] UUID fields use format: uuid
- [ ] No existing endpoints removed without explicit approval

## Phase 3: Skeleton
- [ ] Flyway migrations created for new tables/columns
- [ ] Domain models extend BaseEntity with fields and stub methods
- [ ] JPA entities created (no @GeneratedValue, correct field set)
- [ ] Hand-written @Component mapper stubs created
- [ ] Repository interfaces and implementations created
- [ ] Application service stubs with @Transactional created
- [ ] Request/response DTOs match OpenAPI schemas exactly
- [ ] Controllers have SpringDoc annotations (@Tag, @Operation, @ApiResponse)
- [ ] Jakarta validation annotations on request DTOs match spec
- [ ] All business-logic methods throw UnsupportedOperationException
- [ ] Project compiles: `./gradlew compileJava`

## Phase 4: Core TDD
- [ ] Domain model tests written BEFORE implementation (RED first)
- [ ] Each test observed to fail before writing production code
- [ ] Domain model stubs replaced with minimum code to pass (GREEN)
- [ ] Application service tests written with mocked dependencies (RED)
- [ ] Application service + infrastructure implemented (GREEN)
- [ ] All tests pass: `./gradlew test`
- [ ] No tests disabled without rationale
- [ ] Test naming: should*_when*
- [ ] Domain models tested directly (no mocking)
- [ ] lockBook() called before BookCopy status changes

## Phase 5: Integration Verification
- [ ] Contract compliance verified (implementation matches OpenAPI spec)
- [ ] Controller @Operation operationId matches spec
- [ ] Request DTO fields and validation match spec schemas
- [ ] Response DTO fields match spec schemas
- [ ] HTTP status codes match spec responses
- [ ] Integration tests extend BaseIntegrationTest
- [ ] Happy path end-to-end flows tested
- [ ] Concurrency scenarios tested (ExecutorService + CountDownLatch)
- [ ] Cross-context flows tested
- [ ] DDD boundary check passed (no violations)
- [ ] Full test suite passes: `./gradlew test`
- [ ] GO/NO-GO assessment documented with rationale

## Phase 6: Release
- [ ] GO assessment verified from verification handoff
- [ ] Feature branch created (not committing to main/master)
- [ ] Commit message uses conventional format
- [ ] PR title under 70 characters
- [ ] PR body includes: summary, changes, API contract link, test evidence, risks, rollback
- [ ] No sensitive data in commits
