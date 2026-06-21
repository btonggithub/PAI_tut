const objectIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: {
    type: 'string',
    pattern: '^[0-9a-fA-F]{24}$',
  },
};

const paginationQuery = [
  {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 1 },
  },
  {
    name: 'limit',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
  },
  {
    name: 'sort',
    in: 'query',
    schema: { type: 'string' },
  },
];

const success = (description, dataRef) => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: dataRef,
            },
          },
        ],
      },
    },
  },
});

const error = (description) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
});

const bearer = [{ bearerAuth: [] }];

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PAI Tut REST API',
    version: '1.0.0',
    description: 'OpenAPI contract for the existing PAI Tut REST API. Runtime behavior and response envelopes remain the source of truth.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health and system readiness endpoints' },
    { name: 'Auth', description: 'Registration, login, token refresh, logout, and authenticated identity endpoints' },
    { name: 'Users', description: 'Authenticated user profile and user read endpoints' },
    { name: 'Files', description: 'Authenticated file upload and metadata read endpoints' },
    { name: 'Email', description: 'Email verification workflows' },
    { name: 'Admin', description: 'Admin-only user, file, and system read endpoints' },
    { name: 'Audit', description: 'Admin-only audit log read endpoints' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Get API health status',
        responses: {
          200: success('Health status', { $ref: '#/components/schemas/HealthStatus' }),
        },
      },
    },
    '/api/v1/system': {
      get: {
        tags: ['Health'],
        summary: 'Get system information',
        parameters: [
          {
            name: 'include',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: success('System information', { $ref: '#/components/schemas/SystemInfo' }),
          400: error('Validation error'),
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: success('User registered successfully', { $ref: '#/components/schemas/AuthResponseData' }),
          400: error('Validation error'),
          409: error('Email already exists'),
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and issue session tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: success('Login successful', { $ref: '#/components/schemas/AuthResponseData' }),
          400: error('Validation error'),
          401: error('Invalid credentials'),
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: success('Token refreshed successfully', { $ref: '#/components/schemas/RefreshTokenResponseData' }),
          400: error('Validation error'),
          401: error('Invalid refresh token'),
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke a refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LogoutRequest' },
            },
          },
        },
        responses: {
          200: success('Logout successful', { $ref: '#/components/schemas/LogoutResponseData' }),
          400: error('Validation error'),
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated user from bearer token',
        security: bearer,
        responses: {
          200: success('Authenticated user', { $ref: '#/components/schemas/UserResponseData' }),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: bearer,
        responses: {
          200: success('Current user profile', { $ref: '#/components/schemas/UserResponseData' }),
          401: error('Unauthorized'),
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMeRequest' },
            },
          },
        },
        responses: {
          200: success('Profile updated successfully', { $ref: '#/components/schemas/UserResponseData' }),
          400: error('Validation error'),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List users for callers with user read permission',
        security: bearer,
        parameters: [
          ...paginationQuery,
          { name: 'name', in: 'query', schema: { type: 'string' } },
          { name: 'email', in: 'query', schema: { type: 'string', format: 'email' } },
        ],
        responses: {
          200: success('Users list', { $ref: '#/components/schemas/UserListResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by id for callers with user read permission',
        security: bearer,
        parameters: [objectIdParam],
        responses: {
          200: success('User detail', { $ref: '#/components/schemas/UserResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
          404: error('User not found'),
        },
      },
    },
    '/api/v1/email/send-verification': {
      post: {
        tags: ['Email'],
        summary: 'Send verification email to the authenticated user',
        security: bearer,
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendVerificationRequest' },
            },
          },
        },
        responses: {
          200: success('Verification email sent successfully', { $ref: '#/components/schemas/EmailVerificationResponseData' }),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/email/verify': {
      get: {
        tags: ['Email'],
        summary: 'Verify email with a self-identifying token',
        parameters: [
          {
            name: 'token',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: success('Email verified successfully', { $ref: '#/components/schemas/EmailVerificationResponseData' }),
          400: error('Validation error'),
        },
      },
    },
    '/api/v1/email/resend-verification': {
      post: {
        tags: ['Email'],
        summary: 'Resend verification email to the authenticated user',
        security: bearer,
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResendVerificationRequest' },
            },
          },
        },
        responses: {
          200: success('Verification email resent successfully', { $ref: '#/components/schemas/EmailVerificationResponseData' }),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/files': {
      get: {
        tags: ['Files'],
        summary: 'List files owned by the authenticated user',
        security: bearer,
        parameters: paginationQuery,
        responses: {
          200: success('Files list', { $ref: '#/components/schemas/FileListResponseData' }),
          401: error('Unauthorized'),
        },
      },
      post: {
        tags: ['Files'],
        summary: 'Upload a file for the authenticated user',
        description: 'Current runtime upload endpoint. The multipart field name is `file`.',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/FileUploadRequest' },
            },
          },
        },
        responses: {
          201: success('File uploaded successfully', { $ref: '#/components/schemas/FileResponseData' }),
          400: error('Validation error'),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/files/{id}': {
      get: {
        tags: ['Files'],
        summary: 'Get owned file metadata by id',
        security: bearer,
        parameters: [objectIdParam],
        responses: {
          200: success('File detail', { $ref: '#/components/schemas/FileResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
          404: error('File not found'),
        },
      },
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Admin list users',
        description: 'Requires bearer auth and server-controlled user manage permission.',
        security: bearer,
        parameters: [
          ...paginationQuery,
          { name: 'name', in: 'query', schema: { type: 'string' } },
          { name: 'email', in: 'query', schema: { type: 'string', format: 'email' } },
        ],
        responses: {
          200: success('Admin users list', { $ref: '#/components/schemas/UserListResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
        },
      },
    },
    '/api/v1/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Admin get user by id',
        security: bearer,
        parameters: [objectIdParam],
        responses: {
          200: success('Admin user detail', { $ref: '#/components/schemas/UserResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
          404: error('User not found'),
        },
      },
    },
    '/api/v1/admin/files': {
      get: {
        tags: ['Admin'],
        summary: 'Admin list files',
        security: bearer,
        parameters: [
          ...paginationQuery,
          { name: 'ownerId', in: 'query', schema: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'pending', 'deleted'] } },
          { name: 'mimeType', in: 'query', schema: { type: 'string' } },
          { name: 'extension', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: success('Admin files list', { $ref: '#/components/schemas/FileListResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
        },
      },
    },
    '/api/v1/admin/files/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Admin get file by id',
        security: bearer,
        parameters: [objectIdParam],
        responses: {
          200: success('Admin file detail', { $ref: '#/components/schemas/FileResponseData' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
          404: error('File not found'),
        },
      },
    },
    '/api/v1/admin/audit/logs': {
      get: {
        tags: ['Audit'],
        summary: 'Admin list audit logs',
        security: bearer,
        parameters: [
          ...paginationQuery,
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'result', in: 'query', schema: { type: 'string', enum: ['succeeded', 'failed', 'forbidden'] } },
          { name: 'actorId', in: 'query', schema: { type: 'string' } },
          { name: 'actorRole', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
          { name: 'resourceType', in: 'query', schema: { type: 'string' } },
          { name: 'resourceId', in: 'query', schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: success('Audit logs list', { $ref: '#/components/schemas/AuditLogListResponseData' }),
          400: error('Validation error'),
          401: error('Unauthorized'),
          403: error('Forbidden'),
        },
      },
    },
    '/api/v1/admin/system': {
      get: {
        tags: ['Admin'],
        summary: 'Admin get system information',
        security: bearer,
        parameters: [
          {
            name: 'include',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: success('Admin system information', { $ref: '#/components/schemas/SystemInfo' }),
          401: error('Unauthorized'),
          403: error('Forbidden'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'error'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Request failed' },
          error: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'integer', example: 400 },
              stack: { type: 'string', description: 'Development-only stack trace for unexpected server errors.' },
            },
          },
        },
      },
      ValidationErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'body validation failed: email is required',
              },
            },
          },
        ],
      },
      PaginationMeta: {
        type: 'object',
        required: ['total', 'page', 'limit', 'totalPages', 'hasNextPage', 'hasPrevPage'],
        properties: {
          total: { type: 'integer', minimum: 0 },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          totalPages: { type: 'integer', minimum: 1 },
          hasNextPage: { type: 'boolean' },
          hasPrevPage: { type: 'boolean' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      File: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          ownerId: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'integer', minimum: 0 },
          extension: { type: 'string' },
          storageProvider: { type: 'string' },
          status: { type: 'string', enum: ['active', 'pending', 'deleted'] },
          metadata: { type: 'object', additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          actorId: { type: 'string', nullable: true },
          actorRole: { type: 'string', nullable: true, enum: ['user', 'admin', null] },
          action: { type: 'string' },
          resourceType: { type: 'string', nullable: true },
          resourceId: { type: 'string', nullable: true },
          result: { type: 'string', enum: ['succeeded', 'failed', 'forbidden'] },
          ipAddress: { type: 'string', nullable: true },
          userAgent: { type: 'string', nullable: true },
          metadata: { type: 'object', additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, format: 'password' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, format: 'password' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      LogoutRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      UpdateMeRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
        },
      },
      SendVerificationRequest: {
        type: 'object',
        additionalProperties: false,
      },
      ResendVerificationRequest: {
        type: 'object',
        additionalProperties: false,
      },
      FileUploadRequest: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Multipart file field consumed by uploadFile middleware.',
          },
        },
      },
      SessionTokens: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      AuthResponseData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      RefreshTokenResponseData: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      LogoutResponseData: {
        type: 'object',
        properties: {
          loggedOut: { type: 'boolean' },
        },
      },
      UserResponseData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
        },
      },
      UserListResponseData: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      FileResponseData: {
        type: 'object',
        properties: {
          file: { $ref: '#/components/schemas/File' },
        },
      },
      FileListResponseData: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: { $ref: '#/components/schemas/File' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      AuditLogListResponseData: {
        type: 'object',
        properties: {
          auditLogs: {
            type: 'array',
            items: { $ref: '#/components/schemas/AuditLog' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      EmailVerificationResponseData: {
        type: 'object',
        additionalProperties: true,
      },
      HealthStatus: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
      SystemInfo: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
};

module.exports = openapiSpec;
