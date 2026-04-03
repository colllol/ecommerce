# 🚀 Hướng dẫn Deploy E-Commerce Project

> **Mục tiêu:** Deploy toàn bộ ứng dụng E-Commerce lên cloud với 3 thành phần:
> - **Database** → Railway (MySQL)
> - **Backend API** → Render (Node.js/Express)
> - **Frontend** → Vercel (React/Vite)

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Chuẩn bị trước khi deploy](#chuẩn-bị-trước-khi-deploy)
3. [Phần 1: Deploy Database lên Railway](#phần-1-deploy-database-lên-railway)
4. [Phần 2: Deploy Backend lên Render](#phần-2-deploy-backend-lên-render)
5. [Phần 3: Deploy Frontend lên Vercel](#phần-3-deploy-frontend-lên-vercel)
6. [Phần 4: Kết nối các thành phần](#phần-4-kết-nối-các-thành-phần)
7. [Phần 5: Kiểm tra sau Deploy](#phần-5-kiểm-tra-sau-deploy)
8. [Phần 6: Custom Domain (Optional)](#phần-6-custom-domain-optional)
9. [Phần 7: CI/CD - Tự động Deploy](#phần-7-cicd---tự-động-deploy)
10. [Phần 8: Monitoring & Maintenance](#phần-8-monitoring--maintenance)
11. [Phần 9: Xử lý lỗi thường gặp](#phần-9-xử-lý-lỗi-thường-gặp)
12. [Phần 10: Upgrade lên Paid Plan](#phần-10-upgrade-lên-paid-plan)
13. [Tổng kết Environment Variables](#tổng-kết-environment-variables)

---

## Tổng quan kiến trúc

```
┌─────────────────────┐      HTTPS      ┌──────────────────────┐
│   Người dùng        │ ──────────────▶ │   Vercel             │
│   (Browser)         │                 │   (Frontend React)   │
└─────────────────────┘                 │   *.vercel.app       │
                                        └──────────┬───────────┘
                                                   │
                                           API Calls (/api/*)
                                                   │
                                        ┌──────────▼───────────┐
                                        │   Render             │
                                        │   (Backend Express)  │
                                        │   *.onrender.com     │
                                        └──────────┬───────────┘
                                                   │
                                          MySQL Connection
                                                   │
                                        ┌──────────▼───────────┐
                                        │   Railway            │
                                        │   (MySQL Database)   │
                                        │   *.railway.app      │
                                        └──────────────────────┘
```

### Luồng hoạt động:
1. Người dùng truy cập Frontend trên Vercel
2. Frontend gọi API đến Backend trên Render
3. Backend truy vấn Database trên Railway
4. Kết quả trả về theo chuỗi: Database → Backend → Frontend → Người dùng

---

## Chuẩn bị trước khi Deploy

### ✅ Checklist chuẩn bị

| # | Hạng mục | Trạng thái | Ghi chú |
|---|----------|------------|---------|
| 1 | Tài khoản GitHub | ✅ | Bắt buộc |
| 2 | Code đã push lên GitHub | ⬜ | Xem hướng dẫn bên dưới |
| 3 | Tài khoản Railway | ⬜ | Đăng ký bằng GitHub |
| 4 | Tài khoản Render | ⬜ | Đăng ký bằng GitHub |
| 5 | Tài khoản Vercel | ⬜ | Đăng ký bằng GitHub |
| 6 | MySQL Workbench (tùy chọn) | ⬜ | Để import schema dễ hơn |

### 📦 Bước 0: Push code lên GitHub

```bash
# Mở terminal tại thư mục gốc dự án
cd c:\Users\Huynh-Nguyen\Documents\GitHub\ecommerce

# Kiểm tra trạng thái
git status

# Thêm tất cả file
git add .

# Commit
git commit -m "Prepare for production deployment"

# Push lên GitHub
git push origin main
```

> ⚠️ **Quan trọng:** Đảm bảo file `.gitignore` đã có các dòng sau để KHÔNG commit secrets:
> ```
> node_modules/
> .env
> .env.local
> *.log
> dist/
> build/
> ```

---

## Phần 1: Deploy Database lên Railway

### Bước 1: Tạo tài khoản Railway

1. Truy cập: **https://railway.app/**
2. Click **"Login"** → Chọn **"Sign in with GitHub"**
3. Ủy quyền Railway truy cập GitHub account

> 💡 **Free tier:** Railway cho $5 credit/tháng (đủ dùng cho project nhỏ)

### Bước 2: Tạo MySQL Database

1. Dashboard → Click **"New Project"** → **"Create from Scratch"**
2. Đặt tên project: `ecommerce-database`
3. Click **"+ New"** → Chọn **"Database"** → **"Add MySQL"**
4. Đợi 1-2 phút để Railway tạo MySQL instance

### Bước 3: Lấy thông tin kết nối

1. Click vào MySQL service vừa tạo
2. Chuyển sang tab **"Variables"**
3. Copy các thông tin sau:

| Variable | Ví dụ | Dùng ở đâu |
|----------|-------|------------|
| `MYSQLHOST` | `mysql.railway.internal` | Backend (Render) |
| `MYSQLPORT` | `3306` | Backend (Render) |
| `MYSQLUSER` | `root` | Backend (Render) |
| `MYSQLPASSWORD` | `TGyWjaXSrwKWqLYivQeO...` | Backend (Render) |
| `MYSQLDATABASE` | `railway` | Backend (Render) |

### Bước 4: Tạo Public Hostname (Bắt buộc!)

> ⚠️ **Quan trọng:** `mysql.railway.internal` chỉ hoạt động trong mạng Railway. Để Backend trên Render kết nối được, cần public hostname.

1. Vào MySQL service → Tab **"Settings"**
2. Scroll xuống mục **"Networking"**
3. Click **"Generate Domain"**
4. Copy hostname (ví dụ: `shuttle.proxy.rlwy.net:12345`)

> 📝 **Lưu ý:** Hostname này sẽ điền vào `DB_HOST` trên Render.

### Bước 5: Import Database Schema

#### Cách 1: Dùng MySQL Workbench (Khuyến nghị - Dễ nhất)

1. **Tải MySQL Workbench:** https://dev.mysql.com/downloads/workbench/
2. **Mở Workbench** → Click **"+"** để tạo connection mới:

   | Field | Giá trị |
   |-------|---------|
   | Connection Name | `Railway Ecommerce` |
   | Connection Method | Standard (TCP/IP) |
   | Hostname | `<MYSQLHOST>` (bước 4) |
   | Port | `<MYSQLPORT>` (thường là 3306) |
   | Username | `root` |
   | Password | `<MYSQLPASSWORD>` |

3. Click **"Test Connection"** → Nếu hiện "Successfully made connection" thì OK
4. Click **"OK"** để lưu
5. **Double-click** vào connection vừa tạo để kết nối
6. **Import schema:**
   - Menu: **File** → **Open SQL Script...**
   - Chọn file: `c:\Users\Huynh-Nguyen\Documents\GitHub\ecommerce\ecommerce_db.sql`
   - Click biểu tượng **⚡ (Lightning bolt)** hoặc nhấn `Ctrl + Shift + Enter`
   - Đợi script chạy xong (~5-10 giây)

7. **Kiểm tra kết quả:**
   ```sql
   USE ecommerce_db;
   SHOW TABLES;
   SELECT * FROM Users;
   SELECT * FROM Roles;
   SELECT * FROM Permissions;
   ```

   **Kết quả mong đợi:**
   - 12 tables: Users, Roles, Permissions, User_Roles, Role_Permissions, Categories, Products, Inventory, InventoryTransactions, Orders, OrderItem, Payments
   - 6 users mẫu
   - 4 roles: Admin, Manager, Staff, Customer
   - 22 permissions

#### Cách 2: Dùng Command Line

```bash
# Cài MySQL Client nếu chưa có
# Windows: tải từ https://dev.mysql.com/downloads/installer/

# Import schema
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u root -p<MYSQLPASSWORD> < ecommerce_db.sql

# Hoặc dùng connection string
mysql -h shuttle.proxy.rlwy.net -P 12345 -u root -p'TGyWjaXS...' < ecommerce_db.sql
```

### Bước 6: Chạy RBAC Migration (Seed data)

> File `ecommerce_db.sql` đã bao gồm seed data RBAC. Nếu thiếu, chạy thêm:

1. Trong MySQL Workbench, mở file: `backend/scripts/rbac-migration.sql`
2. Click **⚡** để chạy
3. Kiểm tra lại:
   ```sql
   SELECT COUNT(*) FROM Roles;           -- Expected: 4
   SELECT COUNT(*) FROM Permissions;     -- Expected: 22
   SELECT COUNT(*) FROM Role_Permissions; -- Expected: 42
   ```

### Bước 7: Cập nhật Password Users

> ⚠️ **Quan trọng:** Password mặc định trong `ecommerce_db.sql` là `123456`. Nếu muốn đổi:

```sql
-- Tạo bcrypt hash mới (dùng online tool: https://bcrypt-generator.com/)
-- Nhập password mong muốn, rounds = 10

-- Cập nhật tất cả users (ví dụ password vẫn là 123456):
UPDATE Users 
SET password_hash = '$2a$10$BD8IsL/XaT71XI.ZpqgwS.e156ovg8p3ox8XPR8lY8cC25q8lqOzK' 
WHERE 1=1;
```

### Bước 8: Kiểm tra kết nối từ bên ngoài

> ⚠️ **Lưu ý quan trọng:** Railway free tier có thể block external connections. Nếu Render không kết nối được:

1. Vào MySQL service → Tab **"Settings"** → **"Networking"**
2. Đảm bảo đã **"Generate Domain"** (bước 4)
3. Kiểm tra firewall rules (nếu có)

---

## Phần 2: Deploy Backend lên Render

### Bước 1: Chuẩn bị Backend

#### 2.1: Kiểm tra file cấu hình

Đảm bảo các file sau đã chính xác:

| File | Mục đích |
|------|----------|
| `backend/package.json` | Khai báo dependencies |
| `backend/render.yaml` | Cấu hình deploy lên Render |
| `backend/.env.example` | Template environment variables |
| `backend/src/server.js` | Entry point của API |

#### 2.2: Kiểm tra `.gitignore`

```bash
# Đảm bảo backend/.env KHÔNG bị commit
cat .gitignore
```

Phải có các dòng:
```
node_modules/
.env
.env.local
*.log
```

#### 2.3: Commit và Push code

```bash
cd c:\Users\Huynh-Nguyen\Documents\GitHub\ecommerce
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

### Bước 2: Tạo tài khoản Render

1. Truy cập: **https://render.com/**
2. Click **"Get Started for Free"** → **"Sign in with GitHub"**
3. Ủy quyền Render truy cập GitHub repository `ecommerce`

> 💡 **Free tier:** 750 giờ/tháng (đủ cho 1 service chạy 24/7)
> ⚠️ **Lưu ý:** Free tier sẽ sleep sau 15 phút không có request

### Bước 3: Tạo Web Service

1. Dashboard → Click **"New +"** → **"Web Service"**
2. Chọn **"Connect a repository"**
3. Tìm và chọn repository `ecommerce`
4. Cấu hình như sau:

| Setting | Giá trị | Giải thích |
|---------|---------|------------|
| **Name** | `ecommerce-backend` | Tên service trên Render |
| **Region** | **Singapore** | Gần Việt Nam nhất, latency thấp |
| **Branch** | `main` | Branch sẽ deploy |
| **Root Directory** | `backend` | Thư mục chứa backend code |
| **Runtime** | **Node** | Node.js environment |
| **Build Command** | `npm install` | Cài dependencies |
| **Start Command** | `npm start` | Lệnh khởi động server |
| **Instance Type** | **Free** | Free tier |

### Bước 4: Cấu hình Environment Variables

Scroll xuống phần **"Environment Variables"** → Click **"Add Environment Variable"** → Thêm từng biến:

| Key | Giá trị | Ghi chú |
|-----|---------|---------|
| `NODE_ENV` | `production` | Chế độ production |
| `PORT` | `4000` | Port backend lắng nghe |
| `DB_HOST` | `<public hostname từ Railway>` | Ví dụ: `shuttle.proxy.rlwy.net` |
| `DB_PORT` | `<port từ Railway>` | Ví dụ: `12345` hoặc `3306` |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `<password từ Railway>` | MySQL password |
| `DB_NAME` | `ecommerce_db` | Tên database |
| `JWT_SECRET` | *(tạo random 64 ký tự)* | Xem cách tạo bên dưới |
| `JWT_EXPIRES_IN` | `1d` | Token hết hạn sau 1 ngày |
| `FRONTEND_URL` | *(để trống, điền sau)* | Sẽ cập nhật sau khi deploy frontend |

#### 🔐 Tạo JWT_SECRET an toàn:

**Cách 1: Dùng online tool**
- Truy cập: https://generate-random.org/
- Tạo random string 64 ký tự

**Cách 2: Dùng terminal (nếu có Node.js)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Cách 3: Copy mẫu (KHÔNG dùng cho production thật)**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

> ⚠️ **Quan trọng về JWT_SECRET:**
> - KHÔNG được thay đổi sau khi deploy (user sẽ phải login lại)
> - Phải ít nhất 32 ký tự
> - Nên dùng ký tự đặc biệt và số

### Bước 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render sẽ tự động build và deploy (~2-3 phút)
3. Theo dõi progress ở tab **"Logs"**
4. Khi thấy dòng `"Ecommerce API running on port 4000"` → Deploy thành công
5. Copy **Service URL** (ví dụ: `https://ecommerce-backend.onrender.com`)

### Bước 6: Test Backend API

Mở terminal hoặc Postman, test các endpoint:

#### Test 1: Health Check
```bash
curl https://ecommerce-backend.onrender.com/
```
**Response mong đợi:**
```json
{
  "message": "Ecommerce API running"
}
```

#### Test 2: Login
```bash
curl -X POST https://ecommerce-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```
**Response mong đợi:**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "fullName": "Admin",
    "email": "admin@example.com",
    "roles": ["Admin"],
    "permissions": ["VIEW_DASHBOARD", "CREATE_USER", ...]
  }
}
```

#### Test 3: Get Products (công khai)
```bash
curl https://ecommerce-backend.onrender.com/api/products
```
**Response mong đợi:** Danh sách sản phẩm

### Bước 7: Kiểm tra RBAC Migration

Nếu backend chạy OK nhưng login không trả về roles/permissions:

1. Vào Render Dashboard → Backend service → Tab **"Shell"**
2. Chạy lệnh:
   ```bash
   npm run setup:rbac
   ```
3. Hoặc chạy migration thủ công qua MySQL Workbench

---

## Phần 3: Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị Frontend

#### 1.1: Kiểm tra file cấu hình

| File | Mục đích |
|------|----------|
| `frontend/package.json` | Dependencies React/Vite |
| `frontend/vite.config.js` | Cấu hình Vite + proxy API |
| `frontend/vercel.json` | Cấu hình deploy lên Vercel |
| `frontend/.env.example` | Template environment variables |

#### 1.2: Commit và Push code

```bash
cd c:\Users\Huynh-Nguyen\Documents\GitHub\ecommerce
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

### Bước 2: Tạo tài khoản Vercel

1. Truy cập: **https://vercel.com/**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Ủy quyền Vercel truy cập GitHub repository `ecommerce`

> 💡 **Free tier:** Unlimited deployments cho personal projects

### Bước 3: Import Project

1. Dashboard → Click **"Add New..."** → **"Project"**
2. Tìm và click **"Import"** vào repository `ecommerce`
3. Cấu hình như sau:

| Setting | Giá trị | Giải thích |
|---------|---------|------------|
| **Project Name** | `ecommerce-frontend` | Tên project trên Vercel |
| **Framework Preset** | **Vite** | Vite build tool |
| **Root Directory** | `frontend` | Thư mục chứa frontend code |
| **Build Command** | `npm run build` | Build production |
| **Output Directory** | `dist` | Thư mục output sau build |
| **Install Command** | `npm install` | Cài dependencies |

### Bước 4: Cấu hình Environment Variables

1. Trong quá trình setup, scroll xuống phần **"Environment Variables"**
2. Click **"Add"** và thêm:

| Key | Giá trị | Ghi chú |
|-----|---------|---------|
| `VITE_API_BASE_URL` | `https://ecommerce-backend.onrender.com` | URL backend từ Bước 5 (Render) |

> ⚠️ **Quan trọng:**
> - Prefix `VITE_` là **bắt buộc** để Vite đọc được env variable
> - KHÔNG có dấu `/` ở cuối URL
> - Sai prefix → Frontend không gọi được API

### Bước 5: Deploy Frontend

1. Click **"Deploy"**
2. Vercel sẽ build (~30 giây - 1 phút)
3. Khi hiện **"Congratulations"** → Deploy thành công
4. Copy **Production URL** (ví dụ: `https://ecommerce-frontend.vercel.app`)

### Bước 6: Mở ứng dụng

1. Click **"Visit"** hoặc mở URL trong browser
2. Trang chủ sẽ hiện ra với danh sách sản phẩm
3. Test login với tài khoản:
   - **Email:** `admin@example.com`
   - **Password:** `123456`

---

## Phần 4: Kết nối các thành phần

### Bước 1: Cập nhật CORS trên Render

> Frontend đã deploy, cần cập nhật `FRONTEND_URL` trên Render để CORS hoạt động đúng.

1. Vào **Render Dashboard** → Backend service
2. Tab **"Environment"**
3. Tìm biến `FRONTEND_URL` → Click **"Edit"**
4. Nhập URL Vercel: `https://ecommerce-frontend.vercel.app`
5. Click **"Save Changes"**
6. Render sẽ tự động redeploy (~1 phút)

### Bước 2: Kiểm tra kết nối End-to-End

1. Mở trang frontend: `https://ecommerce-frontend.vercel.app`
2. Mở **Browser DevTools** (F12) → Tab **Network**
3. Thử login trên frontend
4. Kiểm tra trong Network tab:
   - Request đến `/api/auth/login` → Status **200 OK**
   - **Không có CORS errors**
   - Response có `token` và `user` data

---

## Phần 5: Kiểm tra sau Deploy

### ✅ Checklist kiểm tra

| # | Kiểm tra | URL | Kết quả mong đợi | Trạng thái |
|---|----------|-----|------------------|------------|
| 1 | Backend health | `https://<backend>.onrender.com/` | `{"message":"Ecommerce API running"}` | ⬜ |
| 2 | Backend login | POST `https://<backend>.onrender.com/api/auth/login` | JWT token + user data | ⬜ |
| 3 | Backend get products | `https://<backend>.onrender.com/api/products` | Danh sách sản phẩm | ⬜ |
| 4 | Frontend load | `https://<frontend>.vercel.app` | Trang chủ hiện ra | ⬜ |
| 5 | Frontend login | `https://<frontend>.vercel.app/login` | Login thành công → redirect | ⬜ |
| 6 | Admin dashboard | `https://<frontend>.vercel.app/admin` | Hiển thị stats + menu admin | ⬜ |
| 7 | API calls từ frontend | DevTools → Network | Không có CORS errors | ⬜ |
| 8 | Database connection | Query bất kỳ API nào | Không có lỗi 500 | ⬜ |

### 🔍 Cách kiểm tra chi tiết

#### Kiểm tra Backend Logs
1. Render Dashboard → Backend service → Tab **"Logs"**
2. Xem real-time logs, errors, warnings

#### Kiểm tra Frontend
1. Mở browser DevTools (F12)
2. Tab **Console**: Xem JavaScript errors
3. Tab **Network**: Xem API requests và responses
4. Tab **Application** → **Local Storage**: Xem JWT token

#### Kiểm tra Database
1. Railway Dashboard → MySQL → Tab **"Data"**
2. Xem tables, chạy queries trực tiếp

---

## Phần 6: Custom Domain (Optional)

### Frontend - Vercel

#### Bước 1: Thêm domain trên Vercel
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Nhập domain: `yourdomain.com` hoặc `www.yourdomain.com`
3. Click **"Add"**

#### Bước 2: Cấu hình DNS
Vào DNS provider (Cloudflare, Namecheap, GoDaddy...) thêm record:

```
Type: CNAME
Name: www (hoặc @)
Value: cname.vercel-dns.com
TTL: Auto
```

#### Bước 3: Cập nhật Backend CORS
1. Render Dashboard → Backend service → **Environment**
2. Edit `FRONTEND_URL` → `https://yourdomain.com`
3. Save → Render redeploy

### Backend - Render

#### Bước 1: Thêm custom domain trên Render
1. Render Dashboard → Service → **Settings** → **Custom Domain**
2. Nhập: `api.yourdomain.com`
3. Click **"Add Domain"**

#### Bước 2: Cấu hình DNS
```
Type: CNAME
Name: api
Value: <your-service>.onrender.com
TTL: 3600
```

#### Bước 3: Cập nhật Frontend
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Edit `VITE_API_BASE_URL` → `https://api.yourdomain.com`
3. Redeploy frontend: Deployments → ... → **Redeploy**

---

## Phần 7: CI/CD - Tự động Deploy

### ✅ Vercel (Tự động)
- Mỗi khi push lên branch `main` → Vercel tự động build và deploy
- Không cần cấu hình thêm

### ✅ Render (Tự động)
- Mỗi khi push lên branch `main` → Render tự động build và deploy
- Không cần cấu hình thêm

### 🔄 Quy trình deploy sau khi sửa code

```bash
# 1. Sửa code (thêm tính năng, fix bug...)

# 2. Kiểm tra local
cd backend && npm run dev   # Test backend
cd frontend && npm run dev  # Test frontend

# 3. Commit thay đổi
git add .
git commit -m "Fix: Sửa lỗi XYZ"

# 4. Push → Tự động deploy cả 2 bên
git push origin main

# 5. Đợi 2-3 phút
# - Vercel: ~30 giây
# - Render: ~2 phút

# 6. Kiểm tra URLs
```

### 📝 Quy ước đặt tên Commit

```
feat: Thêm tính năng mới
fix: Sửa lỗi
docs: Cập nhật tài liệu
style: Thay đổi UI/UX
refactor: Tái cấu trúc code
test: Thêm test
chore: Cập nhật config, dependencies
```

**Ví dụ:**
```bash
git commit -m "feat: Thêm chức năng export báo cáo CSV"
git commit -m "fix: Sửa lỗi CORS khi gọi API từ frontend"
git commit -m "docs: Cập nhật hướng dẫn deploy"
```

---

## Phần 8: Monitoring & Maintenance

### Render Logs
- **Đường dẫn:** Dashboard → Service → **Logs** tab
- **Công dụng:** Xem real-time logs, debug errors
- **Mẹo:** Filter theo level (error, warn, info)

### Vercel Analytics
- **Đường dẫn:** Dashboard → Project → **Analytics** tab
- **Công dụng:** Xem visitor, page views, performance
- **Mẹo:** Enable Web Analytics (miễn phí)

### Railway Database
- **Đường dẫn:** Dashboard → MySQL → **Data** tab
- **Công dụng:** Xem tables, chạy queries trực tiếp
- **Mẹo:** Dùng MySQL Workbench để query dễ hơn

### Backup Database định kỳ

#### Export (Backup)
```bash
mysqldump -h <host> -P <port> -u root -p<password> ecommerce_db > backup_$(date +%Y%m%d).sql
```

#### Import (Restore)
```bash
mysql -h <host> -P <port> -u root -p<password> ecommerce_db < backup_20260403.sql
```

> 💡 **Mẹo:** Tạo cron job backup tự động hàng tuần

### Kiểm tra sức khỏe Database
```sql
-- Kiểm tra số lượng records
SELECT 'Users' AS table_name, COUNT(*) AS count FROM Users
UNION ALL
SELECT 'Products', COUNT(*) FROM Products
UNION ALL
SELECT 'Orders', COUNT(*) FROM Orders
UNION ALL
SELECT 'Roles', COUNT(*) FROM Roles;

-- Kiểm tra kết nối đang active
SHOW PROCESSLIST;
```

---

## Phần 9: Xử lý lỗi thường gặp

### ❌ Lỗi 1: CORS Error

**Triệu chứng:**
```
Access to fetch at 'https://backend.onrender.com/api/auth/login' from origin
'https://frontend.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Nguyên nhân:** `FRONTEND_URL` trên Render chưa đúng hoặc chưa cập nhật.

**Cách sửa:**
1. Render Dashboard → Backend service → **Environment**
2. Kiểm tra `FRONTEND_URL` = `https://ecommerce-frontend.vercel.app` (KHÔNG có `/` cuối)
3. **Save Changes** → Đợi redeploy
4. Clear browser cache (Ctrl + Shift + Delete)

---

### ❌ Lỗi 2: 500 Internal Server Error

**Triệu chứng:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

**Nguyên nhân có thể:**
- Database connection sai thông tin
- JWT_SECRET chưa set
- Migration chưa chạy

**Cách sửa:**

**Bước 1:** Kiểm tra Render Logs
- Dashboard → Backend → **Logs** tab
- Tìm dòng có `[ERROR]` hoặc `Error:`

**Bước 2:** Kiểm tra Environment Variables
```
DB_HOST = đúng public hostname từ Railway
DB_PORT = đúng port
DB_USER = root
DB_PASSWORD = đúng password
DB_NAME = ecommerce_db
JWT_SECRET = random 64 ký tự
```

**Bước 3:** Test database connection từ Render Shell
- Dashboard → Backend → **Shell** tab
```bash
# Kiểm tra env variables
echo $DB_HOST
echo $DB_PORT

# Test kết nối (nếu có mysql client)
npm run setup:rbac
```

---

### ❌ Lỗi 3: 401 Unauthorized

**Triệu chứng:**
```
{"message": "Token không hợp lệ hoặc đã hết hạn"}
```

**Nguyên nhân:**
- JWT_SECRET bị thay đổi
- Token hết hạn (mặc định 1 ngày)
- Token không được gửi đúng cách

**Cách sửa:**
1. **Clear localStorage:**
   - Mở DevTools (F12) → Application → Local Storage
   - Delete keys: `token`, `user`
   - Login lại

2. **Kiểm tra JWT_SECRET:**
   - Đảm bảo KHÔNG đổi JWT_SECRET sau khi deploy
   - Nếu đổi → Tất cả user phải login lại

3. **Kiểm tra API call:**
   ```javascript
   // Đúng cách gửi token
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

---

### ❌ Lỗi 4: Không kết nối được Database

**Triệu chứng:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
hoặc
```
Error: getaddrinfo ENOTFOUND mysql.railway.internal
```

**Nguyên nhân:**
- Railway hostname chỉ hoạt động trong mạng nội bộ Railway
- Chưa Generate Domain (public hostname)

**Cách sửa:**
1. Railway Dashboard → MySQL → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy hostname (ví dụ: `shuttle.proxy.rlwy.net:12345`)
4. Render → Environment → Cập nhật:
   ```
   DB_HOST = shuttle.proxy.rlwy.net
   DB_PORT = 12345
   ```
5. Redeploy backend

---

### ❌ Lỗi 5: Frontend không gọi được API

**Triệu chứng:**
- Trang web load được nhưng không có dữ liệu
- Console log: `ERR_CONNECTION_REFUSED` hoặc `net::ERR_NAME_NOT_RESOLVED`

**Nguyên nhân:**
- `VITE_API_BASE_URL` sai hoặc thiếu
- Backend chưa deploy xong
- Backend URL sai

**Cách sửa:**
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Kiểm tra `VITE_API_BASE_URL` = `https://ecommerce-backend.onrender.com`
3. **KHÔNG** có dấu `/` ở cuối
4. Redeploy frontend: **Deployments** → **...** → **Redeploy**

---

### ❌ Lỗi 6: Build thất bại trên Render/Vercel

**Triệu chứng:**
```
Error: Command "npm install" exited with 1
```

**Nguyên nhân:**
- `package.json` sai
- Thiếu dependencies
- Node version không tương thích

**Cách sửa:**
1. Kiểm tra log build
2. Đảm bảo `package.json` có đầy đủ dependencies
3. Test build local trước:
   ```bash
   cd backend && npm install && npm run build
   cd frontend && npm install && npm run build
   ```

---

## Phần 10: Upgrade lên Paid Plan

### Khi nào cần upgrade?

| Dấu hiệu | Giải pháp |
|----------|-----------|
| Backend sleep liên tục | Upgrade Render ($7/tháng) |
| Database disconnect | Upgrade Railway ($5/tháng) |
| Cần custom domain | Miễn phí trên cả 3 |
| Cần nhiều RAM/CPU hơn | Upgrade plan |
| Team collaboration | Upgrade Vercel Pro ($20/tháng) |

### Railway - $5/tháng (Hobby Plan)

| Feature | Free | Paid ($5/tháng) |
|---------|------|-----------------|
| Credit | $5/tháng | $5/tháng + thêm được |
| RAM | 1 GB | 1 GB+ |
| Storage | 5 GB | 5 GB+ |
| Sleep mode | Không | Không |
| Public IP | ✅ | ✅ |

**Nâng cấp:** Railway Dashboard → **Account** → **Upgrade**

### Render - $7/tháng (Individual Plan)

| Feature | Free | Paid ($7/tháng) |
|---------|------|-----------------|
| Hours | 750 giờ/tháng | Unlimited |
| RAM | 512 MB | 512 MB+ |
| Sleep mode | 15 phút idle | Không |
| Custom domain | ✅ | ✅ |
| Auto-deploy | ✅ | ✅ |

**Nâng cấp:** Render Dashboard → **Account** → **Billing** → **Upgrade**

### Vercel - Miễn phí (Hobby Plan)

| Feature | Hobby (Free) | Pro ($20/tháng) |
|---------|--------------|-----------------|
| Deployments | Unlimited | Unlimited |
| Bandwidth | 100 GB/tháng | Unlimited |
| Serverless functions | 100 GB-hours/tháng | Unlimited |
| Team members | 1 | Unlimited |
| Analytics | Cơ bản | Nâng cao |

**Nâng cấp:** Vercel Dashboard → **Settings** → **Usage** → **Upgrade**

---

## Tổng kết Environment Variables

### Backend (Render)

```bash
# ============================================
# DATABASE
# ============================================
DB_HOST=shuttle.proxy.rlwy.net        # Public hostname từ Railway
DB_PORT=12345                          # Port từ Railway
DB_USER=root                           # MySQL username
DB_PASSWORD=TGyWjaXSrwKWqLYivQeO...    # MySQL password
DB_NAME=ecommerce_db                   # Tên database

# ============================================
# JWT
# ============================================
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0...    # Random 64+ ký tự, KHÔNG đổi
JWT_EXPIRES_IN=1d                      # Token expiration (1d = 1 ngày)

# ============================================
# SERVER
# ============================================
NODE_ENV=production                    # Chế độ production
PORT=4000                              # Port lắng nghe

# ============================================
# CORS
# ============================================
FRONTEND_URL=https://ecommerce-frontend.vercel.app  # URL frontend (không / cuối)
```

### Frontend (Vercel)

```bash
# ============================================
# API
# ============================================
VITE_API_BASE_URL=https://ecommerce-backend.onrender.com
# ⚠️ Prefix VITE_ là bắt buộc
# ⚠️ KHÔNG có / ở cuối URL
```

---

## 📚 Tài liệu tham khảo

| Dịch vụ | Docs | Dashboard |
|---------|------|-----------|
| **Railway** | https://docs.railway.app/ | https://railway.app/dashboard |
| **Render** | https://render.com/docs | https://dashboard.render.com/ |
| **Vercel** | https://vercel.com/docs | https://vercel.com/dashboard |

---

## 🔐 Bảo mật - Best Practices

1. **KHÔNG bao giờ commit `.env` file lên GitHub**
2. **JWT_SECRET** phải random và ít nhất 32 ký tự
3. **Database password** nên đổi định kỳ
4. **Enable 2FA** trên GitHub, Railway, Render, Vercel
5. **Review logs** thường xuyên để phát hiện bất thường
6. **Backup database** ít nhất 1 lần/tuần
7. **Cập nhật dependencies** thường xuyên (`npm audit`, `npm update`)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề không xử lý được:

1. **Kiểm tra logs** trên Render/Vercel
2. **Search lỗi** trên Google/StackOverflow
3. **Hỏi AI assistant** với mô tả chi tiết + log error
4. **Kiểm tra lại** các bước trong hướng dẫn này

---

> **Cập nhật lần cuối:** 2026-04-03  
> **Phiên bản:** 2.0  
> **Áp dụng cho:** E-Commerce Project với RBAC  
> **Tech stack:** React 18 + Vite | Express.js | MySQL 8

---

*Chúc bạn deploy thành công! 🎉*