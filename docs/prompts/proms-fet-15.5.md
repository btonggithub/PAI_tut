# Prompt update user Mapper Layer

Task: Normalize User API Response Contract

Problem:
Current GET /api/v1/users/me response returns raw MongoDB fields such as:

* _id
* __v

Example current response:

{
"success": true,
"message": "Success",
"data": {
"user": {
"_id": "...",
"name": "...",
"email": "...",
"__v": 0
}
}
}

Required response contract:

{
"success": true,
"message": "Success",
"data": {
"user": {
"id": "6a0a7aa0bce09589df43f148",
"name": "Test User",
"email": "[test@example.com](mailto:test@example.com)",
"role": "user",
"createdAt": "2026-05-18T02:34:08.297Z",
"updatedAt": "2026-05-18T02:34:08.297Z"
}
}
}

Requirements:

1. Do NOT expose:

   * _id
   * __v
   * password
   * any MongoDB internal fields

2. Response shape must be consistent with:

   * GET /api/v1/auth/me
   * Auth service safe-user response contract

3. Prefer implementing a reusable user mapper / safe-user transformation in the service layer.
   Avoid data transformation inside controllers.

4. All user-related endpoints must return the same user DTO shape:

   * getMe
   * getUserById
   * listUsers
   * future user endpoints

5. Controllers must remain HTTP-only.

6. Repositories must remain responsible only for data access.

7. Preserve existing response contract:

   * success
   * message
   * data

Verification:

GET /api/v1/users/me

must return:

{
"success": true,
"message": "Success",
"data": {
"user": {
"id": "...",
"name": "...",
"email": "...",
"role": "user",
"createdAt": "...",
"updatedAt": "..."
}
}
}

Run tests and verify no existing auth or user tests regress.
