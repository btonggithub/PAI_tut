# Current Task

## Phase

Phase 19 — Audit Logging

## Objective

Introduce an audit logging foundation for security-sensitive backend activity while preserving existing authentication, session, permission, policy, and response behavior.

Audit logs provide a server-controlled record of important actions.
They must not become analytics, reporting, alerting, or event infrastructure in this phase.

Existing API behavior and response contracts must remain unchanged unless explicitly required by this phase.

---

## Requirements

### Audit Module

Create:

src/models/auditLogModel.js
src/repositories/audit/
src/services/audit/

Recommended files:

- src/models/auditLogModel.js
- src/repositories/audit/auditLogRepository.js
- src/services/audit/auditLogService.js

Optional files if they improve clarity without over-engineering:

- src/services/audit/auditActions.js
- src/services/audit/auditResults.js

Rules:

- Follow existing model/repository/service patterns.
- Repositories own all audit log database access.
- Controllers and routes must not write audit logs directly.
- Do not introduce audit routes or public audit APIs during this phase.

### Audit Log Model

Define an audit log model for security-sensitive actions.

Recommended fields:

- actorId
- actorRole
- action
- resourceType
- resourceId
- result
- ipAddress
- userAgent
- metadata
- createdAt

Rules:

- actorId may be absent for unauthenticated events such as failed login.
- action must be required.
- result must be required.
- metadata must default to an empty object.
- createdAt must be available for audit ordering.
- Do not store passwords, raw tokens, refresh token hashes, Authorization headers, or secrets.

### Audit Actions

Use stable action names.

Recommended initial actions:

- auth.login
- auth.refresh
- auth.logout
- user.profile.update
- user.read.admin

Rules:

- Action names must be centralized where practical.
- Action names must stay separate from result values.
- Do not build action names dynamically from request input.
- Keep names lowercase and dot-separated.

### Audit Results

Use predictable result values.

Recommended results:

- succeeded
- failed
- forbidden

Rules:

- Result values should be centralized where practical.
- Use metadata for additional details instead of creating arbitrary result strings.

### Audit Repository

Implement a repository for audit log persistence.

Recommended API:

recordAuditLog(payload)

Responsibilities:

- Create audit log records.
- Own Mongoose model usage.
- Keep persistence details out of services.

Rules:

- No HTTP logic.
- No response formatting.
- No controller responsibilities.
- No business workflow orchestration.

### Audit Service

Implement a reusable audit service.

Recommended API:

recordAuditEvent(payload)

Responsibilities:

- Normalize audit payloads.
- Sanitize metadata.
- Call audit repository.
- Provide a reusable audit entry point for domain services.

Rules:

- Do not depend on raw Express request objects.
- Do not store secrets or token values.
- Keep the service reusable across auth, user, and future admin workflows.
- Preserve existing API response contracts.

### Integration Targets

Add audit logging to selected security-sensitive workflows where practical.

Initial targets:

- Successful login
- Failed login
- Successful refresh token rotation
- Failed refresh token attempt where practical
- Successful logout/session revocation
- Successful profile update
- Admin user listing or admin user read where practical

Rules:

- Keep integration minimal and focused.
- Do not rewrite existing auth/session/user flows.
- Do not add event infrastructure.
- Do not let audit logging expose sensitive request data.
- Existing success/error response shape must remain unchanged.

### Request Metadata

When available, capture request metadata without coupling services to Express.

Allowed metadata:

- ipAddress
- userAgent

Recommended approach:

- Controllers may pass sanitized request context into services when needed.
- Services pass normalized audit context into auditLogService.
- AuditLogService persists only safe fields.

Rules:

- Services must not receive raw req objects.
- Do not store Authorization headers.
- Do not store request bodies wholesale.

---

## Testing

Add or update tests for:

### Audit Log Model

- Required fields are enforced.
- Metadata defaults to an empty object.
- Timestamps are available.
- Sensitive fields are not part of the schema.

### Audit Repository

- recordAuditLog creates audit entries.
- Repository owns model interaction.
- Repository tests isolate persistence behavior.

### Audit Service

- recordAuditEvent calls the repository with normalized payload.
- Missing optional actor fields are handled.
- Sensitive metadata is removed.
- Raw tokens, passwords, refresh token hashes, and Authorization headers are not persisted.

### Workflow Integration

- Successful login records an audit event.
- Failed login records an audit event where practical.
- Refresh/logout/profile update audit events are covered where implementation touches those workflows.
- Existing response contracts remain unchanged.

### Regression

- Existing authentication/session tests continue passing.
- Existing permission tests continue passing.
- Full test suite passes.

---

## Success Criteria

1. Audit log model implemented
2. Audit log repository implemented
3. Audit log service implemented
4. Audit action/result names centralized where practical
5. Sensitive metadata sanitization implemented
6. Security-sensitive workflows create audit entries where practical
7. Existing authentication/session/permission behavior preserved
8. Tests added or updated
9. Full test suite passes

---

## Non Goals

Do NOT implement:

- audit log UI
- audit log search API
- audit export/reporting
- analytics dashboards
- alerting
- event-driven audit logging
- message queues
- external log shipping
- SIEM integration
- audit log retention policies
- audit log permission management
- dynamic audit configuration

Rules:

- Prefer the simplest implementation that satisfies current requirements.
- Avoid speculative abstractions for external audit systems.
- Do not introduce infrastructure that is not actively required by Phase 19.
- Maintain readability and maintainability over extensibility.
- Use direct service orchestration only.

---

## Audit Model

Audit logging records what happened.

Authorization still determines whether an action may happen.

Authentication still determines who the actor is.

Audit logs must not change business behavior or API response contracts.

Flow:

Business action
↓
Audit event payload
↓
Audit service sanitization
↓
Audit repository persistence
↓
Audit log record
