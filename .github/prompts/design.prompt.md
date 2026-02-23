---
agent: 'Design Architect'
description: 'Generate an implementation-ready DDD design with Mermaid diagrams for human review.'
model: 'Claude Sonnet 4.5'
tools: ['search', 'read', 'fetch']
---

# Design Phase

Generate a complete implementation-ready design for the following feature:

**Feature**: ${input:feature:Describe the feature or ticket to implement}

## Process

1. Search the codebase to understand current state of affected modules
2. Read `docs/implementation-plan.md` for existing invariants
3. Analyze bounded context impact
4. Define transaction boundaries and concurrency strategy
5. Design API changes (REST + Module API)
6. Plan persistence changes (Flyway migrations, JPA entities)
7. Generate Mermaid diagrams:
   - Bounded Context Interaction (graph LR)
   - Entity State Transitions (stateDiagram-v2)
   - Main Flow Sequence (sequenceDiagram)
8. Write testable acceptance criteria
9. Produce file-level implementation plan

## Output

Write the complete design to `.github/handoffs/01-design-to-api-contract.md`.

All sections must be filled — no blank placeholders. Include all three Mermaid diagrams.

## Review

After output, you will see two buttons:
- **[Revise Design]** — provide feedback to refine the design
- **[Approve & Define API Contract]** — proceed to API contract authoring
