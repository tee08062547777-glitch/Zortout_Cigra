# 🛒 อู๊ดสุดจัด - Zort Stock Manager

ระบบจัดการสต็อกสินค้าจาก Zortout พร้อมอัปเดตอัตโนมัติและ UI แบบเรียลไทม์

## 🚀 ฟีเจอร์

✅ **ระบบ Auth** - เข้าสู่ระบบด้วย Email/Password ผ่าน Supabase  
✅ **Dashboard** - แสดงสินค้าพร้อมส่ง จัดกลุ่มตามหมวดหมู่  
✅ **ค้นหาและกรอง** - ค้นหาสินค้า กรองตามจำนวนสต็อก  
✅ **Scraping Zortout** - ดึงข้อมูลสินค้าจาก Zortout อัตโนมัติ  
✅ **Supabase Sync** - บันทึกสินค้าลงฐานข้อมูล  
✅ **Auto Sync** - ตั้งเวลาการอัปเดตอัตโนมัติ (ทุกกี่นาที)  
✅ **Copy to LINE** - คัดลอกรายการสินค้าไปยัง LINE ได้เลย

## 📋 Requirements

- Node.js 18+
- Supabase account (สำหรับ Database & Auth)
- Zortout account + Cookie

## 🔧 Setup

### 1. Clone และ Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. ตั้งค่า Supabase

#### สร้าง Database Tables

```sql
CREATE TABLE products (
    pid BIGINT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE,
    product_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    variant TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    image_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sync_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_sync_enabled BOOLEAN DEFAULT FALSE,
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_credentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    zort_cookie TEXT NOT NULL,
    zort_mid VARCHAR(50),
    zort_cs VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 3. ตั้งค่า Environment Variables

คัดลอก `.env.example` เป็น `.env.local` และกรอกข้อมูล:

```bash
cp .env.example .env.local
```

**กรอก:**

- `NEXT_PUBLIC_SUPABASE_URL` - จาก Supabase Project Settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - จาก Supabase Project Settings
- `ZORT_COOKIE` - Cookie จาก Browser เมื่อเข้า Zortout (เปิด DevTools → Cookies)

### 4. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราวเซอร์

## 🔑 วิธีหา ZORT_COOKIE

1. เข้า [https://share.zortout.com](https://share.zortout.com)
2. กด F12 → แท็บ **Application** → **Cookies**
3. ค้นหา `sb-auth-token` หรือ `PHPSESSID`
4. คัดลอกค่า **Value** ใส่ใน `.env.local`

## 📱 วิธีใช้

### เข้าสู่ระบบ

- ไปที่ `/login` แล้วใส่ Email/Password
- ยังไม่มีบัญชี? คลิก "สมัครสมาชิก" ที่ `/signup`

### อัปเดตสต็อก

1. กด ปุ่ม "อัปเดตสต็อก" ที่มุมบน
2. ไปเว็บ Zortout → เปลี่ยนเป็น 100 รายการต่อหน้า
3. กด Ctrl+A → Ctrl+C (คัดลอกทั้งหมด)
4. วางในช่องที่ขึ้นมา → กด "บันทึก"

### ตั้งค่าการซิงค์อัตโนมัติ

1. ไปที่ "/settings"
2. เปิด "เปิดใช้งานซิงค์อัตโนมัติ"
3. ตั้งช่วงเวลา (5-1440 นาที)
4. กด "บันทึก"

## 🔄 Auto Sync ทำงานอย่างไร

- ระบบจะตรวจสอบการตั้งค่าของผู้ใช้
- ถ้าเปิด auto sync และเวลาผ่านไปพอแล้ว
- ระบบจะดึงข้อมูลจาก Zortout และบันทึกลง Supabase โดยอัตโนมัติ
- **หมายเหตุ:** ต้องตั้ง Cron Job บนเซิร์ฟเวอร์เพื่อเรียก `/api/cron-sync` เป็นประจำ

### ตั้ง Cron Job บน Vercel

ถ้าใช้ Vercel Cron Jobs (Hobby plan+):

```json
{
  "crons": [
    {
      "path": "/api/cron-sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

เพิ่มใน `vercel.json` (sync ทุก 5 นาที)

## 🛠️ API Endpoints

- `POST /api/sync-stock` - อัปเดตสต็อก (ต้องเป็น authenticated user)
- `GET /api/cron-sync` - Auto sync (สำหรับ cron job)

## 🗂️ โครงสร้าง Project

```
app/
  ├── page.tsx              # Redirect to dashboard
  ├── login/page.tsx        # Login page
  ├── signup/page.tsx       # Sign up page
  ├── dashboard/page.tsx    # Main dashboard
  ├── settings/page.tsx     # Settings & auto sync config
  └── api/
      ├── sync-stock/       # Manual sync endpoint
      └── cron-sync/        # Auto sync endpoint

components/
  ├── LoginForm.tsx         # Login form
  ├── SignUpForm.tsx        # Sign up form
  ├── Sidebar.tsx           # Navigation sidebar
  ├── Header.tsx            # Page header
  ├── FilterBar.tsx         # Search & filter
  ├── Stats.tsx             # Category pills & stats
  ├── ProductGroup.tsx      # Product group list
  ├── RightPanel.tsx        # Selected items preview
  └── SyncModal.tsx         # Upload data modal

lib/
  ├── supabase.ts           # Supabase client
  ├── auth.ts               # Auth functions
  └── scraper.ts            # Zortout scraper
```

## 📊 Database Schema

### `products` table

- `pid` - Product ID (Primary Key)
- `sku` - SKU code
- `product_name` - Product name
- `full_name` - Full product name
- `variant` - Product variant
- `stock` - Stock quantity
- `unit` - Unit (ชิ้น, etc)
- `image_url` - Product image URL
- `updated_at` - Last update time

### `sync_settings` table

- `id` - UUID (Primary Key)
- `user_id` - User ID (FK)
- `auto_sync_enabled` - Auto sync toggle
- `sync_interval_minutes` - Sync interval (minutes)
- `last_sync_at` - Last sync timestamp
- `created_at` / `updated_at` - Timestamps

## 🚨 ข้อควรระวัง

- ⚠️ Cookie เปลี่ยนเป็นประจำ ต้องอัปเดตใน Settings หน้าเว็บ (ไม่ต้อง commit)
- ⚠️ **ตั้งค่า API Credentials ผ่าน Settings หน้าเว็บ** ตัวเลือกแรกนี้แนะนำมากสำหรับการอัปเดต Cookie เมื่อหมดอายุ
- ⚠️ Auto sync ต้องตั้ง Cron Job บนเซิร์ฟเวอร์
- ⚠️ Rate limiting - อย่าให้ sync เร็วเกินไป (recommended 60+ นาที)

## 📝 License

MIT

## 🤝 Support

หากมีปัญหา:

1. ตรวจสอบ `.env.local` ว่าถูกต้อง
2. ตรวจสอบ Supabase connection
3. ดูใน console ว่ามี error อะไร

---

Made with ❤️ for Zortout users
