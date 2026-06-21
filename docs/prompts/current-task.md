# Phase 25 - Domain Events Foundation

Status: Completed

Prepare stable domain event contracts on top of the existing in-process event foundation from Phase 23/23.5.

## Objective

1. Define domain event ownership, naming, versioning, and compatibility rules.
2. Add centralized domain event constants and payload builders.
3. Add a domain event publisher boundary that delegates to the existing event bus.
4. Keep controllers, routes, repositories, and models unaware of domain event publishing.
5. Publish only selected low-risk domain events after successful business state changes.
6. Preserve existing REST response contracts, audit behavior, cache behavior, and technical event behavior.
7. Add focused unit tests for domain event contracts, payload validation, publisher behavior, and compatibility rules.
8. Add integration coverage only for workflows that publish new domain events.
9. Update architecture.md, decisions.md, conventions.md, coding-rules.md, review-checklist.md, and progress.md with Phase 25 notes.

## Initial Domain Event Candidates

- `user.registered.v1`
- `user.email_verified.v1`
- `file.uploaded.v1`

Use only events that can be emitted after successful existing workflows without changing endpoint behavior.

## Scope Rules

- Domain events describe business facts that already happened.
- Domain events must be versioned from the first implementation.
- Domain event payloads must be compact, stable, and free of secrets.
- Domain event constants must be centralized.
- Domain event publishers must reuse the existing in-process event bus.
- Existing technical/internal events may remain while domain events are introduced gradually.

## Out of Scope

- External brokers such as Kafka, RabbitMQ, Redis Streams, SNS/SQS, or SQS
- Event sourcing
- Persistent outbox/inbox tables
- Distributed delivery guarantees
- Notification delivery behavior
- Public event API endpoints
- Replacing audit logging, cache invalidation, or existing technical event handlers
