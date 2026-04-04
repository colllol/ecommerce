-- =====================================================
-- Tạo Admin User cho Production (Render)
-- Chạy script này trên database Render để tạo tài khoản admin
-- =====================================================

-- Password: 123456
-- Hash được tạo bằng bcrypt với salt rounds 10

-- 1. Tạo admin user (nếu chưa có)
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
VALUES 
  ('Admin User', 'admin@example.com', '0900000000',
   '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
   'admin', 'active')
ON DUPLICATE KEY UPDATE 
  password_hash = '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
  status = 'active';

-- 2. Đảm bảo có role 'Admin' trong bảng Roles
INSERT INTO Roles (name, description)
VALUES ('Admin', 'Quản trị viên - Toàn quyền truy cập hệ thống')
ON DUPLICATE KEY UPDATE description = 'Quản trị viên - Toàn quyền truy cập hệ thống';

-- 3. Gán role Admin cho user
INSERT INTO User_Roles (user_id, role_id)
SELECT u.user_id, r.id 
FROM Users u, Roles r 
WHERE u.email = 'admin@example.com' AND r.name = 'Admin'
ON DUPLICATE KEY UPDATE role_id = role_id;

-- 4. Đảm bảo có đủ permissions
INSERT INTO Permissions (name, description) VALUES
('VIEW_DASHBOARD', 'Xem trang dashboard'),
('CREATE_USER', 'Tạo người dùng mới'),
('EDIT_USER', 'Chỉnh sửa thông tin người dùng'),
('DELETE_USER', 'Xóa người dùng'),
('VIEW_USERS', 'Xem danh sách người dùng'),
('CREATE_ROLE', 'Tạo vai trò mới'),
('EDIT_ROLE', 'Chỉnh sửa vai trò'),
('DELETE_ROLE', 'Xóa vai trò'),
('VIEW_ROLES', 'Xem danh sách vai trò'),
('CREATE_PERMISSION', 'Tạo quyền mới'),
('EDIT_PERMISSION', 'Chỉnh sửa quyền'),
('DELETE_PERMISSION', 'Xóa quyền'),
('VIEW_PERMISSIONS', 'Xem danh sách quyền'),
('CREATE_PRODUCT', 'Tạo sản phẩm mới'),
('EDIT_PRODUCT', 'Chỉnh sửa sản phẩm'),
('DELETE_PRODUCT', 'Xóa sản phẩm'),
('VIEW_PRODUCTS', 'Xem danh sách sản phẩm'),
('VIEW_ORDERS', 'Xem danh sách đơn hàng'),
('EDIT_ORDER', 'Chỉnh sửa đơn hàng'),
('DELETE_ORDER', 'Xóa đơn hàng'),
('VIEW_INVENTORY', 'Xem kho hàng'),
('EDIT_INVENTORY', 'Chỉnh sửa kho hàng')
ON DUPLICATE KEY UPDATE description = description;

-- 5. Gán tất cả permissions cho role Admin
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM Roles r, Permissions p 
WHERE r.name = 'Admin'
ON DUPLICATE KEY UPDATE permission_id = permission_id;

-- =====================================================
-- Kiểm tra kết quả
-- =====================================================
SELECT '=== Admin User ===' AS info;
SELECT user_id, full_name, email, role, status FROM Users WHERE email = 'admin@example.com';

SELECT '=== User Roles ===' AS info;
SELECT u.email, r.name AS role_name
FROM Users u
JOIN User_Roles ur ON u.user_id = ur.user_id
JOIN Roles r ON ur.role_id = r.id
WHERE u.email = 'admin@example.com';

SELECT '=== Admin Permissions ===' AS info;
SELECT COUNT(*) AS total_permissions
FROM Permissions p
JOIN Role_Permissions rp ON p.id = rp.permission_id
JOIN Roles r ON rp.role_id = r.id
WHERE r.name = 'Admin';
