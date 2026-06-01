# Phase 21 - Email Verification Foundation

## Objective

Implement a secure and extensible Email Verification system.

This phase establishes the foundation for email verification while preparing the architecture for future features such as:

* Password Reset
* Email Change Verification
* Magic Login Links
* Notification System

Public APIs introduced in this phase should focus only on email verification.

---

## Task 1 - Verification Token Foundation

### Goal

Introduce verification token lifecycle management.

### Requirements

Create verification token model.

Suggested fields:

* userId
* tokenHash
* type
* expiresAt
* usedAt
* metadata
* createdAt
* updatedAt

### Rules

* Never store raw verification tokens.
* Store only hashed tokens.
* Tokens must be generated server-side.
* Tokens must be cryptographically secure.
* Tokens must be single-use.
* Tokens must support expiration.

### Out of Scope

* Password reset tokens
* Magic login tokens

---

## Task 2 - Verification Repository

### Goal

Introduce repository layer for verification token persistence.

### Requirements

Create repository methods such as:

* createVerificationToken
* findValidVerificationToken
* markTokenUsed
* deleteExpiredTokens

### Rules

* Repository owns all database access.
* No Mongoose usage outside repository layer.
* Business logic must not exist in repository.

---

## Task 3 - Email Provider Abstraction

### Goal

Create email delivery abstraction.

### Requirements

Implement provider-based email architecture.

Target structure:

src/services/email/
├── emailService.js
├── providers/
│   └── consoleEmailProvider.js

EmailService delegates delivery to provider.

### Rules

* Controllers must not send emails.
* VerificationService must not directly implement providers.
* EmailService becomes orchestration layer.
* ConsoleEmailProvider becomes initial provider.

### Initial Behavior

Email content may be written to console/log output instead of sending real emails.

### Out of Scope

* SMTP integration
* SendGrid integration
* SES integration
* Mailgun integration

---

## Task 4 - Verification Service

### Goal

Implement email verification business workflow.

### Requirements

Create service methods such as:

* sendVerificationEmail
* verifyEmail
* resendVerificationEmail

### Behavior

Send Verification:

* Generate token
* Store hashed token
* Send email through EmailService

Verify Email:

* Validate token
* Check expiration
* Check used status
* Mark token as used
* Mark user email as verified

Resend Verification:

* Generate new token
* Invalidate previous active token(s)
* Send new verification email

### Rules

* Business logic belongs in service layer.
* VerificationService must not access Mongoose directly.
* VerificationService must not send emails directly.

---

## Task 5 - User Verification State

### Goal

Track email verification status.

### Requirements

Extend user model.

Suggested fields:

* emailVerified
* emailVerifiedAt

### Rules

* Verification state owned by User model.
* Verification state updated only through service layer.

---

## Task 6 - Verification Endpoints

### Goal

Expose verification workflow APIs.

### Endpoints

POST /api/v1/email/send-verification

POST /api/v1/email/verify

POST /api/v1/email/resend-verification

### Rules

* Controllers remain HTTP-only.
* Validation handled through middleware.
* Standardized response contract required.

---

## Task 7 - Audit Logging Integration

### Goal

Integrate verification workflow into audit infrastructure.

### Audit Events

* email.verification.sent
* email.verification.verified
* email.verification.resend
* email.verification.failed

### Rules

* Reuse existing audit architecture.
* Audit failures must not break business operations.

---

## Task 8 - Validation Layer

### Goal

Introduce request validation.

### Requirements

Create validation schemas for:

* send verification request
* verify request
* resend verification request

### Rules

* Validation exists only in middleware.
* Services assume validated input.

---

## Task 9 - Test Coverage

### Goal

Provide comprehensive automated tests.

### Required Coverage

Verification Token

* token creation
* token expiration
* token reuse prevention

Verification Service

* send verification
* verify success
* verify failure
* verify expired token
* verify used token

Email Provider

* provider invocation
* email payload generation

Integration

* send verification endpoint
* verify endpoint
* resend endpoint

### Rules

* Reuse existing fixtures and helpers.
* Preserve standardized response assertions.
* Keep tests isolated.

---

## Architecture Rules

The following rules remain mandatory:

* Controllers are HTTP-only.
* Services contain business logic only.
* Repositories own database access.
* Validation exists in middleware only.
* No direct Mongoose usage outside repositories.
* No business logic inside routes.
* No response formatting outside response utilities.
* No direct email provider usage outside email provider layer.

---

## Definition of Done

* Verification token model implemented.
* Verification repository implemented.
* Email provider abstraction implemented.
* Console email provider implemented.
* Verification service implemented.
* User verification state implemented.
* Verification endpoints implemented.
* Audit integration implemented.
* Validation schemas implemented.
* Required tests implemented.
* Existing test suite remains passing.
