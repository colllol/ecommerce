# Hướng dẫn sử dụng E-commerce Platform

## Tổng quan

Hệ thống đã được tách thành 3 ứng dụng riêng biệt dựa trên quyền người dùng:
- **Customers** (Khách hàng): App.jsx
- **Admins** (Quản trị viên): AppAdmin.jsx
- **Staff** (Nhân viên): AppStaff.jsx

## Đăng nhập

### Tài khoản mặc định (password: 123456)

| Email | Vai trò | Redirect sau login |
|-------|---------|-------------------|
| admin@example.com | Admin | /admin |
| staff1@example.com | Staff | /staff |
| vana@example.com | Customer | / |
| thib@example.com | Customer | / |

### Flow đăng nhập

1. Truy cập `/login`
2. Nhập email và password
3. Hệ thống tự động redirect dựa trên role:
   - **Admin** → Trang quản trị (Admin Panel)
   - **Staff** → Trang nhân viên (Staff Panel)
   - **Customer** → Trang chủ (Home)

## Flow hoạt động chi tiết

### 1. Flow khởi động ứng dụng

```
┌─────────────────────────────────────────────────────────┐
│  Người dùng mở trang web (http://localhost:5173)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  main.jsx được load                                     │
│  ───────────────────────────────────────────────────    │
│  1. Kiểm tra localStorage.getItem('auth')               │
│  2. Parse JSON để lấy user.role                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬──────────────────┐
         │                       │                  │
         ▼                       ▼                  ▼
   role === 'admin'        role === 'staff'    role === 'customer'
         │                       │                  │
         │                       │                  │
         ▼                       ▼                  ▼
┌─────────────────┐     ┌─────────────────┐  ┌─────────────┐
│  Render         │     │  Render         │  │  Render     │
│  AppAdmin.jsx   │     │  AppStaff.jsx   │  │  App.jsx    │
│  (Admin Panel)  │     │  (Staff Panel)  │  │  (User Site)│
└─────────────────┘     └─────────────────┘  └─────────────┘
```

### 2. Flow đăng nhập

```
┌─────────────────────────────────────────────────────────┐
│  Người dùng nhập email + password tại /login            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  LoginPage.jsx: handleSubmit()                          │
│  ───────────────────────────────────────────────────    │
│  1. Gọi useAuth.login(email, password)                  │
│  2. POST /api/auth/login                                │
│  3. Nhận token + user info từ server                    │
│  4. Lưu vào localStorage:                               │
│     { user: {...}, token: "..." }                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Kiểm tra user.role để redirect                         │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────────┐
    │        │        │                │
    ▼        ▼        ▼                ▼
 admin    staff   customer        (khác)
    │        │        │                │
    │        │        │                │
    ▼        ▼        ▼                ▼
 /admin   /staff    /                /
    │        │        │
    │        │        │
    ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Admin  │ │Staff  │ │User Site     │
│Panel  │ │Panel  │ │(HomePage)    │
└───────┘ └───────┘ └──────────────┘
```

### 3. Flow chuyển đổi App khi logout/login

```
┌─────────────────────────────────────────────────────────┐
│  Người dùng click "Đăng xuất"                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  useAuth.logout()                                       │
│  ───────────────────────────────────────────────────    │
│  1. Xóa localStorage.removeItem('auth')                 │
│  2. Xóa Authorization header                            │
│  3. Set user = null, token = null                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  storage event listener trong main.jsx                  │
│  ───────────────────────────────────────────────────    │
│  1. Detect sự kiện 'storage' với key 'auth'             │
│  2. newValue === null → setCurrentApp('user')           │
│  3. Render lại App.jsx                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Người dùng được chuyển về User Site (App.jsx)          │
│  hoặc có thể redirect về /login                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Flow bảo vệ route (ProtectedRoute)

```
┌─────────────────────────────────────────────────────────┐
│  Component render với <ProtectedRoute>                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ProtectedRoute.jsx                                     │
│  ───────────────────────────────────────────────────    │
│  1. useAuth() → lấy user từ context                     │
│  2. Kiểm tra:                                           │
│     - loading? → Hiển thị "Đang tải..."                 │
│     - !user? → <Navigate to="/login" />                 │
│     - requiredRole? → Kiểm tra user.role                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   Đạt kiểm tra           Không đạt
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ Navigate đến:   │
         │              │ - /login (nếu   │
         │              │   chưa đăng     │
         │              │   nhập)         │
         │              │ - /admin hoặc   │
         │              │   /staff (nếu   │
         │              │   sai role)     │
         │              └─────────────────┘
         ▼
┌─────────────────────────┐
│ Render children         │
│ (Component được bảo vệ) │
└─────────────────────────┘
```

### 5. Flow API Request

```
┌─────────────────────────────────────────────────────────┐
│  Component gọi API (ví dụ: GET /api/inventory)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  axios.get('/api/inventory', {                          │
│    headers: { Authorization: `Bearer ${token}` }        │
│  })                                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: authMiddleware.authenticate                   │
│  ───────────────────────────────────────────────────    │
│  1. Lấy token từ header                                 │
│  2. jwt.verify(token, JWT_SECRET)                       │
│  3. Giải mã → req.user = { user_id, role, ... }         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Kiểm tra quyền (nếu cần)                               │
│  ───────────────────────────────────────────────────    │
│  - authorizeAdmin: req.user.role === 'admin'            │
│  - authorizeStaff: req.user.role === 'staff' || 'admin' │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   Đạt quyền              Không đạt
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ 403 Forbidden   │
         │              │ hoặc 401        │
         │              │ Unauthorized    │
         │              └─────────────────┘
         ▼
┌─────────────────────────┐
│ Thực thi controller     │
│ Trả về data             │
└─────────────────────────┘
```

## Chức năng theo quyền

### 👤 Customer (Khách hàng)

**Trang công khai:**
- `/` - Trang chủ (xem sản phẩm)
- `/products/:id` - Chi tiết sản phẩm
- `/categories/:id` - Sản phẩm theo danh mục
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/profile` - Thông tin cá nhân + Lịch sử đơn hàng

**Chức năng:**
- Xem và tìm kiếm sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng
- Xem lịch sử đơn hàng với trạng thái

### 👨‍💼 Admin (Quản trị viên)

**Truy cập:** `/admin`

**Menu quản trị:**
1. **Tổng quan** (`/admin`)
   - Biểu đồ doanh thu 7 ngày
   - Thống kê đơn hàng
   - Card điều hướng nhanh

2. **Người dùng** (`/admin/users`)
   - Xem danh sách users
   - Thêm/sửa/xóa user

3. **Danh mục** (`/admin/categories`)
   - Quản lý danh mục sản phẩm

4. **Sản phẩm** (`/admin/products`)
   - Quản lý sản phẩm
   - Tạo/sửa/xóa sản phẩm

5. **Đơn hàng** (`/admin/orders`)
   - Xem tất cả đơn hàng
   - Cập nhật trạng thái đơn

6. **Quản lý kho** (`/admin/inventory`)
   - Xem tồn kho tất cả sản phẩm
   - Nhập kho
   - Điều chỉnh số lượng

7. **Quản lý nhân sự** (`/admin/staff`)
   - Xem danh sách nhân viên
   - Tạo/sửa/xóa nhân viên
   - Phân quyền (staff/admin)

8. **Báo cáo** (`/admin/reports`)
   - Báo cáo doanh thu theo khoảng thời gian
   - Thống kê tồn kho
   - Thống kê xuất/nhập

### 👷 Staff (Nhân viên)

**Truy cập:** `/staff`

**Menu nhân viên:**
1. **Tổng quan** (`/staff`)
   - Thống kê công việc hôm nay
   - Giao dịch gần đây
   - Cảnh báo hàng sắp hết
   - Thao tác nhanh

2. **Xuất sản phẩm** (`/staff/pick-products`)
   - Chọn sản phẩm cần xuất
   - Tìm kiếm sản phẩm
   - Xem số lượng tồn
   - Xác nhận xuất kho

3. **Lịch sử bán hàng** (`/staff/sales-history`)
   - Xem lịch sử xuất kho
   - Lọc theo khoảng thời gian
   - Chi tiết: sản phẩm, số lượng, người thực hiện

## Điểm khác biệt giữa Admin và Staff

| Tính năng | Admin | Staff |
|-----------|-------|-------|
| Dashboard | Biểu đồ doanh thu, thống kê toàn hệ thống | Thống kê công việc, giao dịch cá nhân |
| Quản lý kho | Nhập kho, điều chỉnh, xem toàn bộ | Chỉ xem và xuất kho |
| Quản lý nhân sự | ✅ CRUD nhân viên | ❌ |
| Báo cáo | ✅ Đầy đủ | ❌ |
| Xuất sản phẩm | ✅ | ✅ (chức năng chính) |
| Lịch sử bán hàng | ✅ (tất cả) | ✅ (tất cả) |

## Giao diện

### Admin Panel
- Header màu xám đen (#1f2937)
- Menu ngang với màu xanh dương (#3b82f6)
- Logo "Admin Panel"

### Staff Panel
- Header màu xanh đen (#065f46)
- Menu ngang với màu xanh lá (#10b981)
- Logo "Staff Panel"

### User Site
- Header màu đen (#111827)
- Giao diện website thương mại điện tử thông thường

## Technical Notes

### Tự động chuyển đổi App
- `main.jsx` kiểm tra localStorage khi load
- Lắng nghe sự kiện `storage` để detect logout
- Tự động render App tương ứng với role

### Bảo mật
- ProtectedRoute kiểm tra role trước khi render
- Redirect tự động nếu không đúng quyền
- Token JWT cho mỗi request API

### API Endpoints

#### Admin only:
```
GET    /api/users              - Danh sách users
POST   /api/users              - Tạo user
PUT    /api/users/:id          - Cập nhật user
DELETE /api/users/:id          - Xóa user

GET    /api/staff              - Danh sách staff
POST   /api/staff              - Tạo staff
PUT    /api/staff/:id          - Cập nhật staff
DELETE /api/staff/:id          - Xóa staff

POST   /api/inventory/add-stock- Nhập kho
PUT    /api/inventory/:id       - Cập nhật kho
GET    /api/staff/reports       - Báo cáo
```

#### Staff + Admin:
```
GET    /api/inventory              - Xem kho
GET    /api/inventory/transactions - Giao dịch
GET    /api/inventory/sales-history- Lịch sử xuất
POST   /api/inventory/pick-product - Xuất sản phẩm
GET    /api/staff/my-activity      - Hoạt động của tôi
```

## Chạy project

```bash
# Backend (Port 4000)
cd d:\ecommerce\backend
npm start

# Frontend (Port 5173)
cd d:\ecommerce\frontend
npm run dev
```

## Build

```bash
cd d:\ecommerce\frontend
npm run build
```

✅ Build thành công - Không có lỗi
