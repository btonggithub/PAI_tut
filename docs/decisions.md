# Architectural Decisions

## CommonJS Standard

Decision:
- Use CommonJS module system across the project

Reason:
- Simpler Node.js compatibility
- Consistent import/export style
- Lower setup complexity

---

## Centralized Error Handling

Decision:
- Use a global error middleware

Reason:
- Consistent API error responses
- Centralized operational error management
- Cleaner controllers and routes

---

## AppError Strategy

Decision:
- Use AppError for operational errors only

Reason:
- Separate operational vs programming errors
- Prevent internal error leakage
- Standardize client-facing error responses

---

## asyncHandler Strategy

Decision:
- Wrap all async controllers using asyncHandler

Reason:
- Eliminate repetitive try/catch blocks
- Automatically forward async errors to middleware
- Keep controllers clean and readable

---

## Thin Route Architecture

Decision:
- Keep routes responsible for routing only

Reason:
- Improve separation of concerns
- Simplify route files
- Improve maintainability

---

## Controller-Based Structure

Decision:
- Move request handling into controllers

Reason:
- Improve application organization
- Prepare for future service layer introduction
- Standardize request/response flow

---

## Multi-Module Controller Structure

Decision:
- Organize controllers by domain/module

Example:
- health/
- system/

Reason:
- Improve scalability
- Improve module isolation
- Support long-term architecture growth

---

## JSON-Only API Responses

Decision:
- Return JSON responses only

Reason:
- Maintain API consistency
- Simplify frontend integration
- Standardize response contracts

---

## Deferred Service Layer

Decision:
- Delay service layer introduction until controller architecture stabilizes

Reason:
- Avoid premature abstraction
- Allow controller patterns to mature first
- Reduce unnecessary complexity during early phases

---

## Deferred Service Layer

Decision:
- Delay service layer introduction until controller architecture stabilizes

Reason:
- Avoid premature abstraction
- Allow controller patterns to mature first
- Reduce unnecessary complexity during early phases

## Deferred Repository Layer

Decision:
- Delay repository/data-access abstraction until service layer phase

Reason:
- Current application complexity is still low
- Avoid unnecessary abstraction early
- Allow controller architecture to stabilize first
- Introduce database abstraction incrementally