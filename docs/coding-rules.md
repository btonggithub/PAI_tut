# Coding Rules

## Authorization Rules

### Controllers
Controllers must NOT contain role checks.

Forbidden:
- if (user.role === 'admin')

Authorization belongs in middleware/service policy layers.

---

### Middleware
Authorization middleware must remain reusable.

Good:
- authorize('admin')
- authorize('admin', 'moderator')
- requirePermission(USER_PERMISSIONS.READ)

Avoid:
- hardcoded route-specific authorization logic

---

### Services
Services may orchestrate authorization decisions,
but should not directly depend on Express request objects.

Forbidden:
- req.user inside services

---

## Repository Rules

Repositories own:
- Mongoose queries
- Filtering
- Pagination
- Sorting
- Projection

Services must NOT:
- import mongoose models directly
- construct raw database queries

---

## Testing Rules

### Integration Tests
Must verify:
- response contract
- middleware behavior
- auth protection
- validation flow

---

### Unit Tests
Must isolate:
- business logic
- utility behavior
- repository mocking

---

## Security Rules

Never trust:
- req.body.role
- client-provided permissions
- frontend authorization claims

Authorization must be server-controlled.

---

## Authorization Rules

Authorization must not be implemented inside controllers.

Bad:
    if (req.user.role !== 'admin') {
    throw new AppError('Forbidden');
    }

Good:
    authorize('admin')
    canManageUsers()

### Policy functions must be pure.

Good:
    const canUpdateUser = (actor, targetUserId) => {
    return actor.role === 'admin' || actor.id === targetUserId;
    };

Avoid:
    const canUpdateUser = async (...) => {
    // database queries
    };

---

## Authentication Rules

Access tokens must:
- Remain short-lived
- Never be persisted in database
- Never contain sensitive information

## Refresh Token Rules

Refresh tokens:
- Must be rotatable
- Must support revocation
- Must be linked to session records
- Must never be stored as plain text
- Must be stored as a hash in session records
- Must be compared using a secure hash comparison flow

Avoid:
    generatePermanentToken()

or:
    expiresIn: '365d'
   
## Session Rules

Session management belongs to:
- sessionService
- sessionRepository

Must not exist inside:
- controllers
- middleware
- routes

Controllers only orchestrate requests.

---

## Permission Rules

Permissions must not be hardcoded inside:
- controllers
- repositories
- route handlers
- services
- policies
Use permission constants.

Good:
hasPermission(actor, USER_PERMISSIONS.READ)
requirePermission(USER_PERMISSIONS.READ)

Bad:
actor.permissions.includes('user.read')

scattered throughout codebase.

### Permission Constants Rules

Permission constants must be centralized.

Good:
    USER_PERMISSIONS.READ
    USER_PERMISSIONS.UPDATE_SELF

Bad:
    'user.read'
    'user.update.self'

Rules:
- Do not duplicate permission strings across modules.
- Do not build permission names dynamically from request input.
- Do not expose internal permission mappings as public API in Phase 18.

### Role-Permission Mapping Rules

Role-to-permission mapping must be server-controlled.

Good:
    ROLE_PERMISSIONS.admin.includes(USER_PERMISSIONS.READ)

Bad:
    req.user.permissions.includes('user.read')

Rules:
- Never trust client-provided permissions.
- Do not read permissions from req.body.
- Do not store permissions in access tokens during Phase 18.
- Keep role mapping deterministic and testable.

### Permission Middleware Rules

Permission middleware must:
- require an authenticated actor
- evaluate permission constants only
- return 403 for authenticated users without permission
- remain reusable across routes

Permission middleware must not:
- access repositories
- create HTTP responses directly outside the middleware pattern
- contain resource ownership logic
- contain route-specific business rules

### Policy Rules

Policies must:
- remain pure functions
- return boolean only
- contain no database access
- contain no HTTP logic
- use permission helpers for capability checks
- keep ownership checks explicit

Good:
    canViewUser(actor, targetUserId)
    canUpdateUser(actor, targetUserId)

Bad:
    res.status(403)

inside policy layer.

---

## Audit Logging Rules

Audit logging must not be implemented inside controllers or routes.

Bad:
    auditLogRepository.create(req.body)

inside a controller or route handler.

Good:
    await auditLogService.record({ action, actor, resource, result, metadata })

inside a service workflow.

### Audit Repository Rules

Audit repositories own:
- Mongoose writes
- audit log query helpers
- audit log persistence details

Services must NOT:
- import audit log Mongoose models directly
- construct raw audit log database queries
- format HTTP responses from audit log results

### Audit Service Rules

Audit services may:
- normalize audit payloads
- filter sensitive metadata
- call audit repositories
- provide reusable record helpers

Audit services must not:
- depend on Express request objects directly
- store passwords, raw tokens, refresh token hashes, or secrets
- expose internal audit mappings as public API during Phase 19

### Audit Metadata Rules

Never audit:
- password values
- raw access tokens
- raw refresh tokens
- refreshTokenHash values
- Authorization headers
- secrets or private keys

Prefer auditing:
- actor id
- actor role
- action name
- resource type
- resource id
- result
- request IP address
- user agent
- compact security-relevant metadata

### Audit Testing Rules

Tests must verify:
- audit model defaults and required fields
- audit repository persistence behavior
- audit service metadata sanitization
- security-sensitive workflows create audit entries where required
- existing response contracts remain unchanged

---

## File Upload Rules

File upload handling must not be implemented directly inside controllers or routes.

Bad:
    await fs.writeFile(req.file.originalname, req.file.buffer)

inside a controller.

Good:
    await fileService.createUserFile({ actor, file, metadata })

inside a controller workflow.

### Upload Middleware Rules

Upload middleware owns:
- multipart parsing
- file size constraints
- file count constraints
- basic file presence handling
- upload-specific transport errors

Upload middleware must not:
- create file metadata records
- assign business ownership
- call repositories directly
- trust request body ownerId
- expose raw storage paths in responses

### File Repository Rules

File repositories own:
- file metadata persistence
- file metadata lookup
- file metadata update helpers
- file listing query helpers

Services must NOT:
- import file Mongoose models directly
- construct raw file metadata queries
- format HTTP responses from file metadata results

### File Service Rules

File services may:
- normalize upload metadata
- assign ownerId from authenticated actor
- call storage services
- call file repositories
- orchestrate user-owned upload workflows
- coordinate audit logging where security-relevant

File services must not:
- depend on raw Express request objects
- trust client-provided ownerId
- trust client-provided storage paths
- expose local filesystem paths as public API
- bypass repository or storage abstractions

### Storage Service Rules

Storage services own:
- storage key generation
- provider/local storage details
- file persistence details
- file removal details where implemented

Storage services must not:
- perform authorization decisions
- format HTTP responses
- access controllers or routes
- trust original file names as storage keys

### Upload Security Rules

Never trust:
- req.body.ownerId
- client-provided file path
- client-provided storage key
- file extension alone
- MIME type without server constraints
- original file name as a safe storage name

Uploaded files must:
- be associated with the authenticated user server-side
- enforce maximum size
- enforce allowed type rules
- use server-generated storage keys or stored names
- avoid returning internal filesystem paths

### File Upload Testing Rules

Tests must verify:
- upload middleware rejects missing files where required
- upload middleware rejects disallowed file types
- upload middleware rejects files over size limit
- file model required fields and defaults
- file repository owns metadata persistence
- file service assigns ownerId from actor
- file service does not trust body ownerId
- existing auth/permission/response behavior remains unchanged

## Email Rules

Controllers must never send emails.

Controllers may only invoke services.

VerificationService must never directly use providers.

Correct:

VerificationService
    ↓
EmailService
    ↓
Provider

Incorrect:

VerificationService
    ↓
SMTP

Verification tokens must be generated using cryptographically secure random values.

Raw verification tokens must never be stored in MongoDB.

---

## Cache Layer Rules

### Cache Service Rules

Cache service owns:
- Cache key generation
- TTL management
- Cache hit/miss logging
- Pattern-based cache invalidation
- Abstraction for future cache providers

Cache service must NOT:
- access repositories directly
- depend on Express request objects
- contain business logic
- format HTTP responses

### Cache Integration Rules

Services may invoke cache service methods.

Good:
        const result = await cacheService.withCache(cacheKey, () => userRepository.findUserById(userId), 3600);

Bad:
    await cacheStore.set(key, value) // inside service

Controllers must NOT:
- access cache layer directly
- manage cache keys
- call cache service

Repositories must NOT:
- be aware of caching
- manage cache invalidation
- contain cache logic

### Cache Key Rules

Cache keys must:
- use consistent naming patterns
- include entity type prefix (user:, users:list, file:, files:list, etc.)
- be built through `cacheService.buildCacheKey(baseKey, params)`
- be deterministic (same inputs = same key)

Good:
    cacheService.buildCacheKey('user:profile', { userId })
    cacheService.buildCacheKey('user:id', { userId })
    cacheService.buildCacheKey('files:list', { ownerId, page, limit })

Bad:
    cache_key_user_123
    user-info-123

### Cache Invalidation Rules

Invalidation must occur:
- on create operations (invalidate list caches)
- on update operations (invalidate item + list caches)
- on delete operations (invalidate item + list caches)

Correct:
    const updated = await repository.update(id, payload);
    cacheService.invalidateUserCache(id);
    return toDTO(updated);

Correct:
    const fileRecord = await fileRepository.createFileMetadata(payload);
    cacheService.invalidateFileCache({ ownerId: actor.id });
    return toSafeFile(fileRecord);

Bad:
    // Updates without invalidation
    const updated = await repository.update(id, payload);
    return toDTO(updated);

### Cache Testing Rules

Tests must verify:
- cache hits return same value as database
- cache misses fetch from database
- cache invalidation removes stale data
- cache TTL expires values correctly
- pattern-based invalidation works correctly
- service layer remains testable without cache
- audit events still run for every cached read when required

Good:
    jest.mock('../../src/services/cache/cacheService', () => ({
      withCache: jest.fn((key, fetcher) => fetcher()),
      buildCacheKey: jest.fn((base, params) => ...),
      invalidateUserCache: jest.fn(),
    }));

### Cache TTL Guidelines

Default TTL values:
- User profiles: 3600s (1 hour)
- User lists: 1800s (30 minutes)
- File metadata by id: 3600s (1 hour)
- File lists: 1800s (30 minutes)
- Frequently accessed data: 3600s
- Infrequently accessed data: 1800s
- Short-lived data: 300s (5 minutes)

Adjust based on:
- Update frequency
- Data staleness tolerance
- Memory constraints

### Cache Provider Abstraction

Current implementation:
- In-memory cache store (utils/cache.js)

Future implementations can provide:
- Redis cache
- Memcached
- node-cache package

To add new provider:
1. Implement same interface as current CacheStore
2. Create new provider module
3. Update cacheService to use new provider
4. No changes required to service layer

### Cache Logging Rules

Cache service must log:
- [CACHE_HIT] key - when value found in cache
- [CACHE_MISS] key - when value not in cache
- [CACHE_INVALIDATE] key - when value removed
- [CACHE_INVALIDATE_ALL] - when all cache cleared

Example output:
    [CACHE_HIT] user:profile:userId="123"
    [CACHE_MISS] files:list:ownerId="u1":page=1
    [CACHE_INVALIDATE] user:id:userId="456"
    [CACHE_INVALIDATE_ALL] All caches cleared