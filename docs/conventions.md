# Conventions

## General Rules

- Use CommonJS modules
- Use async/await only
- Use centralized response utility
- Use AppError for operational errors
- Use asyncHandler for async controllers
- Use modular folder organization

---

## Naming Conventions

### Controllers
- <module>Controller.js

Examples:
- authController.js
- userController.js

---

### Services
- <module>Service.js

Examples:
- authService.js
- userService.js

---

### Repositories
- <module>Repository.js

Examples:
- authRepository.js
- userRepository.js

---

### Validation Schemas
- <module>Validation.js

Examples:
- authValidation.js
- userValidation.js

---

### Middleware
- camelCase naming

Examples:
- validateRequest.js
- errorHandler.js
- registerSecurity.js

---

## Repository Conventions

Repositories should expose:
- Domain-oriented methods
- Reusable query behavior
- Database abstraction only

Good:
- findUserByEmail()
- findUsersByRole()
- findActiveUsers()

Avoid:
- Generic business leakage into services
- Service-owned database queries

---

## Testing Conventions

### Unit Tests
- test isolated logic only
- mock external dependencies

### Integration Tests
- validate HTTP contracts
- validate middleware behavior
- validate standardized response shape

### Helpers
- centralize reusable test setup

### Fixtures
- centralize reusable test payloads/data