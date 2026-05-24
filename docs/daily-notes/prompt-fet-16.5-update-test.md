The Phase 16 authorization policy integration changed the user service contract.

Current service methods now require an `actor` argument for authorization checks:

* updateMe(userId, payload, actor)
* listUsers(query, actor)
* getUserById(userId, actor)

The service implementation is correct and should NOT be reverted.

Problem:
Existing unit tests still call service methods using the old signature (without actor), causing policy checks to fail with 403 Forbidden before business logic executes.

Task:
Update tests/unit/userService.test.js to align with the new service contract.

Requirements:

1. Introduce reusable actor fixtures inside the test file:

```js
const userActor = {
  id: 'u1',
  role: 'user',
};

const adminActor = {
  id: 'admin-id',
  role: 'admin',
};
```

2. Update all existing tests that call:

* updateMe(...)
* listUsers(...)
* getUserById(...)

to pass an appropriate actor.

Examples:

```js
await userService.updateMe('u1', {}, userActor);
```

```js
await userService.getUserById('u1', userActor);
```

```js
await userService.listUsers({}, adminActor);
```

3. Preserve original test intent.

Examples:

"No updatable fields provided"
should still verify:

* statusCode === 400
* message === 'No updatable fields provided'

To reach that logic, use a valid actor:

```js
await userService.updateMe('u1', {}, userActor);
```

4. Preserve "User not found" tests.

Example:

```js
await expect(
  userService.getUserById(
    'missing-id',
    adminActor
  )
).rejects.toMatchObject({
  message: 'User not found',
  statusCode: 404,
});
```

5. Keep authorization tests separate.

If authorization behavior is already tested in userPolicy.test.js, do not rewrite business-logic tests into authorization tests.

6. Add new explicit authorization tests only if missing.

Examples:

* user cannot list users
* user cannot view another user
* user cannot update another user
* admin can perform admin actions

7. Do not modify production source code.
   Only update unit tests.

After changes:

* Run npm test
* Fix any failing expectations caused by actor requirements
* Ensure all suites pass.
