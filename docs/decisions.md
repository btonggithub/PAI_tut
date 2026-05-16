# Decisions

## Environment Validation
Use Joi + dotenv.

Reason:
Prevent runtime config errors.

## Validation Strategy
Fail-fast startup validation.

## Database
MongoDB with Mongoose.

## Module Style
Use CommonJS.

## Error Handling Strategy
Use centralized Express middleware.

Reason:
Consistent API responses and easier debugging.