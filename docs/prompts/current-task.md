# Phase 24.5 - Admin Audit & Activity Views

Prepare admin-only audit/activity read APIs while preserving existing response contracts and keeping audit write behavior unchanged.

## Objective

1. Add admin audit route namespace under `/api/v1/admin/audit/*`.
2. Add admin audit controller/service structure with HTTP-only controllers.
3. Implement admin-protected audit/activity read workflows.
4. Support validated filtering, sorting, and pagination query parameters.
5. Keep repositories as the only DB access boundary.
6. Preserve existing audit write behavior and existing user-facing endpoint contracts.
7. Add integration tests for success, unauthenticated, forbidden, and query-behavior paths.
8. Update architecture.md, decisions.md, conventions.md, coding-rules.md, review-checklist.md, and progress.md with Phase 24.5 notes.

## Out of Scope

- Audit dashboard UI
- External log shipping integrations
- Alerting pipelines
- Domain event ownership/versioning (Phase 25)
- Replacing existing audit write workflows or user-facing endpoint contracts

---


