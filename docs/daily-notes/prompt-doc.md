
## “Project Context”
## เรียก AI ใน VS Code Chat:


# >>> Prompts 1.
Read all markdown files in /docs first.
Then implement current-task.md.
Follow the existing architecture and coding style.

---

# >>> Prompts 2.
Read all markdown files in /docs first.

Then implement current-task.md.

Follow existing architecture and coding style.
Do not change folder structure.

---

# >>> Prompts 3.
Read project context from:
- docs/project-overview.md
- docs/architecture.md
- docs/decisions.md
- docs/progress.md
- docs/prompts/current-task.md

Ignore:
- docs/changelog/*
- docs/daily-notes/*
- docs/archive/*

Then implement current-task.md.

Follow existing architecture and coding style.
Do not change folder structure.

--- 

# >>> Prompts 4.
Read project context from:
- docs/project-overview.md
- docs/architecture.md
- docs/decisions.md
- docs/conventions.md
- docs/coding-rules.md
- docs/progress.md
- docs/prompts/current-task.md

Ignore:
- docs/changelog/*
- docs/daily-notes/*
- docs/archive/*

Then implement current-task.md.

Follow existing architecture, coding rules, and project conventions.
Do not change folder structure unless explicitly required by current-task.md.

---

# >>> Prompts adjust

Read markdown files docs/daily-notes/prompt-fet-17.5-Refresh-Token-And-Session-Hardening.md.

Then implement.
Follow the existing architecture and coding style.

---

- docs/archive/road-map.md

# >>> Prompts 5
Read project context from:
- docs/project-overview.md
- docs/architecture.md
- docs/decisions.md
- docs/conventions.md
- docs/coding-rules.md
- docs/progress.md
- docs/prompts/current-task.md
- docs/review-checklist.md

Ignore:
- docs/changelog/*
- docs/daily-notes/*
- docs/archive/*

Then implement docs/prompts/current-task.md.

Follow:
- existing architecture
- existing coding rules
- existing repository conventions
- existing testing conventions
- existing response contract

Architecture rules MUST remain enforced:
- Controllers are HTTP-only
- Services contain business logic only
- Repositories own all database access
- Validation exists in middleware only
- No direct Mongoose usage outside repositories
- No business logic inside routes
- No response formatting outside response utility/error middleware

Permission phase constraints:
- Implement static in-code permissions only.
- Do not implement dynamic permissions, role management APIs, database-backed permissions, ABAC, ACL, audit logging, caching, or event-driven authorization.
- Existing authorize(role) middleware may coexist with requirePermission(permission); do not force complete RBAC removal.
- Permission checks must not replace ownership checks.
- Role-to-permission mapping must be server-controlled.
- Do not trust client-provided permissions or JWT permission arrays.

Repository rules:
- Prefer domain-oriented repository methods
- Avoid leaking query logic into services
- Reuse BaseRepository only for shared infrastructure behavior
- Do not turn BaseRepository into business/domain logic

Testing rules:
- Reuse fixtures/helpers when appropriate
- Keep tests isolated
- Preserve standardized response assertions
- Add/update tests required by current-task.md

---