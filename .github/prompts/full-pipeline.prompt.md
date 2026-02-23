---
agent: 'agent'
description: 'Run the full delivery pipeline: Design -> API Contract -> Skeleton -> TDD -> Verification -> PR with handoffs between each phase.'
model: 'Claude Sonnet 4.5'
tools: ['search', 'read', 'edit', 'execute', 'agent', 'fetch']
---

# Full Delivery Pipeline

Execute the complete feature delivery pipeline for the Library Management System.

## Input

- **Feature**: ${input:feature:Describe the feature or ticket to implement}
- **Constraints**: ${input:constraints:Any constraints or special requirements (optional)}

## Pipeline Phases

### Phase 1: Design

Use the **Design Architect** agent to:
1. Analyze the feature request against the existing codebase
2. Identify impacted bounded contexts (catalog, membership, borrowing, reservation)
3. Define transaction boundaries and concurrency strategy
4. Generate Mermaid diagrams (context interaction, state transitions, sequence)
5. Write the complete design to `.github/handoffs/01-design-to-api-contract.md`

**Pause for human review.** Two options:
- **[Revise Design]** — provide feedback, agent updates the design
- **[Approve & Define API Contract]** — proceed to Phase 2

### Phase 2: API Contract

Use the **API Contract Author** agent to:
1. Read `.github/handoffs/01-design-to-api-contract.md`
2. Generate/update `docs/api/openapi.yaml` with paths, schemas, and error responses
3. Write the contract summary to `.github/handoffs/02-api-contract-to-skeleton.md`

**Pause for human review.** Two options:
- **[Revise Contract]** — provide feedback, agent updates the spec
- **[Approve & Generate Skeleton]** — proceed to Phase 3

### Phase 3: Skeleton (auto-flow)

Use the **Skeleton Generator** agent to:
1. Read `.github/handoffs/02-api-contract-to-skeleton.md` and `docs/api/openapi.yaml`
2. Generate compilable stubs: controllers, DTOs, entities, mappers, migrations
3. Verify compilation: `./gradlew compileJava`
4. Write the skeleton summary to `.github/handoffs/03-skeleton-to-tdd.md`

### Phase 4: Core TDD (auto-flow)

Use the **Core TDD Engineer** agent to:
1. Read `.github/handoffs/03-skeleton-to-tdd.md` for TDD work items
2. Follow Red-Green-Refactor: domain tests → domain impl → service tests → service impl
3. Run `./gradlew test` to verify all pass
4. Write TDD results to `.github/handoffs/04-tdd-to-verification.md`

### Phase 5: Integration Verification

Use the **Integration Verifier** agent to:
1. Read `.github/handoffs/04-tdd-to-verification.md`
2. Verify contract compliance against `docs/api/openapi.yaml`
3. Write and run integration tests
4. Check DDD boundaries
5. Produce GO/NO-GO assessment
6. Write results to `.github/handoffs/05-verification-to-release.md`

**Pause for human review.** Two options:
- **[Fix Issues]** — send back to TDD engineer
- **[GO — Create PR]** — proceed to Phase 6

### Phase 6: Release

Use the **Release Publisher** agent to:
1. Read `.github/handoffs/05-verification-to-release.md`
2. Create feature branch, commit changes, push
3. Create PR with `gh pr create` including API contract link

## Stop Conditions

- Stop if design reveals architectural conflicts — ask for clarification
- Stop if skeleton doesn't compile — fix before proceeding
- Stop if tests fail — fix before proceeding
- Stop if NO-GO in verification handoff — report blockers
