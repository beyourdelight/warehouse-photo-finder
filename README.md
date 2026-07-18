# คลังสินค้า — ค้นหากล่องสินค้าจากรหัส 4 ตัวท้าย

เว็บแอปภายในสำหรับพนักงานคลัง อัพรูปกล่องสินค้าพร้อมรหัส 4 หลัก แล้วให้อีกฝั่งค้นรูปจากรหัสได้ทันที เน้นมือถือ เน็ตช้าก็ใช้ได้ ไม่มีฐานข้อมูล ไม่มี user/login (ใช้รหัสผ่านรวม 1 ตัว)

## Stack

- Next.js 16 (App Router) + TypeScript
- เก็บรูปที่ Vercel Blob (`@vercel/blob`) — ไม่มี DB, ค้นด้วย `list({ prefix })`
- ย่อรูปฝั่ง browser ก่อนอัพด้วย `browser-image-compression`
- PWA แบบเบา ๆ (manifest + service worker เปล่า ๆ ไว้ให้ Add to Home Screen ได้ ไม่มี offline caching)

## โครงสร้างข้อมูลใน Blob

```
products/{code}/{uuid}.jpg
```

`code` คือเลข 4 หลัก ซ้ำกันได้หลายรูป ค้นรหัส = `list({ prefix: "products/{code}/" })`

## ตั้งค่า Environment Variables

ตั้งใน **Vercel → Project → Settings → Environment Variables** (ใส่ทั้ง Production และ Preview):

| ตัวแปร | ใครใส่ | คำอธิบาย |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Vercel ใส่ให้อัตโนมัติ | เกิดขึ้นเองตอนสร้าง Blob store (Storage tab → Create → Blob) ไม่ต้องพิมพ์เอง |
| `APP_PASSWORD` | คุณพิมพ์เอง | รหัสผ่านรวมของทั้งเว็บ |
| `AUTH_SECRET` | คุณพิมพ์เอง | สตริงสุ่มยาว ๆ ไว้เซ็น cookie เช่นรันคำสั่ง `openssl rand -hex 32` แล้วก็อปมาใส่ |

รันทดสอบในเครื่อง (local): สร้างไฟล์ `.env.local` ที่ root โปรเจกต์ (ไฟล์นี้ไม่ควร commit) ใส่ 3 ตัวแปรข้างบน — `BLOB_READ_WRITE_TOKEN` ดึงได้จาก Vercel dashboard → Storage → Blob store → `.env.local` tab

## รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. Vercel → New Project → import repo นี้
3. สร้าง Blob store (Storage tab → Create Database → Blob) แล้วเชื่อมกับ project — `BLOB_READ_WRITE_TOKEN` จะถูกเติมให้อัตโนมัติ
4. ใส่ `APP_PASSWORD` กับ `AUTH_SECRET` ใน Environment Variables ตามตารางด้านบน
5. Deploy

## ใช้งาน

- หน้าแรก (`/`) — ใส่รหัส 4 หลัก ค้นรูปทันที ก่อนค้นจะโชว์รูปอัพล่าสุด 20 รูป
- หน้าอัพโหลด (`/upload`) — ใส่รหัส 4 หลัก แล้วถ่ายรูป/เลือกรูป (อัพได้หลายรูปต่อครั้ง) รูปจะถูกย่อในเครื่องก่อนอัพขึ้น Blob โดยตรง
- กดดูรูปใหญ่ในหน้าแรกจะมีปุ่ม "ลบรูปนี้"
- เข้าเว็บครั้งแรกต้องใส่รหัสผ่าน (`APP_PASSWORD`) 1 ครั้ง ระบบจะจำไว้ในเครื่องด้วย cookie ที่เซ็นด้วย `AUTH_SECRET`

## Add to Home Screen (PWA)

เปิดเว็บในมือถือ (Safari/Chrome) → เมนูแชร์ → "Add to Home Screen" จะได้ไอคอนเปิดแบบแอป
