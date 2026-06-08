# Phase 23 - Event Foundation

Prepare an in-process event foundation that lets services publish application events without introducing distributed messaging or replacing existing service workflows.

## Objective

1. Implement a lightweight in-process event bus module.
2. Define stable event naming and payload conventions.
3. Provide publisher and subscriber APIs with clear error handling.
4. Keep controllers, routes, repositories, and models unaware of event infrastructure.
5. Add event handler registration through the service/application layer only.
6. Integrate with one or two low-risk workflows only when useful for proving the foundation.
7. Preserve existing audit, cache, email, file, auth, and user response contracts.
8. Write unit tests for publish/subscribe, multiple handlers, no-handler behavior, and handler failure behavior.
9. Add focused integration tests only if a workflow is connected to the event bus.
10. Update architecture.md, decisions.md, conventions.md, coding-rules.md, review-checklist.md, and progress.md with Phase 23 notes.

## Out of Scope

- Kafka, RabbitMQ, Redis Streams, SNS/SQS, or external queues.
- Event sourcing.
- Distributed or cross-process events.
- Domain Events Foundation from Phase 25.
- Notification Module from Phase 26.
- Replacing existing audit logging, cache invalidation, email verification, or file workflows unless explicitly required by this phase.
- Adding public event APIs or admin event-management screens.

---


