# Daily Notes

### เรื่อง “แชตเต็มแล้วจะต่อยังไง”

อันนี้สำคัญมากสำหรับ workflow แบบคุณ 👍

👉 แชตใหม่ = ผม “จำ context เดิมไม่ได้แบบสมบูรณ์”

แต่แก้ได้ด้วย “project handoff file”

## วิธีทำให้คุยต่อได้แบบไม่หลุด context
✔ วิธีที่ดีที่สุด (ใช้จริงใน dev team)

## คุณต้องมี 3 อย่างนี้:

🟡 1. progress.md (คุณมีแล้ว ✔)#
อันนี้คือ:
    source of truth ของสถานะ project

🟡 2. current-task.md (สำคัญที่สุด)
อันนี้คือ:
    “task state machine”
👉 แชตใหม่เปิดมา = อ่านอันนี้ก่อน

🟡 3. “handoff prompt” (ตัวสำคัญมาก)
เวลาคุณเปิดแชตใหม่ ให้ copy นี้:
Read project context from:
- docs/project-overview.md
- docs/architecture.md
- docs/decisions.md
- docs/progress.md
- docs/prompts/current-task.md

Then continue implementation from current-task.md without redoing completed work.

Project is already in progress. Do not reinitialize or recreate existing modules.
Follow existing architecture strictly.

## 🧠 เทคนิคระดับ pro (สำคัญมาก)
👉 ทุกครั้งก่อนเปลี่ยนแชต ให้ commit + update 2 files
progress.md (state)
current-task.md (next action)

🔥 Workflow ที่ “ไม่หลุด context จนจบโปรเจกต์”
1. ทำงาน
2. commit
3. update progress.md
4. update current-task.md
5. ถ้าแชตเต็ม → เปิดใหม่
6. paste handoff prompt

-------------------------

## Workflow
1. แตก feature branch
2. วาง task ใหม่ใน current-task.md
3. ให้ AI agent อ่าน docs/ และ implement phase
4. Review code และตรวจ architecture
5. update docs/progress.md ให้สะท้อน reality
6. commit docs + code
7. merge เข้า main

---

## และหลัง backend stable แล้ว
ค่อยเริ่ม frontend project แยก:

แนะนำ:

Next.js + TypeScript
App Router
Tailwind
Axios/fetch client
Auth token flow
Protected route
API layer
React Query/TanStack Query

ซึ่งตอนนั้น backend ของคุณจะพร้อมเชื่อม frontend จริงได้ทันที ไม่ต้องย้อนมารื้อ architecture ใหม่อีก