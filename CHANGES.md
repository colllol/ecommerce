# Báo cáo chỉnh sửa project E-commerce

## Cập nhật mới nhất: Tách riêng App theo role

### Cấu trúc mới

#### 1. App.jsx - Dành cho người dùng (customers)
- Chỉ hiển thị cho khách hàng thông thường
- Các trang: Home, Product, Category, Cart, Checkout, Profile
- Không có truy cập vào khu vực admin/staff

#### 2. AppAdmin.jsx - Dành cho Admin
- Dashboard với biểu đồ doanh thu
- Quản lý: Users, Categories, Products, Orders, Inventory, Staff, Reports
- Header riêng với menu ngang
- Màu theme: Xanh dương (#3b82f6)

#### 3. AppStaff.jsx - Dành cho Staff
- Dashboard tổng quan công việc
- Chức năng: Xuất sản phẩm, Lịch sử bán hàng
- Header riêng với menu ngang
- Màu theme: Xanh lá (#10b981)

#### 4. main.jsx - Điều hướng tự động
- Tự động detect role của user từ localStorage
- Render App tương ứng với role
- Lắng nghe sự kiện auth change để chuyển App

#### 5. LoginPage.jsx - Cập nhật
- Sau khi login thành công, kiểm tra role:
  - `admin` → redirect to `/admin`
  - `staff` → redirect to `/staff`
  - `customer` → redirect to `/`

### Flow đăng nhập

```
Login Page
    ↓
Kiểm tra credentials
    ↓
Lưu token & user info
    ↓
Kiểm tra role
    ↓
admin → /admin (AppAdmin)
staff → /staff (AppStaff)
customer → / (App)
```

### Cấu trúc file

```
frontend/src/
├── main.jsx              # Entry point, điều hướng theo role
├── App.jsx               # Cho customers
├── AppAdmin.jsx          # Cho admins
├── AppStaff.jsx          # cho staff
├── pages/
│   ├── admin/            # Các trang admin
│   ├── staff/            # Các trang staff
│   └── ...               # Các trang public
├── components/
│   ├── ProtectedRoute.jsx
│   └── ...
└── shared/
    ├── AuthContext.jsx
    └── CartContext.jsx
```

### Lưu ý

1. **ProtectedRoute** cập nhật:
   - Nhận `children` prop thay vì dùng `Outlet`
   - Redirect về trang phù hợp nếu không đúng role

2. **Auth changes**:
   - localStorage event listener để detect logout
   - Tự động chuyển về App khi logout

3. **Build**: ✅ Success - Không có lỗi

---

## Các thay đổi trước đó

### 1. Database (ecommerce_db.sql)

#### Bảng Users
- Thêm role `staff` vào ENUM: `('customer', 'admin', 'staff')`
- Tất cả password đã được hash với bcrypt cho mật khẩu mặc định: `123456`

#### Tách bảng Products
- **Products** (giữ nguyên thông tin sản phẩm):
  - Bỏ cột `stock_quantity`
  - Giữ các cột: product_id, category_id, product_name, slug, sku, price, v.v.

- **Inventory** (mới - quản lý tồn kho):
  - inventory_id (PK)
  - product_id (FK)
  - stock_quantity: Tổng số lượng
  - reserved_quantity: Số lượng đã đặt
  - available_quantity: Số lượng khả dụng
  - warehouse_location: Vị trí kho
  - last_updated: Thời gian cập nhật

- **InventoryTransactions** (mới - lịch sử biến động):
  - transaction_id (PK)
  - inventory_id, product_id (FK)
  - transaction_type: ENUM('in', 'out', 'adjustment', 'return')
  - quantity: Số lượng (âm cho xuất, dương cho nhập)
  - reference_type, reference_id: Tham chiếu đến đơn hàng/thao tác
  - staff_id: Nhân viên thực hiện
  - note: Ghi chú
  - created_at: Thời gian giao dịch

### 2. Backend

#### Models mới
- `src/models/inventoryModel.js`: Quản lý kho
- `src/models/inventoryTransactionModel.js`: Lịch sử giao dịch kho

#### Controllers mới
- `src/controllers/inventoryController.js`:
  - GET /api/inventory - Danh sách kho
  - GET /api/inventory/transactions - Lịch sử giao dịch
  - GET /api/inventory/sales-history - Lịch sử xuất kho
  - POST /api/inventory/pick-product - Xuất sản phẩm (staff)
  - POST /api/inventory/add-stock - Nhập kho (admin)
  - PUT /api/inventory/:id - Cập nhật kho (admin)

- `src/controllers/staffController.js`:
  - GET /api/staff - Danh sách nhân viên (admin)
  - POST /api/staff - Tạo nhân viên (admin)
  - PUT /api/staff/:id - Cập nhật nhân viên (admin)
  - DELETE /api/staff/:id - Xóa nhân viên (admin)
  - GET /api/staff/my-activity - Hoạt động của nhân viên
  - GET /api/staff/reports/overview - Báo cáo tổng quan (admin)

#### Middlewares
- `src/middlewares/authMiddleware.js`:
  - Thêm `authorizeStaff()`: Cho phép staff và admin
  - Thêm `authorizeAdminOrStaff()`: Cho phép cả staff và admin

#### Routes mới
- `src/routes/inventoryRoutes.js`
- `src/routes/staffRoutes.js`

### 3. Frontend

#### Xóa AIChatBox
- Loại bỏ component AIChatBox khỏi App.jsx
- Loại bỏ import và sử dụng trong Layout

#### Trang Admin mới

**AdminDashboardPage** (Cập nhật):
- Biểu đồ biến động doanh thu 7 ngày
- Thống kê nhanh: đơn hoàn thành, chờ xử lý
- Card điều hướng đến các module quản lý

**AdminInventoryPage** (Mới):
- Xem danh sách tồn kho
- Nhập kho (admin)
- Cập nhật vị trí kho
- Xem số lượng: tổng, khả dụng, đã đặt

**AdminStaffPage** (Mới):
- Quản lý nhân viên (CRUD)
- Phân quyền: nhân viên, quản trị viên
- Quản lý trạng thái: hoạt động, không hoạt động, bị khóa

**AdminReportsPage** (Mới):
- Báo cáo tổng quan theo khoảng thời gian
- Thống kê tồn kho
- Thống kê đơn hàng và doanh thu
- Thống kê xuất kho theo sản phẩm

#### Trang Staff mới

**StaffDashboardPage** (Mới - Index):
- Tổng quan: số sản phẩm, sản phẩm sắp hết, giao dịch hôm nay
- Thao tác nhanh: xuất sản phẩm, xem lịch sử
- Giao dịch gần đây
- Cảnh báo sắp hết hàng

**StaffIndexPage** (Đã đổi thành PickProducts):
- Chọn sản phẩm để xuất kho
- Tìm kiếm sản phẩm
- Hiển thị số lượng tồn kho
- Form xác nhận xuất kho

**StaffSalesHistoryPage** (Mới):
- Lịch sử xuất/bán hàng
- Lọc theo khoảng thời gian
- Hiển thị: sản phẩm, số lượng, nhân viên, ghi chú

#### Trang ProfileUserPage (Mới)
- Thông tin cá nhân
- Lịch sử đơn hàng với trạng thái:
  - Chờ xác nhận (pending)
  - Đã xác nhận (confirmed)
  - Đang giao (shipping)
  - Hoàn thành (completed)
  - Đã hủy (cancelled)

#### Components
- `StaffLayout.jsx`: Layout cho khu vực staff
- Cập nhật `ProtectedRoute.jsx`: Hỗ trợ role staff
- Cập nhật `AdminLayout.jsx`: Thêm menu mới

### 4. Routing

#### Public Routes
- `/` - HomePage (cho khách hàng)
- `/cart` - CartPage (cho khách hàng)
- `/profile` - ProfileUserPage (cho user đã đăng nhập)

#### Admin Routes (`/admin`)
- `/admin` - Dashboard với biểu đồ doanh thu
- `/admin/inventory` - Quản lý kho
- `/admin/staff` - Quản lý nhân sự
- `/admin/reports` - Báo cáo

#### Staff Routes (`/staff`)
- `/staff` - Dashboard tổng quan
- `/staff/pick-products` - Xuất sản phẩm
- `/staff/sales-history` - Lịch sử bán hàng

### 5. Tài khoản đăng nhập

Tất cả password: **123456**

| Email | Role |
|-------|------|
| admin@example.com | admin |
| staff1@example.com | staff |
| vana@example.com | customer |
| thib@example.com | customer |

### 6. Chạy project

```bash
# Backend
cd d:\ecommerce\backend
npm start

# Frontend
cd d:\ecommerce\frontend
npm run dev
```

### 7. API Endpoints mới

#### Inventory
```
GET    /api/inventory              - Xem danh sách kho (staff+)
GET    /api/inventory/transactions - Lịch sử giao dịch (staff+)
GET    /api/inventory/sales-history- Lịch sử xuất kho (staff+)
POST   /api/inventory/pick-product - Xuất sản phẩm (staff+)
POST   /api/inventory/add-stock    - Nhập kho (admin)
PUT    /api/inventory/:id          - Cập nhật kho (admin)
GET    /api/inventory/summary      - Tổng quan kho (staff+)
```

#### Staff
```
GET    /api/staff                  - Danh sách nhân viên (admin)
POST   /api/staff                  - Tạo nhân viên (admin)
PUT    /api/staff/:id              - Cập nhật nhân viên (admin)
DELETE /api/staff/:id              - Xóa nhân viên (admin)
GET    /api/staff/my-activity      - Hoạt động của tôi (staff+)
GET    /api/staff/reports/overview - Báo cáo (admin)
```

## Lưu ý

1. **Database**: Cần chạy file `ecommerce_db.sql` để cập nhật schema
2. **Passwords**: Đã update tất cả password về `123456`
3. **Inventory**: Dữ liệu inventory được tự động tạo khi insert products với stock_quantity
4. **Build**: Frontend build thành công, không có lỗi

## Bug đã fix

1. ✅ Fix import path AuthContext trong các page
2. ✅ Fix password hash không khớp
3. ✅ Fix routing cho staff area
4. ✅ Build thành công không lỗi
