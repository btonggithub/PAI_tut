
# Phase 10 Auth

## 🔜 next improvement (optional)

"centralized config layer (env + db + jwt split)"

หรือไม่ก็ไป phase 09/10 ต่อได้เลยแบบไม่ต้องแก้ env แล้ว

### เหตุผลคือ:
#### env.js ตอนนี้ “ดีพอแล้วสำหรับ phase ปัจจุบัน”
- สิ่งที่ผมแนะนำ (AppError / split config / refactor structure) มันเป็น refactor ระดับ architecture upgrade
- ซึ่งควรอยู่ใน current-task.md ของ phase ถัดไปเท่านั้น ไม่ใช่ดึงเข้ามาปนตอนนี้

---

## ✅ Step 1 — ตรวจ env.js ก่อน
### ⚠️ จุดที่ “ควรปรับ” (สำคัญจริง แต่ไม่เยอะ)

#### ❗ 1. Mixing responsibility (เล็กน้อย)

ตอนนี้ env.js ทำ 3 อย่าง:

load dotenv
validate env
build config object

👉 มัน “โอเค” แต่เริ่ม dense แล้ว

💡 improvement (optional, phase ต่อไป)

แยกเป็น:

config/
  env.loader.js
  env.schema.js
  env.js

แต่ ยังไม่จำเป็นต้องทำตอนนี้

#### ❗ 2. error handling ยังใช้ raw Error
throw new Error(...)
ปัญหา:
ไม่ผ่าน AppError system ที่คุณสร้างไว้แล้ว
error middleware จะ classify ไม่ชัด
better:
const AppError = require('../utils/AppError');

throw new AppError(`Environment validation error: ...`, 500);

#### ❗ 3. nodeEnv duplication
NODE_ENV: value.NODE_ENV || nodeEnv

👉 redundant นิดเดียว เพราะ value.NODE_ENV ผ่าน Joi แล้ว already defaulted

#### ⚠️ Weak points (minor)
error ยังไม่เข้าระบบ AppError
responsibility ยังรวมอยู่ไฟล์เดียว (acceptable)
minor redundancy NODE_ENV handling

---

## ✅ Step 2 — ตรวจ protect middleware
### ⚠️ จุดที่ควรปรับ (เล็ก แต่สำคัญ)

#### ❗ 1. authService ใน middleware = coupling สูงนิดนึง

ตอนนี้:

middleware → authService

✔ ใช้ได้
⚠️ แต่ tighter coupling

##### 💡 better (optional future improvement)

สร้าง:

services/auth/authQueryService.js

หรือ:

repositories/auth → direct lookup only

แต่ตอนนี้ ยังไม่ต้องเปลี่ยน

#### ❗ 2. req.user shape hardcoded
req.user = { id, email, name }

⚠️ ปัญหา:

future roles/permissions จะขยายยาก

##### 💡 better pattern (future-ready)
req.user = {
  id,
  email,
  name,
  role: user.role
};

หรือ even:

req.user = user;

#### ❗ 3. token payload field naming
payload.sub

✔ OK (JWT standard)

⚠️ แต่ต้อง ensure:

authService encode ต้องใช้ sub เหมือนกัน

##### ⚠️ improvements (future, optional)

#### ❗ 1. password security baseline ยัง basic
min(8)

👉 production-ready มักใช้:

min(10)
pattern (uppercase + number + symbol)

แต่ตอนนี้ ยังโอเค

#### ❗ 2. missing confirmPassword (optional design choice)

บาง system ใช้:

password
confirmPassword

แต่ไม่จำเป็น

---

## ✅ Step 3 — Password leakage check
### ⚠️ minor improvement (optional)
❗ toSafeUser ไม่กัน future leakage fields

ตอนนี้ safe แต่ future อาจมี:

role
refreshTokenVersion
internal flags

##### 👉 better pattern:

const toSafeUser = ({ id, name, email, createdAt, updatedAt, role }) => ({
  id,
  name,
  email,
  role,
  createdAt,
  updatedAt,
});

---

## ✅ Step 4 — userModel check
### ⚠️ improvements (important for future)
❗ 1. missing index definition clarity
unique: true

⚠️ แต่ควร explicit index:

userSchema.index({ email: 1 }, { unique: true });

(Mongoose sometimes silently behaves differently in prod vs dev)

### ❗ 2. password field could be protected

better:

select: false

👉 prevents accidental query leakage

### ❗ 3. no role field (future auth limitation)

ควรเตรียม:

role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}

##### ⚠️ missing production hardening (select:false, role, index explicit)

---

## ✅ Step 5 — authController structure
### ⚠️ minor issue
❗ inconsistent response shape in me
return sendSuccess(res, { user });

vs others:

return sendSuccess(res, data);

👉 not wrong, but inconsistent payload shape

---

## authController structure

# Phase 10 auth 👉 Overall: PASS (clean implementation) ##