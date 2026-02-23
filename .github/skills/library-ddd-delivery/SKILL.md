---
name: 'library-ddd-delivery'
description: 'End-to-end feature delivery skill for the Library Management System. Orchestrates design, API contract authoring, skeleton generation, TDD implementation, integration verification, and PR publishing with DDD boundary enforcement, handoff documents, and quality gates. Use when executing feature work through the full delivery pipeline.'
---

# Library DDD Delivery Skill

This skill orchestrates the complete feature delivery pipeline for the Library Management System, a Spring Boot 3.4.x modular monolith with DDD bounded contexts.

## Pipeline Overview

```
Feature Request
      |
      v
[1. Design Architect] ──01──> [2. API Contract Author] ──02──> [3. Skeleton Generator]
      |                              |                                    |
      +-- DDD Boundary Checker       +-- API Contract Reviewer            03
      |                              |                                    |
   [HUMAN REVIEW]               [HUMAN REVIEW]                           v
                                                           [4. Core TDD Engineer] ──04──> [5. Integration Verifier]
                                                                 |                              |
                                                                 +-- DDD Boundary Checker       +-- API Contract Reviewer
                                                                                                |
                                                                                           [HUMAN REVIEW]
                                                                                                |
                                                                                                v
                                                                                      [6. Release Publisher] → PR
```

**Human review gates**: Phase 1 (design), Phase 2 (API contract), Phase 5 (GO/NO-GO)
**Auto-flow phases**: Phase 3 (skeleton) and Phase 4 (TDD) — mechanically derived / self-validating

## Agents

| Agent | Phase | Purpose |
|-------|-------|---------|
| Design Architect | 1. Design | Convert feature request into DDD design with Mermaid diagrams |
| API Contract Author | 2. API Contract | Generate OpenAPI 3.0 YAML from design |
| Skeleton Generator | 3. Skeleton | Generate compilable stubs with zero business logic |
| Core TDD Engineer | 4. Core TDD | Red-Green-Refactor: failing tests first, then implement |
| Integration Verifier | 5. Verification | Contract compliance + integration tests + GO/NO-GO |
| Release Publisher | 6. Release | Create PR with test evidence and API contract link |

## Subagents

| Subagent | Used By | Purpose |
|----------|---------|---------|
| DDD Boundary Checker | Design Architect, Core TDD Engineer | Validate cross-context compliance |
| API Contract Reviewer | API Contract Author, Integration Verifier | Review OpenAPI spec and implementation compliance |

## Slash Commands

| Command | Agent | Description |
|---------|-------|-------------|
| `/design` | Design Architect | Design phase |
| `/api-contract` | API Contract Author | API contract phase |
| `/skeleton` | Skeleton Generator | Skeleton generation phase |
| `/tdd` | Core TDD Engineer | Core TDD phase |
| `/verify` | Integration Verifier | Integration verification phase |
| `/release` | Release Publisher | PR publishing phase |
| `/full-pipeline` | Orchestrator | All phases sequentially |

## Handoff Documents

Intermediate state is captured in `.github/handoffs/`:
- `01-design-to-api-contract.md` — Design output → API Contract Author
- `02-api-contract-to-skeleton.md` — Contract summary → Skeleton Generator
- `03-skeleton-to-tdd.md` — Skeleton summary → Core TDD Engineer
- `04-tdd-to-verification.md` — TDD results → Integration Verifier
- `05-verification-to-release.md` — Verification results and GO/NO-GO → Release Publisher

## API Source of Truth

`docs/api/openapi.yaml` — The OpenAPI 3.0 specification is the single source of truth for the REST API contract. It is generated in Phase 2, consumed by Phases 3-5, and linked in the PR.

## Quality Gates

| Phase | Gate |
|-------|------|
| 1. Design | Explicit invariants, acceptance criteria, Mermaid diagrams |
| 2. API Contract | Valid OpenAPI 3.0, ProblemDetail errors, validation mapping |
| 3. Skeleton | Compilation succeeds (`./gradlew compileJava`) |
| 4. Core TDD | All tests pass (`./gradlew test`), RED before GREEN |
| 5. Verification | Contract compliance, integration tests pass, DDD boundaries intact |
| 6. Release | PR includes test evidence, API contract link, risk notes |

## Project References

- [Architecture Reference](references/architecture.md)
- [Phase Checklists](references/checklists.md)
