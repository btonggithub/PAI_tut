
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

# >>> Prompts 5
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

Repository rules:
- Prefer domain-oriented repository methods
- Avoid leaking query logic into services
- Reuse BaseRepository only for shared infrastructure behavior
- Do not turn BaseRepository into business/domain logic

Testing rules:
- Reuse fixtures/helpers when appropriate
- Keep tests isolated
- Preserve standardized response assertions

Do not:
- change folder structure unless required
- introduce unnecessary abstractions
- introduce premature optimization
- rewrite unrelated modules
- break existing response contracts

Before modifying files:
- inspect existing implementation first
- preserve current architecture patterns
- avoid conflicting with recently modified files

After implementation:
- run diagnostics/tests when possible
- summarize changes against current-task success criteria

---