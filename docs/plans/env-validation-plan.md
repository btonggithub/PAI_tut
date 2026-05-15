## Plan: Env Loader With Joi Validation

Add a centralized environment configuration loader that reads .env, validates required keys with Joi, fails fast on startup, and exports a typed config object for app/server usage.

**Steps**
1. Create environment loader file at /Users/sathianpong.nap/Project VS/src/config/env.js.
2. Load process environment using dotenv before validation.
3. Define Joi schema with required keys: PORT, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET.
4. Add safe defaults and constraints where appropriate.
5. Validate with abortEarly false so all missing/invalid keys are returned together.
6. Throw a startup error containing a clear joined message of invalid vars.
7. Export validated config object to be imported by /Users/sathianpong.nap/Project VS/src/app.js and /Users/sathianpong.nap/Project VS/src/server.js.
8. Add template file /Users/sathianpong.nap/Project VS/.env.example including the four required keys.
9. Add a startup verification step that exits non-zero if config validation fails.

**Relevant files**
- /Users/sathianpong.nap/Project VS/src/config/env.js — dotenv load, Joi schema, validation, exported config
- /Users/sathianpong.nap/Project VS/src/server.js — import config and use validated PORT
- /Users/sathianpong.nap/Project VS/.env.example — document required keys and sample values

**Verification**
1. Start app without one required key and confirm startup fails with readable validation errors.
2. Start app with all required keys and confirm app boots successfully.
3. Confirm PORT from validated config is used by server listen call.

**Decisions**
- Included scope: env loading and validation only.
- Excluded scope: DB connection logic and JWT issuance logic.
- Validation strategy: fail fast to prevent undefined runtime behavior.
