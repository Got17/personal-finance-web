<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- START AGENT-STANDARD: CLEAN-CODE -->
## Code Quality, Maintainability & Documentation
- Read `DESIGN.md` before designing, reviewing, or modifying user-interface layouts, styles, components, interactions, or responsive behaviour. Treat it as the source of truth for the product's visual direction and UX guardrails.
- Enforce all 5 SOLID principles: Single Responsibility (SRP) per module, Open/Closed (OCP) via extension points, Liskov Substitution (LSP) for behavioral subtyping, Interface Segregation (ISP) with small role-specific contracts, and Dependency Inversion (DIP) via injected abstractions.
- Apply pragmatic DRY (Don't Repeat Yourself) to consolidate business rules into single sources of truth, while adhering to YAGNI (You Aren't Gonna Need It) and the AHA principle (Avoid Hasty Abstractions). Do NOT write speculative abstractions, dead code, or unused generic parameters.
- Use guard clauses (early exit returns/throws) at the top of functions instead of deeply nested `if-else` blocks to maintain low cyclomatic complexity ($\le 3$ nesting levels).
- Enforce strict file length boundaries: target 200300 lines of code (LOC) per file (Robert C. Martin "Newspaper Metaphor"), enforce a soft cap at 400 LOC (SmartBear/Cisco study: review defect detection drops sharply past 400 LOC), and treat 500 LOC as an absolute hard ceiling. Exclude auto-generated code (lockfiles, OpenAPI/Protobuf artifacts) and large test fixtures.
- Write self-documenting code with domain-aligned naming. Inline comments MUST explain non-obvious business rationale (*why*), never restating *what* readable code already expresses.
- Keep inline docstrings, API contracts, and external specifications (OpenAPI 3.1, Protocol Buffers, GraphQL) 100% synchronized whenever signatures or data models change.
- Always read the API contract from `D:\Coding\projects\personal-finance-hub\api\api\openapi.yaml`.
<!-- END AGENT-STANDARD: CLEAN-CODE -->
