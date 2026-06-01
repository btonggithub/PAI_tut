# Phase 20.5 - Storage Abstraction & Upload Hardening

## Objective

Improve the existing File Upload Foundation implementation without changing public API behavior.

This phase focuses on architecture hardening, storage abstraction, reliability, and operational readiness.

No new endpoints should be introduced.

Existing upload functionality must continue to work exactly as before.

---

## Task 1 - Storage Provider Pattern

### Goal

Decouple storage implementation from storage orchestration.

### Requirements

Refactor current storage implementation into provider-based architecture.

Target structure:

src/services/file/storage/
├── storageService.js
├── providers/
│   ├── localStorageProvider.js

StorageService must delegate all filesystem operations to LocalStorageProvider.

FileService must continue communicating only with StorageService.

### Rules

* Controllers must not access filesystem.
* Services other than StorageService must not access filesystem.
* StorageService becomes orchestration layer.
* LocalStorageProvider owns filesystem implementation details.
* No behavior change.

### Out of Scope

* S3
* MinIO
* Azure Blob
* Cloud storage integration

---

## Task 2 - Storage Provider Constants

### Goal

Centralize storage provider definitions.

### Requirements

Create storage provider constants.

Example:

STORAGE_PROVIDERS.LOCAL

Replace hardcoded provider strings across the file module.

### Rules

* No magic strings.
* Use constants throughout model, service, repository, and tests.

### Out of Scope

* Dynamic provider selection
* Runtime provider registration

---

## Task 3 - Upload Configuration Centralization

### Goal

Centralize upload-related configuration.

### Requirements

Create upload configuration module.

Move values such as:

* Maximum file size
* Allowed MIME types
* Upload directory settings

into centralized configuration.

Example:

src/config/upload.js

### Rules

* Middleware must consume configuration.
* No duplicated upload constants.
* Existing behavior must remain unchanged.

### Out of Scope

* Environment-specific upload tuning
* Dynamic configuration management

---

## Task 4 - Upload Compensation Logic

### Goal

Prevent orphaned files.

### Problem

If file storage succeeds but metadata persistence fails, uploaded files may remain on disk without database records.

### Requirements

Implement compensation logic.

Example flow:

Store File
→ Save Metadata
→ Failure
→ Remove Stored File

### Rules

* Database consistency takes priority.
* Failed uploads must not leave orphaned files.
* Cleanup must be tested.

### Test Cases

* Storage succeeds + metadata succeeds
* Storage succeeds + metadata fails
* Cleanup succeeds
* Cleanup failure handling

---

## Task 5 - Audit Logging Integration

### Goal

Integrate file operations into existing audit infrastructure.

### Requirements

Record audit events for:

* file.upload
* file.list
* file.view

Use existing audit architecture.

Follow existing audit conventions.

### Rules

* Do not introduce new audit infrastructure.
* Reuse existing audit services.
* Audit failures must not break file operations.

### Out of Scope

* File delete auditing
* Download auditing
* Event streaming
* External logging systems

---

## Architecture Rules

The following rules remain mandatory:

* Controllers are HTTP-only.
* Services contain business logic only.
* Repositories own database access.
* Validation exists in middleware only.
* No direct Mongoose usage outside repositories.
* No business logic inside routes.
* No filesystem access outside storage provider layer.
* No response formatting outside response utilities.

---

## Definition of Done

* Existing file upload endpoints remain unchanged.
* All tests pass.
* New tests added where appropriate.
* Storage implementation is provider-based.
* Upload configuration is centralized.
* Compensation logic prevents orphaned files.
* Audit logging is integrated.
* Architecture boundaries remain enforced.
