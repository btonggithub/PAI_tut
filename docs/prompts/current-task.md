# Phase 25.5 - API Contract / OpenAPI

Status: Ready to Start

Prepare OpenAPI/Swagger documentation for the existing REST API without changing runtime behavior or response contracts.

## Objective

1. Add an OpenAPI 3.x contract for the existing API surface.
2. Document public, protected, and admin endpoints under the existing `/api/v1` namespace.
3. Document authentication flow and bearer token usage.
4. Document the standard success response envelope.
5. Document the standard error response envelope.
6. Document pagination meta shape used by list endpoints.
7. Document multipart form-data upload behavior for the file upload endpoint.
8. Add Swagger UI and/or OpenAPI JSON endpoint only if it can be added without changing existing API behavior.
9. Keep controllers, services, repositories, validation, and response utilities behavior unchanged.
10. Add focused tests or validation only if OpenAPI tooling is introduced.
11. Update architecture.md, decisions.md, conventions.md, coding-rules.md, review-checklist.md, and progress.md with Phase 25.5 notes.

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
