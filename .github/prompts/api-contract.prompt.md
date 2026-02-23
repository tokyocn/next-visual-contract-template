---
agent: 'API Contract Author'
description: 'Generate an OpenAPI 3.0 specification from the design handoff for human review.'
model: 'Claude Sonnet 4.5'
tools: ['search', 'read', 'edit']
---

# API Contract Phase

Generate an OpenAPI 3.0 specification from the approved design.

## Input

Read `.github/handoffs/01-design-to-api-contract.md` for the approved design plan.

## Process

1. Read the design handoff for REST endpoints, DTOs, and error conditions
2. Read existing `docs/api/openapi.yaml` if it exists (additive changes only)
3. Search the codebase for existing controller patterns and DTO naming
4. Generate/update `docs/api/openapi.yaml` with:
   - Paths matching the design's REST endpoints
   - Schemas matching the design's DTOs
   - ProblemDetail error responses
   - Validation constraints matching Jakarta annotations
   - Tags per bounded context
   - Unique operationIds in camelCase
5. Write the contract handoff

## Output

1. Write/update `docs/api/openapi.yaml`
2. Write `.github/handoffs/02-api-contract-to-skeleton.md` with endpoint summary, schemas, and validation rules

## Review

After output, you will see two buttons:
- **[Revise Contract]** — provide feedback to refine the spec
- **[Approve & Generate Skeleton]** — proceed to skeleton generation
