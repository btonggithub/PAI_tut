
# architecture-driven development

## step พื้นฐาน
1. เขียน task
2. AI อ่าน docs
3. AI implement
4. review
5. update progress
6. เปลี่ยน task

## ======================= Start plan  ========================== ##
เร่ิมจากทำ plan.md เดียว

แล้วนำมาแตก
ไปเป็น:
    docs/

### Step 1 — สร้างโครงสร้างก่อน

ใน VS Code Terminal:

mkdir -p docs/prompts
touch docs/project-overview.md
touch docs/architecture.md
touch docs/decisions.md
touch docs/progress.md
touch docs/todo.md
touch docs/prompts/current-task.md

### Step 2 — ย้ายข้อมูลจาก plan.md
แตกลงใน file Step 1

1. project-overview.md
    ไฟล์นี้ = ภาพรวมโปรเจกต์
2. architecture.md
    ไฟล์นี้ = โครงสร้างระบบ
3. decisions.md
    อันนี้สำคัญสุดสำหรับ AI
4. progress.md
    ไฟล์นี้ = memory ของโปรเจกต์
5. todo.md
    อันนี้ = task list
6. current-task.md
    นี่คือ “context สำหรับ AI” สำคัญมาก

### Step 3 — เก็บ plan.md ยังไงดี
docs/plans/
  env-validation-plan.md

เก็บเป็น “history” AI รุ่นใหม่อ่าน history ได้ดีมาก

### Step 4 — Workflow จริงเวลาใช้ AI
ทุกครั้งก่อนถาม AI:
ให้ paste แบบนี้

##### >>>> prompt
Read these first:
- docs/project-overview.md
- docs/architecture.md
- docs/decisions.md
- docs/progress.md
- docs/prompts/current-task.md

Then continue implementation.
##### <<<<

### Step 5 — วิธีทำให้ AI “ไม่ลืม”
ทุกครั้งทำงานเสร็จ:
อัปเดต 2 ไฟล์เท่านั้น
    progress.md
    เช่น 
        ## DONE
        - Integrated env config into server.js
    
    current-task.md
    เปลี่ยน task ใหม่

## Step 6 — แนะนำ structure เพิ่ม (สำคัญมาก)
อนาคตเพิ่ม:

docs/
  api/
  database/
  flows/
  prompts/

เช่น:

docs/api/auth-api.md
docs/database/schema.md
docs/flows/login-flow.md

AI จะฉลาดขึ้นอีกเยอะ

## Step 7 — วิธีใช้กับ Cursor ดีสุด
ถ้าใช้ Cursor
ให้เปิด project ทั้ง folder แล้วสั่ง:

##### >>>> prompt
Read all markdown docs under /docs first.
Then continue implementing current-task.md
##### <<<<

มันจะเหมือนมี “ทีม tech lead” อยู่ใน project เลย


## หลาย startup เริ่มทำแบบนี้แล้ว เพราะ:

AI context หายง่าย
คนในทีมเปลี่ยนง่าย
knowledge กระจาย

Markdown docs = shared brain

## สรุป workflow สั้นๆ
1. วาง architecture ลง docs/
2. AI อ่าน docs ก่อนทำงาน
3. ทำงานเสร็จ update progress
4. เปลี่ยน current-task
5. ทำวนไป

นี่แหละวิธี “คุยกับ AI จนจบ project” แบบจริงจัง


## ======================= “manage project with AI ========================== ##

## STEP 1 — ตรวจว่า structure เรียบร้อยไหม
ตอนนี้ควรเริ่มใกล้แบบนี้:
PAI_tut/
├── docs/
│   ├── architecture.md
│   ├── decisions.md
│   ├── progress.md
│   ├── project-overview.md
│   ├── todo.md
│   └── prompts/
│       └── current-task.md
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── package.json
└── plan.md

## STEP 2 — เติม current-task.md
อันนี้สำคัญที่สุดตอนนี้

## STEP 3 — เริ่มใช้ AI แบบ “Project Context”

ใน VS Code Chat
แทนที่จะพิมพ์: prompt
    create server.js

ให้พิมพ์: prompt
    Read all markdown files in /docs first.

    Then implement current-task.md.

    Follow the existing architecture and coding style.

ประโยคนี้สำคัญมาก
เพราะมันทำให้ AI เข้าใจ:

AI รู้เรื่อง	        จากไฟล์
โปรเจกต์คืออะไร	    project-overview
architecture	  architecture
coding rules	  decisions
ทำถึงไหนแล้ว	    progress
task ปัจจุบัน	     current-task

นี่คือ “memory system” ของ AI

## STEP 4 — หลัง AI generate เสร็จ

อย่าเพิ่ง merge ทันที
ให้ทำ 3 อย่าง:
1. อ่าน code ก่อน
เช็ค:
    structure ดีไหม
    naming ดีไหม
    logic ตรง requirement ไหม
2. update progress.md
เช่น:
    ## DONE
    - Created app.js
    - Created server.js
    - Connected MongoDB before server startup
3. เปลี่ยน current-task.md
เช่น task ต่อไป:
    # Current Task

    ## Task
    Implement JWT authentication module

## STEP 5 — เริ่มคิด “AI-safe architecture”
อันนี้สำคัญมาก
AI จะเก่งมาก ถ้า project:

✅ structure ชัด
✅ file naming ชัด
✅ responsibility แยกชัด
✅ docs ดี

## STEP 6 — อย่าปล่อยให้ AI เดา architecture

นี่คือข้อผิดพลาดใหญ่สุดของหลายคน
แทนที่จะ: prompt
    make auth

ให้เขียน: prompt
    Implement JWT auth module.

    Requirements:
    - access token
    - refresh token
    - middleware verifyAuth
    - centralized error handling

    Use current architecture only.
    Do not change folder structure.

## STEP 7 — เริ่มเก็บ “Engineering Decisions”
นี่คือหัวใจของ long-term AI development
เช่นใน decisions.md: 

    ## Auth Strategy
    Use JWT access + refresh token.

    Reason:
    Stateless authentication.

AI รุ่นไหนมาอ่านก็ “เข้าใจตรงกัน”

## ทุกครั้งก่อนปิดงาน:
อัปเดตแค่:
    progress.md
    current-task.md

## Workflow ที่ผมแนะนำที่สุดสำหรับคุณ
1. วาง task ใน current-task.md
2. ให้ AI อ่าน docs/
3. Generate code
4. Review code
5. Update progress
6. เปลี่ยน task
7. ทำวนไป

## workflow backend จริง ๆ :
1. แตก feature branch
2. ให้ agent implement phase
3. ตรวจ architecture
4. update docs ให้สะท้อน reality
5. commit docs + code
6. merge เข้า main
7. แตก branch phase ใหม่

----------------- 

# Recommended Phase Order

## Phase 15 — Role-Based Access Control (RBAC)

branch:

feature/15-role-based-access-control
ทำก่อนเพราะ:

ตอนนี้คุณมี:

auth
protect middleware
users

แต่ยัง “ไม่มี authorization”

ยังแยกไม่ได้ว่า:

admin
staff
user

ทำให้ phase ถัดไปทั้งหมดจะเริ่มติด

สิ่งที่จะได้
role field
authorize middleware
role-based route protection
permission-ready architecture

---

## Phase 16 — Authorization Policy System

branch:

feature/16-authorization-policy-system
ทำต่อจาก RBAC

เพราะ RBAC อย่างเดียวจะตันเร็ว

จาก:

if (role === 'admin')

จะ evolve เป็น:

policy
ownership
resource-based authorization
permission abstraction

เช่น:

user แก้ profile ตัวเองได้
admin ดูทุก user ได้
moderator ลบ comment ได้

---

## Phase 17 — Refresh Token Session Management

branch:

feature/17-refresh-token-session-management
ทำหลัง authorization

เพราะตอนนี้ auth ยังเป็น:

access token only

ซึ่งยังไม่ production-grade

ต้องมี:

refresh token
session storage
token rotation
revoke/logout

ก่อนระบบจะโตจริง

---

## Phase 18 — Audit Logging

branch:

feature/18-audit-logging
ทำหลัง auth/session/policy

เพราะตอนนี้เริ่มมี:

identity
roles
permissions
sessions

แล้วถึงจะ “audit ได้มีความหมาย”

เช่น:

ใครลบอะไร
role ไหนแก้ user ไหน
token ไหน login

---

## Phase 19 — Admin Module

branch:

feature/19-admin-module
ทำหลัง RBAC + Policy + Audit

เพราะ admin module ต้องพึ่ง:

authorization
permissions
audit logging

ไม่งั้น admin routes จะกลายเป็น:

if (role === 'admin')

กระจายมั่วทั้งระบบ

---

## Phase 20 — File Upload Foundation

branch:

feature/20-file-upload-foundation
ทำหลัง admin/user mature แล้ว

เพราะ upload จริงจะมี:

ownership
permissions
validation
security
audit

เช่น:

ใคร upload
upload ได้ role ไหน
จำกัด mime type
storage strategy

---

## Phase 21 — Email Verification

branch:

feature/21-email-verification
ทำหลัง session/auth mature

เพราะต้องพึ่ง:

token lifecycle
mail workflow
user states
auth policies

เช่น:

verified/unverified
resend verification
verification expiry

---

## Phase 22 — Cache Layer Foundation

branch:

feature/22-cache-layer-foundation
ทำท้ายๆ

เพราะ cache ควร optimize:

stable query patterns
mature services
mature repositories

ไม่ใช่ optimize เร็วเกินไป

สรุปลำดับที่แนะนำ:
15. RBAC
16. Authorization Policy System
17. Refresh Token Session Management
18. Audit Logging
19. Admin Module
20. File Upload Foundation
21. Email Verification
22. Cache Layer Foundation