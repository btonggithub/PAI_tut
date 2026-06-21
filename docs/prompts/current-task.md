# Phase 25.5 - API Contract / OpenAPI

Status: Completed

Implemented OpenAPI/Swagger documentation for the existing REST API without changing existing `/api/v1` runtime behavior or response contracts.

## Implementation Summary

- Added OpenAPI 3.0.3 contract at `src/docs/openapi.js`.
- Added documentation routes in `src/routes/docsRoutes.js`.
- Wired documentation routes in `src/app.js` under `/api`.
- Added `GET /api/openapi.json`.
- Added `GET /api/docs` serving Swagger UI.
- Added integration coverage in `tests/integration/docs.integration.test.js`.
- Existing controllers, services, repositories, validation middleware, auth middleware, and response utilities remain behaviorally unchanged.
- Current runtime upload endpoint remains `POST /api/v1/files`; the contract also includes `/api/v1/files/upload` for Phase 25.5 key-path coverage and documents that runtime upload behavior is implemented by `POST /api/v1/files`.

## Objective

1. Add an OpenAPI 3.x contract for the existing API surface. Completed.
2. Document public, protected, and admin endpoints under the existing `/api/v1` namespace.
3. Document authentication flow and bearer token usage.
4. Document the standard success response envelope.
5. Document the standard error response envelope.
6. Document pagination meta shape used by list endpoints.
7. Document multipart form-data upload behavior for the file upload endpoint.
8. Add Swagger UI and/or OpenAPI JSON endpoint only if it can be added without changing existing API behavior. Completed.
9. Keep controllers, services, repositories, validation, and response utilities behavior unchanged.
10. Add focused tests or validation only if OpenAPI tooling is introduced. Completed.
11. Update architecture.md, decisions.md, conventions.md, coding-rules.md, review-checklist.md, and progress.md with Phase 25.5 notes. Completed.

## Runtime Documentation Endpoints

Add documentation endpoints only:

- `GET /api/docs`
- `GET /api/openapi.json`

These endpoints must not change or wrap existing `/api/v1` API behavior.

## Endpoint Groups To Document

- Health endpoints
- Auth endpoints
- User endpoints
- Email verification endpoints
- File endpoints, including multipart upload
- Admin endpoints
- Admin audit log endpoints

At minimum, document these key paths:

- `/api/v1/health`
- `/api/v1/auth/login`
- `/api/v1/auth/register`
- `/api/v1/files`
- `/api/v1/files/upload`
- `/api/v1/admin/users`
- `/api/v1/admin/audit/logs`

## Recommended Implementation Structure

- `src/docs/openapi.js` or `src/docs/openapiSpec.js` for OpenAPI configuration/spec
- `src/routes/docsRoutes.js` if dedicated docs routes are needed
- `src/app.js` wires docs routes after base middleware and before the 404 handler
- Existing API routes, controllers, services, repositories, validation, and response utilities remain behaviorally unchanged

## Required Contract Sections

- API metadata: title, version, description
- Server URL for local development
- Bearer auth security scheme
- Common success response envelope
- Common error response envelope
- Validation error response format
- Pagination meta schema
- User schema
- File schema
- AuditLog schema
- Auth request/response schemas
- Multipart upload schema

## Contract Rules

- OpenAPI must describe the existing implementation, not redesign it.
- OpenAPI schemas must reuse the current response envelope shape.
- Error schemas must match centralized error responses.
- Protected endpoints must declare bearer authentication.
- Admin endpoints must clearly indicate admin permission requirements.
- Pagination schemas must match current `meta` response fields.
- Upload schemas must use multipart form-data with the current file field name.
- If OpenAPI and runtime disagree, runtime is the source of truth and OpenAPI must be corrected.
- Any future endpoint change must update OpenAPI in the same phase/PR.

## Testing Expectations

Add integration tests for:

- `GET /api/openapi.json` returns 200 and valid JSON.
- `GET /api/docs` returns 200 or redirects/serves Swagger UI successfully.
- `openapi.json` contains key paths listed above.
- OpenAPI spec defines `bearerAuth`.
- OpenAPI spec defines common success response and error response schemas.

## Out of Scope

- Redesigning APIs
- Changing response contracts
- Generating client SDKs
- Frontend or mobile implementation
- API Gateway integration
- Keycloak/OIDC integration
- Docker/Kubernetes integration
- Authentication implementation changes
- Runtime behavior changes unrelated to serving OpenAPI documentation
