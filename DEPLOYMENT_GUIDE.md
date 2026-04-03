# 🚀 Hướng dẫn Deploy E-Commerce Project

## Tổng quan kiến trúc

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vercel        │────▶│   Render         │────▶│   Railway        │
│   (Frontend)    │     │   (Backend API)  │     │   (MySQL DB)     │
│   *.vercel.app  │     │   *.onrender.com │     │   *.railway.app  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Phần 1: Deploy Database lên Railway

### Bước 1: Tạo tài khoản Railway

1. Truy cập https://railway.app/
2. Nhấn **"Login"** → Đăng nhập bằng GitHub
3. Railway cho free tier: **$5 credit/tháng** (đủ dùng)

### Bước 2: Tạo MySQL Database

1. Nhấn **"New Project"** → **"Create from Scratch"**
2. Đặt tên project: `ecommerce-database`
3. Nhấn **"+ New"** → **"Database"** → **"Add MySQL"**
4. Railway sẽ tạo MySQL instance tự động

### Bước 3: Lấy thông tin kết nối

1. Click vào MySQL service vừa tạo
2. Chọn tab **"Variables"**
3. Copy các thông tin sau:

| Variable | Example Value |
|----------|---------------|
| `MYSQLHOST` | `shuttle.proxy.rlwy.net` |
| `MYSQLPORT` | `12345` |
| `MYSQLUSER` | `root` |
| `MYSQLPASSWORD` | `your_random_password` |
| `MYSQLDATABASE` | `railway` |

### Bước 4: Import database schema

**Cách 1: Qua Railway Dashboard (Recommended)**

1. Vào tab **"MySQL"** → Click **"Connect"** → Copy connection string
2. Mở terminal, cài MySQL CLI nếu chưa có:
   ```bash
   # Windows: tải MySQL Installer từ dev.mysql.com
   # Hoặc dùng MySQL Workbench (GUI)
   ```
3. Kết nối và import:
   ```bash
   mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < ecommerce_db.sql
   ```

**Cách 2: Dùng MySQL Workbench (GUI - dễ nhất)**

1. Tải MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Mở Workbench → **"+"** để tạo connection mới:
   - **Connection Name**: `Railway Ecommerce`
   - **Hostname**: giá trị `MYSQLHOST` từ Railway
   - **Port**: giá trị `MYSQLPORT`
   - **Username**: `root`
   - **Password**: giá trị `MYSQLPASSWORD`
3. Nhấn **"Test Connection"** → Nếu OK thì nhấn **"OK"**
4. Double-click vào connection vừa tạo
5. Mở file `ecommerce_db.sql` trong Workbench: **File → Open SQL Script**
6. Nhấn **⚡ (Lightning bolt)** để chạy toàn bộ script

### Bước 5: Chạy RBAC Migration

1. Trong cùng MySQL Workbench connection
2. Mở file `backend/scripts/rbac-migration.sql`
3. Nhấn **⚡** để chạy
4. Kiểm tra:
   ```sql
   SELECT * FROM Roles;
   SELECT * FROM Permissions;
   SELECT * FROM Users;
   ```

### Bước 6: Cập nhật password users

```sql
-- Tất cả users password = 123456
UPDATE Users SET password_hash = '$2a$10$BD8IsL/XaT71XI.ZpqgwS.e156ovg8p3ox8XPR8tY8cC25q8lqOzK' WHERE 1=1;
```

### Bước 7: Tạo Static IP (Quan trọng!)

Railway thay đổi IP mỗi lần deploy. Backend Render cần IP cố định để connect:

1. Vào MySQL service → Tab **"Settings"**
2. Nhấn **"Generate Domain"** để tạo public hostname
3. Copy hostname (ví dụ: `shuttle.proxy.rlwy.net`)
4. Port sẽ giữ nguyên

> ⚠️ **Lưu ý**: Railway free tier có sleep mode sau 30 phút inactivity. Để tránh disconnect, tạo một cron job ping mỗi 25 phút.

---

## Phần 2: Deploy Backend lên Render

### Bước 1: Chuẩn bị code

**Kiểm tra .gitignore đã có:**

```bash
# Đảm bảo backend/.env KHÔNG bị commit
cat .gitignore
```

**Commit và push code lên GitHub:**

```bash
cd c:\Users\Huynh-Nguyen\Documents\GitHub\ecommerce
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Bước 2: Tạo tài khoản Render

1. Truy cập https://render.com/
2. Nhấn **"Sign Up"** → Đăng nhập bằng GitHub
3. Free tier: **750 giờ/tháng** (đủ cho 1 service chạy 24/7)

### Bước 3: Tạo Web Service

1. Dashboard → **"New"** → **"Web Service"**
2. Connect GitHub repository `ecommerce`
3. Cấu hình:

| Setting | Value |
|---------|-------|
| **Name** | `ecommerce-backend` |
| **Region** | Singapore (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### Bước 4: Cấu hình Environment Variables

Scroll xuống **"Environment"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DB_HOST` | `<MYSQLHOST từ Railway>` |
| `DB_PORT` | `<MYSQLPORT từ Railway>` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `<MYSQLPASSWORD từ Railway>` |
| `DB_NAME` | `<MYSQLDATABASE từ Railway>` |
| `JWT_SECRET` | *(Tạo random 64 ký tự)* |
| `JWT_EXPIRES_IN` | `1d` |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(điền sau khi deploy frontend)* |

**Tạo JWT_SECRET mạnh:**
```bash
# Mở CMD, chạy:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 5: Deploy

1. Nhấn **"Create Web Service"**
2. Render sẽ build và deploy (~2-3 phút)
3. Khi xong, copy **Service URL** (ví dụ: `https://ecommerce-backend.onrender.com`)

### Bước 6: Test Backend

```bash
# Test health check
curl https://ecommerce-backend.onrender.com/

# Test login
curl -X POST https://ecommerce-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'
```

### Bước 7: Chạy RBAC Migration trên Render

Render không chạy migration tự động. Cách chạy:

**Cách 1: Qua Render Shell**

1. Vào service → Tab **"Shell"**
2. Chạy:
   ```bash
   npm run setup:rbac
   ```

**Cách 2: Chạy migration script riêng**

Tạo file `backend/scripts/deploy-migration.js`:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const sql = fs.readFileSync(path.join(__dirname, 'rbac-migration.sql'), 'utf8');
  const cleaned = sql.split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
  const statements = cleaned.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const stmt of statements) {
    if (stmt.trim()) await conn.query(stmt);
  }

  console.log('Migration complete!');
  await conn.end();
}

runMigration().catch(console.error);
```

---

## Phần 3: Deploy Frontend lên Vercel

### Bước 1: Tạo tài khoản Vercel

1. Truy cập https://vercel.com/
2. Nhấn **"Sign Up"** → Đăng nhập bằng GitHub
3. Free tier: **Unlimited deployments** cho personal projects

### Bước 2: Import Project

1. Dashboard → **"Add New"** → **"Project"**
2. Import GitHub repository `ecommerce`
3. Cấu hình:

| Setting | Value |
|---------|-------|
| **Project Name** | `ecommerce-frontend` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Bước 3: Cấu hình Environment Variables

1. Tab **"Settings"** → **"Environment Variables"**
2. Add variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://ecommerce-backend.onrender.com` |

> ⚠️ **Quan trọng**: `VITE_` prefix là bắt buộc để Vite đọc được env variable.

### Bước 4: Deploy

1. Nhấn **"Deploy"**
2. Vercel sẽ build (~30 giây)
3. Khi xong, copy **Production URL** (ví dụ: `https://ecommerce-frontend.vercel.app`)

### Bước 5: Cập nhật Backend CORS

1. Quay lại **Render Dashboard** → Backend service
2. Tab **"Environment"** → Edit `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://ecommerce-frontend.vercel.app
   ```
3. Nhấn **"Save Changes"** → Render sẽ redeploy (~1 phút)

---

## Phần 4: Kiểm tra sau Deploy

### Checklist kiểm tra

| # | Kiểm tra | URL | Expected |
|---|----------|-----|----------|
| 1 | Backend health | `https://<backend>.onrender.com/` | `{"message":"Ecommerce API running"}` |
| 2 | Backend login | `https://<backend>.onrender.com/api/auth/login` | JWT token |
| 3 | Frontend load | `https://<frontend>.vercel.app` | Trang chủ |
| 4 | Frontend login | `https://<frontend>.vercel.app/login` | Login thành công → redirect |
| 5 | Admin dashboard | `https://<frontend>.vercel.app/admin` | Hiển thị stats |
| 6 | API calls từ frontend | Browser DevTools → Network | Không có CORS errors |

### Debug common issues

**❌ CORS Error**
```
Access to fetch at 'https://backend.onrender.com' has been blocked by CORS policy
```
**Fix**: Kiểm tra `FRONTEND_URL` trên Render đúng URL Vercel.

**❌ 500 Internal Server Error**
```
Failed to load resource: the server responded with a status of 500
```
**Fix**: 
- Kiểm tra DB connection: `DB_HOST`, `DB_PORT`, `DB_PASSWORD` đúng
- Check Render logs: Service → **Logs** tab

**❌ 401 Unauthorized**
```
Token không hợp lệ hoặc đã hết hạn
```
**Fix**: 
- `JWT_SECRET` trên Render phải giống nhau (không đổi giữa deploys)
- Clear browser localStorage: `localStorage.clear()`

---

## Phần 5: Custom Domain (Optional)

### Frontend - Vercel

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add domain: `yourdomain.com`
3. Vào DNS provider (Cloudflare, Namecheap...) add CNAME record:
   ```
   Type: CNAME
   Name: www (hoặc @)
   Value: cname.vercel-dns.com
   ```
4. Update `FRONTEND_URL` trên Render

### Backend - Render

1. Render Dashboard → Service → **Settings** → **Custom Domain**
2. Add domain: `api.yourdomain.com`
3. Add CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: <your-service>.onrender.com
   ```
4. Update `VITE_API_BASE_URL` trên Vercel

---

## Phần 6: CI/CD - Tự động Deploy khi push code

### Vercel (Tự động)
- ✅ Vercel tự động deploy mỗi khi push lên branch `main`
- Không cần cấu hình thêm

### Render (Tự động)
- ✅ Render tự động deploy mỗi khi push lên branch `main`
- Không cần cấu hình thêm

### Quy trình deploy sau khi sửa code:
```bash
# 1. Sửa code
# 2. Commit
git add .
git commit -m "Fix bug XYZ"

# 3. Push → Tự động deploy cả 2 bên
git push origin main

# 4. Đợi 2-3 phút, kiểm tra URLs
```

---

## Phần 7: Monitoring & Maintenance

### Render Logs
- Dashboard → Service → **Logs** tab
- Xem real-time logs, errors

### Vercel Analytics
- Dashboard → Project → **Analytics** tab
- Xem visitor, performance

### Railway Database
- Dashboard → MySQL → **Data** tab
- Xem tables, run queries trực tiếp

### Backup Database định kỳ
```bash
# Export database
mysqldump -h <host> -P <port> -u root -p<password> <database> > backup.sql

# Import lại
mysql -h <host> -P <port> -u root -p<password> <database> < backup.sql
```

---

## Phần 8: Upgrade lên Paid Plan (khi cần)

### Railway - $5/tháng
- ✅ Không sleep mode
- ✅ Dedicated IP
- ✅ 1GB RAM

### Render - $7/tháng
- ✅ Không sleep mode (free tier sleep sau 15 phút idle)
- ✅ 512MB RAM
- ✅ Custom domains

### Vercel - Miễn phí cho personal
- Pro plan: $20/tháng (team collaboration)

---

## Tổng kết các URL cần nhớ

| Service | URL mẫu | Cấu hình ở đâu |
|---------|---------|----------------|
| Frontend | `https://myapp.vercel.app` | Vercel Dashboard |
| Backend | `https://myapp.onrender.com` | Render Dashboard |
| Database | `shuttle.proxy.rlwy.net:12345` | Railway Dashboard |

### Environment Variables tổng hợp:

**Backend (Render):**
```
DB_HOST=<Railway host>
DB_PORT=<Railway port>
DB_USER=root
DB_PASSWORD=<Railway password>
DB_NAME=railway
JWT_SECRET=<64-char random hex>
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://myapp.vercel.app
NODE_ENV=production
PORT=4000
```

**Frontend (Vercel):**
```
VITE_API_BASE_URL=https://myapp.onrender.com
```

---

*Tài liệu này được tạo cho dự án E-Commerce RBAC*
*Cập nhật: 2026-04-03*
