# RoadMap

## RoadMap Backend

01. infrastructure
02. bootstrap
03. error system
04. controllers
05. controller v2
06. stabilization
06.5. polish
07. service layer
08. validation layer
09. repository layer
10. auth foundation
11. scalable data architecture
12. production hardening
13. testing-foundation
14. User-Management-Module
15. role-based-access-control (RBAC)
17. Refresh Token & Session Management
18. Permission System
19. Audit Logging
20. Admin Module
21. File Upload Foundation
22. Email Verification
23. Cache Layer Foundation
24. Event Foundation
25. Domain Events Foundation
26. Notification Module
27. Microservice Extraction Preparation
    service contracts
    event contracts
    domain ownership
    bounded contexts

# แต่ละ phase คืออะไร

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

## Phase 18 — Permission System

branch:
feature/18-Permission-System

---

## Phase 19 — Audit Logging

branch:

feature/19-audit-logging
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

## Phase 20 — Admin Module

branch:

feature/20-admin-module
ทำหลัง RBAC + Policy + Audit

เพราะ admin module ต้องพึ่ง:

authorization
permissions
audit logging

ไม่งั้น admin routes จะกลายเป็น:

if (role === 'admin')

กระจายมั่วทั้งระบบ

---

## Phase 21 — File Upload Foundation

branch:

feature/21-file-upload-foundation
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

## Phase 22 — Email Verification

branch:

feature/22-email-verification
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

## Phase 23 — Cache Layer Foundation

branch:

feature/23-cache-layer-foundation
ทำท้ายๆ

เพราะ cache ควร optimize:

stable query patterns
mature services
mature repositories

ไม่ใช่ optimize เร็วเกินไป
--- 

## Next phase 

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