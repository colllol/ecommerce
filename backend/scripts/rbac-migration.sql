-- RBAC Migration Script for E-commerce Project
-- Adds Role-Based Access Control tables and seed data

USE ecommerce_db;

-- =========================
-- 1) ROLES table
-- =========================
CREATE TABLE IF NOT EXISTS Roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- 2) PERMISSIONS table
-- =========================
CREATE TABLE IF NOT EXISTS Permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- 3) USER_ROLES junction table (many-to-many)
-- =========================
CREATE TABLE IF NOT EXISTS User_Roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ur_role
    FOREIGN KEY (role_id) REFERENCES Roles(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 4) ROLE_PERMISSIONS junction table (many-to-many)
-- =========================
CREATE TABLE IF NOT EXISTS Role_Permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role
    FOREIGN KEY (role_id) REFERENCES Roles(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rp_permission
    FOREIGN KEY (permission_id) REFERENCES Permissions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================
-- SEED DATA: Roles
-- =========================
INSERT INTO Roles (name, description) VALUES
('Admin', 'Quản trị viên - Toàn quyền truy cập hệ thống'),
('Manager', 'Quản lý - Quản lý người dùng, sản phẩm, đơn hàng'),
('Staff', 'Nhân viên - Xử lý đơn hàng, hỗ trợ khách hàng'),
('Customer', 'Khách hàng - Mua sắm, xem sản phẩm');

-- =========================
-- SEED DATA: Permissions (17 permissions)
-- =========================
INSERT INTO Permissions (name, description) VALUES
-- Dashboard
('VIEW_DASHBOARD', 'Xem trang dashboard'),
-- Users
('CREATE_USER', 'Tạo người dùng mới'),
('EDIT_USER', 'Chỉnh sửa thông tin người dùng'),
('DELETE_USER', 'Xóa người dùng'),
('VIEW_USERS', 'Xem danh sách người dùng'),
-- Roles
('CREATE_ROLE', 'Tạo vai trò mới'),
('EDIT_ROLE', 'Chỉnh sửa vai trò'),
('DELETE_ROLE', 'Xóa vai trò'),
('VIEW_ROLES', 'Xem danh sách vai trò'),
-- Permissions
('CREATE_PERMISSION', 'Tạo quyền mới'),
('EDIT_PERMISSION', 'Chỉnh sửa quyền'),
('DELETE_PERMISSION', 'Xóa quyền'),
('VIEW_PERMISSIONS', 'Xem danh sách quyền'),
-- Products
('CREATE_PRODUCT', 'Tạo sản phẩm mới'),
('EDIT_PRODUCT', 'Chỉnh sửa sản phẩm'),
('DELETE_PRODUCT', 'Xóa sản phẩm'),
('VIEW_PRODUCTS', 'Xem danh sách sản phẩm'),
-- Orders
('VIEW_ORDERS', 'Xem danh sách đơn hàng'),
('EDIT_ORDER', 'Chỉnh sửa đơn hàng'),
('DELETE_ORDER', 'Xóa đơn hàng'),
-- Inventory
('VIEW_INVENTORY', 'Xem kho hàng'),
('EDIT_INVENTORY', 'Chỉnh sửa kho hàng');

-- =========================
-- SEED DATA: Role Permissions
-- =========================

-- Admin: All permissions (22 permissions)
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, id FROM Permissions;

-- Manager: 12 permissions (manage users, products, orders, inventory)
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_USERS')),
(2, (SELECT id FROM Permissions WHERE name = 'CREATE_USER')),
(2, (SELECT id FROM Permissions WHERE name = 'EDIT_USER')),
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_ROLES')),
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS')),
(2, (SELECT id FROM Permissions WHERE name = 'CREATE_PRODUCT')),
(2, (SELECT id FROM Permissions WHERE name = 'EDIT_PRODUCT')),
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_ORDERS')),
(2, (SELECT id FROM Permissions WHERE name = 'EDIT_ORDER')),
(2, (SELECT id FROM Permissions WHERE name = 'VIEW_INVENTORY')),
(2, (SELECT id FROM Permissions WHERE name = 'EDIT_INVENTORY'));

-- Staff: 6 permissions (view and edit orders, view products)
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_ORDERS')),
(3, (SELECT id FROM Permissions WHERE name = 'EDIT_ORDER')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_INVENTORY')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_USERS'));

-- Customer: 2 permissions (basic access)
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS'));

-- =========================
-- Create default test users as per RBAC specification
-- Passwords: admin123, manager123, user123
-- Using bcrypt hash for 'admin123' (same hash works for all for demo)
-- =========================

-- Create admin user if not exists
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
SELECT 'Admin User', 'admin@example.com', '0900000000',
  '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
  'admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'admin@example.com');

-- Create manager user if not exists
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
SELECT 'Manager User', 'manager@example.com', '0900000002',
  '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
  'staff', 'active'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'manager@example.com');

-- Create basic user if not exists
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
SELECT 'Basic User', 'user@example.com', '0900000003',
  '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
  'customer', 'active'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'user@example.com');

-- =========================
-- Assign roles to existing users
-- =========================

-- Assign Admin role to admin user
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 1 FROM Users WHERE email = 'admin@example.com'
ON DUPLICATE KEY UPDATE role_id = 1;

-- Assign Manager role to manager user
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 2 FROM Users WHERE email = 'manager@example.com'
ON DUPLICATE KEY UPDATE role_id = 2;

-- Assign Customer/User role to basic user
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 4 FROM Users WHERE email = 'user@example.com'
ON DUPLICATE KEY UPDATE role_id = 4;

-- Assign Staff role to staff users
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 3 FROM Users WHERE email = 'staff1@example.com'
ON DUPLICATE KEY UPDATE role_id = 3;

-- Assign Customer role to all other users
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 4 FROM Users 
WHERE email NOT IN ('admin@example.com', 'manager@example.com', 'user@example.com', 'staff1@example.com')
AND NOT EXISTS (
  SELECT 1 FROM User_Roles ur WHERE ur.user_id = Users.user_id
);

-- =========================
-- Verification Queries
-- =========================
-- SELECT r.name as role, COUNT(rp.permission_id) as permission_count
-- FROM Roles r
-- LEFT JOIN Role_Permissions rp ON r.id = rp.role_id
-- GROUP BY r.id, r.name;

-- SELECT u.email, r.name as role
-- FROM Users u
-- JOIN User_Roles ur ON u.user_id = ur.user_id
-- JOIN Roles r ON ur.role_id = r.id;
