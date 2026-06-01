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
24. Admin Module
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

