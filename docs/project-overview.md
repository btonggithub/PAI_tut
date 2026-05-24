# Project Overview

## Project Goal

Build a scalable Node.js REST API backend using Express.js with clean architecture principles, standardized error handling, modular domain organization, reusable data-access patterns, and production-ready authentication/authorization flows.

The project focuses on:
- Clean backend architecture
- Scalable module organization
- Standardized API patterns
- Separation of concerns
- Maintainable Express.js structure
- Incremental architecture evolution
- Long-term scalability

---

## Current Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- JWT
- bcrypt
- Jest
- Supertest
- Helmet
- CORS
- Nodemon

---

## Current Architecture Status

The project currently implements:

### Infrastructure
- Environment configuration validation
- MongoDB connection management

### Application Foundation
- Express application bootstrap
- Modular route registration
- API versioning support

### Error Handling
- Centralized error handling
- AppError operational error pattern
- Standardized error response contract

### Security Foundation
- Helmet integration
- CORS integration
- Request size limiting
- JWT authentication middleware

### Data Access Layer
- Repository pattern
- BaseRepository abstraction
- Pagination utilities
- Query filtering utilities

### Testing Foundation
- Jest test infrastructure
- Supertest integration testing
- Unit testing conventions

### User Management
- User module foundation
- User profile management
- Pagination-ready user listing
- User profile update workflow
- Safe user DTO mapping

### Authorization Foundation
- Role-Based Access Control (RBAC)
- Admin role support
- Authorization middleware
- Route-level authorization enforcement
- Resource ownership enforcement

### Authorization Policy System
- Policy-based authorization foundation
- Centralized permission evaluation
- Role-to-permission mapping
- Permission middleware abstraction
- Resource access policy preparation

### Authentication
- JWT access token authentication
- Protected route middleware
- Authenticated user context
- Refresh token architecture preparation

### Permission Foundation
- Permission-based authorization preparation
- Role-to-permission mapping preparation
- Fine-grained access control preparation

---

## Architectural Principles

- Thin route layer
- HTTP-only controllers
- Service-based business logic
- Repository-owned database access
- Middleware-only validation
- Centralized error handling
- Standardized JSON responses
- Modular domain structure
- Incremental architecture evolution

---

## Current Request Lifecycle

Request
↓
Route
↓
Security Middleware
↓
Authentication Middleware
↓
Validation Middleware
↓
Controller
↓
Service
↓
Repository
↓
Database
↓
Response Utility
↓
JSON Response

---

## Current Development Phase

Phase 17 — Refresh Token & Session Management

Current goals:
- Refresh token lifecycle
- Session persistence
- Token rotation foundation
- Multi-device session preparation

---

## Planned Next Phase

Permission System

Future goals:
- Permission abstraction
- Role-permission mapping
- Fine-grained authorization
- Permission-aware policies

---

## Database Layer

Current database stack:
- MongoDB
- Mongoose

Current architecture includes:
- Repository abstraction
- Shared BaseRepository patterns
- Pagination utilities
- Query utilities
- Reusable filtering/sorting patterns

Current database responsibilities:
- Data persistence
- Query abstraction
- Pagination-ready querying
- Reusable repository patterns

Future direction:
Controller
→ Service
→ Authorization Policy
→ Repository
→ Database