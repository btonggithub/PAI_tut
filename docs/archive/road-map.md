# RoadMap

## RoadMap Backend

01. infrastructure
02. bootstrap
03. error system
04. controllers
05. controller v2
06. stabilization
06.5. polish
07. service layer
08. validation layer
09. repository layer
10. auth foundation
11. scalable data architecture
12. production hardening
13. testing-foundation
14. User-Management-Module
15. role-based-access-control (RBAC)
16. Authorization Policy System
17. Refresh Token & Session Management
18. Permission System
19. Audit Logging
20. File Upload Foundation
20.5 Storage Abstraction & Upload Hardening
21. Email Verification
    Goals:

    * Email verification workflow
    * Verification token management
    * Verification email delivery abstraction
    * User email verification state
    * Verification endpoint foundation

    Out of Scope:

    * Password reset
    * Magic login links
    * Email change verification
    * Notification center
    * Email templates management UI

22. Cache Layer Foundation
23. Event Foundation
23.5 Event Integration Hardening
24. Admin Module
24.5 Admin Audit & Activity Views
25. Domain Events Foundation
26. Notification Module
27. Microservice Extraction Preparation
    service contracts
    event contracts
    domain ownership
    bounded contexts 
30+ Mongo Transaction

## Phase 21 Completed: Email Verification

- Email verification fully implemented.
- User records now include verified status.
- REST API endpoints enforce verification where required.

## Phase 22 : Cache Layer Foundation

- Introduce caching for frequently accessed resources (e.g., user profiles, file metadata).
- Decide on cache technology (Redis/Memcached or in-memory cache).
- Define TTL policies and invalidation strategies.
- Update REST API endpoints to check cache before database queries.
- Ensure cache consistency with write operations (create/update/delete).
- Add monitoring/logging for cache hit/miss rates.
- Update architecture diagrams and documentation to reflect cache layer.

## Phase 23. Event Foundation
สร้าง infrastructure event แบบเบา ๆ ก่อน เช่น in-process event bus, publish/subscribe API, event naming convention, payload shape, handler failure policy
เป้าหมายคือ “มีราง event” แต่ยังไม่ผูก business หนัก ๆ

- Introduce lightweight in-process event bus.
- Define publish/subscribe API.
- Define event naming and payload conventions.
- Define handler error behavior.
- Keep controllers, routes, repositories, and models event-unaware.
- Add unit tests for publish/subscribe, multiple handlers, no handlers, and handler failures.

Technical Rules (must define in this phase):

- Delivery semantics: in-process only, at-most-once, no persistence, best-effort delivery.
- Dispatch mode: sync by default inside service flow; async mode is optional and must be explicit.
- Ordering: preserve handler execution order by registration order for the same event.
- Timeout and isolation: each handler must be isolated; one handler failure must not crash the process.
- Failure policy: log structured error, increment failure metric, and continue remaining handlers (no retry in Phase 23).
- Registration safety: prevent duplicate handler registration on startup/test re-run.
- Event naming in this phase must stay technical/integration-focused (not business/domain contract yet).

Definition of Done:

- Event bus API documented with example publish/subscribe usage.
- Unit tests pass for normal flow, multiple handlers, no handlers, and handler failure continuation.
- Structured logs exist for publish/handled/failed events with correlation id support.
- Basic metrics exist: published count, handled count, failed count.
- No changes to public REST response contract.

Out of Scope:
- Distributed brokers
- Event sourcing
- Domain events
- Notifications
- Public event APIs

## Phase 23.5 Event Integration Hardening
เอา event bus ที่สร้างใน Phase 23 ไปลองใช้จริงกับ workflow เล็ก ๆ 1-2 จุด เช่น file.upload.persisted.internal หรือ user.profile.updated.internal แบบ low-risk
เป้าหมายคือพิสูจน์ว่า event ใช้ได้จริงโดยไม่ทำ response contract, audit, cache, email/file workflow เดิมพัง

- Wire event bus into 1-2 low-risk service workflows.
- Verify existing response contracts remain unchanged.
- Verify audit/cache/email/file behavior does not regress.
- Add integration tests for event-connected workflows.
- Document event handler registration and failure behavior.

Integration Scope Guardrails:

- Integrate only 1-2 low-risk workflows at service layer (controllers remain event-unaware).
- Use technical integration event names in this phase (example: file.postPersisted, user.profileUpdated.internal).
- Do not introduce domain ownership/versioning rules until Phase 25.

Acceptance Criteria:

- Existing endpoint status codes and response payloads remain unchanged.
- Existing audit/cache/email/file behavior remains compatible (no functional regression).
- Integration tests cover success path and handler failure path for selected workflows.
- Event connection can be disabled with feature flag or config toggle for safe rollback.
- Documentation includes handler registration location and failure behavior.

Out of Scope:
- Replacing existing audit logging
- Replacing cache invalidation
- Notification delivery
- Cross-process event delivery

## Phase 24. Admin Module
สร้าง admin APIs เช่น manage users, view files metadata, system/admin endpoints, permission-protected admin routes
อันนี้เหมาะมาหลัง event foundation เพราะ admin module อาจเริ่มต้องดู activity/system state มากขึ้น

- Add admin-only API foundation.
- Add admin route/controller/service structure.
- Add admin permission checks.
- Add user/file/system admin read workflows where appropriate.
- Preserve existing user-facing API contracts.

Out of Scope:
- Admin UI
- Audit analytics
- Notification management

## Phase 24.5 : Admin Audit & Activity Views
แยกออกมาดีแล้วครับ เพราะถ้ารวมกับ Admin Module จะบวมมาก
Phase นี้ควรเน้น audit/activity read APIs, filtering, pagination, admin-only access, ไม่ใช่สร้าง UI

- Add admin-only audit/activity read APIs.
- Add filtering, sorting, and pagination.
- Protect all endpoints with admin permissions.
- Keep audit writes unchanged.

Out of Scope:
- Audit dashboard UI
- External log shipping
- Alerting
- Analytics pipelines

## Phase 25. Domain Events Foundation
ยกระดับจาก “event bus technical foundation” เป็น “business event contract” เช่น:

- user.registered
- user.emailVerified
- file.uploaded
- admin.userRoleChanged

ตรงนี้ควรกำหนด owner ของ event, payload contract, versioning, naming, compatibility

## Phase 26. Notification Module
ใช้ domain events เพื่อ trigger notification เช่น verification follow-up, admin alerts, future in-app notification
ดีที่อยู่หลัง Domain Events เพราะ notification ควร consume event ไม่ใช่ hardcode workflow กระจัดกระจาย

## Phase 27. Microservice Extraction Preparation
เตรียม bounded contexts, service contracts, event contracts, module ownership, dependency boundaries
ควรอยู่หลัง domain events และ notification เพราะถึงตอนนั้นจะเห็น dependency จริงมากขึ้น

## Phase 30+ Mongo Transaction
ดีที่ยังอยู่ไกล ๆ ครับ เพราะ transaction ควรมาเมื่อมี use case ที่ต้อง atomic จริง เช่น update หลาย collection ที่ห้าม partial success ไม่ควรรีบใส่ก่อนเห็นปัญหา
