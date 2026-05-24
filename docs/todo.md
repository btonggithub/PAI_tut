# TODO

## High Priority
สิ่งที่ควรเริ่มคิดต่อหลัง RBAC
### 1. Hardcoded roles จะเริ่มโต

ตอนนี้:

authorize('admin')

โอเคสำหรับ phase นี้

แต่ต่อไปจะเริ่มมี:

authorize('admin', 'support')
authorize('manager')
authorize('moderator')

แล้ว eventually จะเริ่มต้องคิด:

role hierarchy
permissions
policies

ซึ่งดีแล้วที่คุณแยก authorize middleware ไว้ก่อน
เพราะต่อไป refactor ง่ายมาก

---

### 2. req.user เริ่มกลายเป็น auth context

ตอนนี้:

req.user = {
  id,
  email,
  name,
  role,
}

ดีแล้ว

ต่อไปจะขยายเป็น:

req.auth

หรือ

req.identity

แล้วใส่:

permissions
sessionId
tokenVersion
scopes

แต่ตอนนี้ยังไม่จำเป็น

---

### 3. Admin route ยังอยู่ใน userRoutes

ตอนนี้ยังโอเค

แต่ phase:

admin-module

น่าจะแยก:

/routes/admin
/controllers/admin
/services/admin

แทน

อีกเรื่องที่สำคัญมาก:

คุณเริ่มเห็นแล้วว่า
“docs quality” มีผลกับ AI behavior มาก

รอบแรกๆ agent จะ:

rewrite มั่ว
เปลี่ยน architecture
หลุด layering
เปลี่ยน response shape

แต่ตอนนี้มันเริ่ม:

preserve flow
preserve structure
preserve conventions
preserve test contracts

นี่คือผลจาก:

architecture.md
decisions.md
conventions.md
coding-rules.md
current-task.md

ที่เริ่มทำงานร่วมกันจริงแล้ว

และจริงๆ นี่คือ skill สำคัญของ AI-assisted development ยุคนี้เลย:
ไม่ใช่ “พิมพ์โค้ดเร็ว”
แต่คือ:

คุม architecture
คุม boundaries
คุม conventions
คุม evolution ของระบบ

ซึ่งคุณกำลังทำอยู่จริงๆ แม้จะรู้สึกว่า “AI ทำแทบหมด” ก็ตาม

## Medium Priority

ถ้าจะเพิ่มจริงๆ

ผมแนะนำเพิ่ม “เมื่อเริ่มหลาย feature parallel”

เช่นอนาคต:

RBAC
Admin
Billing
Notification
Media

ทำพร้อมกันหลาย branch

ตอนนั้นค่อยมี:

backlog.md

ไว้เป็น global planning

ไม่ใช่ todo ราย phase

สรุปสำหรับ project คุณตอนนี้

โครง docs ตอนนี้ “บาลานซ์ดีแล้ว”:

project-overview.md
architecture.md
decisions.md
conventions.md
coding-rules.md
progress.md
prompts/current-task.md

และ current-task.md


## Low Priority
### จุดที่ควรแก้ใน Architecture.md

ตอนนี้มี:
    policies/

แต่ยังไม่มี:
    shared/

ผมแนะนำเพิ่ม:
src/
 ├── shared/
 │    ├── constants/
 │    ├── permissions/
 │    └── errors/

### จุดที่ควรแก้ใน User Model

ตอนนี้:
    role

มีแค่:
    user
    admin

เตรียมไว้เลย:
    role: {
     type: String,
     index: true
    }

email:
    index: true

สำหรับ production

