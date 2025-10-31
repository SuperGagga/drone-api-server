# Assignment #1 : Drone API Server

นี่คือ API Server (Backend) ที่สร้างด้วย Node.js และ Express.js ซึ่งทำหน้าที่เป็น "คนกลาง" (Middleware) ตามโจทย์ Assignment #1

## 🚀 หน้าที่หลัก

Server นี้จะทำหน้าที่รับคำสั่ง (Request) จาก Client (เช่น Assignment #2) จากนั้นจะไปดึงข้อมูลจาก Server ภายนอก 2 แห่ง (Server 1 และ Server 2) มาทำการ "กรอง" (Filter) และ "จัดรูปแบบใหม่" (Format) ก่อนจะส่งกลับไปให้ Client

* **Server 1 (Drone Config):** ใช้สำหรับดึงข้อมูลตั้งต้น (ชื่อ, ประเทศ, สถานะ)
* **Server 2 (Drone Logs):** ใช้สำหรับดึงและสร้างประวัติการบิน (Logs)

## 🛠️ วิธีการ Run (How to Run)

### 1. ติดตั้ง Dependencies
(ครั้งแรกเท่านั้น) ที่ Terminal ของโปรเจกต์, สั่ง:
```bash
npm install
```
### 2. สร้างไฟล์ .env
สร้างไฟล์ .env (มีจุดนำหน้า) ที่ root ของโปรเจกต์ (ที่เดียวกับ index.js) แล้วใส่เนื้อหาตามนี้:

```bash
# Port ที่ Server เราจะรัน
PORT=3000

# Server 1: Drone Config Server
SERVER1_URL=https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec

# Server 2: Drone Log Server
SERVER2_URL=[https://app-tracking.pockethost.io/api/collections/drone_logs/records](https://app-tracking.pockethost.io/api/collections/drone_logs/records)
SERVER2_TOKEN=20250901efx
```

### 3. สั่งรัน Server
ที่ Terminal, สั่ง:
```bash
node index.js
```
Server จะเริ่มทำงานที่ http://localhost:3000

--------------------

## API Endpoints
นี่คือรายการ API ทั้งหมดที่ Server นี้ให้บริการ:

### 1. GET /configs/:droneId
ดึงข้อมูล Config (ข้อมูลตั้งต้น) ของโดรน

ตัวอย่าง: http://localhost:3000/configs/66010296

ผลลัพธ์:
```JSON
{
  "drone_id": 66010296,
  "drone_name": "Primitivo",
  "light": "off",
  "country": "Nigeria",
  "weight": 152
}
```
### 2.GET /status/:droneId
ดึงสถานะ (Condition) ของโดรน

ตัวอย่าง: http://localhost:3000/status/66010296

ผลลัพธ์:
```JSON
{
  "drone_id": 66010296,
  "drone_name": "Primitivo",
  "light": "off",
  "country": "Nigeria",
  "weight": 152
}
```
### 3.GET /logs/:droneId
ดึงประวัติ Log ล่าสุด 12 รายการ (รองรับ Pagination)

ตัวอย่าง (หน้า 1): http://localhost:3000/logs/66010296

ตัวอย่าง (หน้า 2): http://localhost:3000/logs/66010296?page=2

ผลลัพธ์:

```JSON
[
  {
    "drone_id": 66010296,
    "drone_name": "Primitivo",
    "created": "2025-10-31 08:30:00.123Z",
    "country": "Nigeria",
    "celsius": 55
  },
  ...
]
```
### 4.POST /logs
สร้าง Log ใหม่

URL: http://localhost:3000/logs

ข้อมูลที่ส่ง (Body):
```JSON
{
  "drone_id": 66010296,
  "drone_name": "My Custom Name",
  "country": "My Custom Country",
  "celsius": 123
}
```
ผลลัพที่ URL: http://localhost:3000/logs/66010296
```JSON
[
  {
    "drone_id": 66010296,
    "drone_name": "My Custom Name",
    "created": "2025-10-31 08:52:54.005Z",
    "country": "My Custom Country",
    "celsius": 123
  },
  {
    "drone_id": 66010296,
    "drone_name": "Primitivo",
    "created": "2025-10-31 08:34:32.095Z",
    "country": "Nigeria",
    "celsius": 55
  },
```

![ผลลัพธ์การทดสอบ API Endpoint](/assets/api-test.png)