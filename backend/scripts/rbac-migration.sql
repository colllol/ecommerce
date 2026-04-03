-- RBAC Migration Script for E-commerce Project
-- Adds Role-Based Access Control tables and seed data
-- Run this AFTER the main ecommerce_db.sql schema

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
-- 3) USER_ROLES junction table
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
-- 4) ROLE_PERMISSIONS junction table
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
INSERT IGNORE INTO Roles (id, name, description) VALUES
(1, 'Admin', 'Quản trị viên - Toàn quyền truy cập hệ thống'),
(2, 'Manager', 'Quản lý - Quản lý người dùng, sản phẩm, đơn hàng'),
(3, 'Staff', 'Nhân viên - Xử lý đơn hàng, hỗ trợ khách hàng'),
(4, 'Customer', 'Khách hàng - Mua sắm, xem sản phẩm');

-- =========================
-- SEED DATA: Permissions (22 permissions)
-- =========================
INSERT IGNORE INTO Permissions (name, description) VALUES
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
('EDIT_INVENTORY', 'Chỉnh sửa kho hàng');

-- =========================
-- SEED DATA: Role Permissions
-- =========================

-- Admin: All 22 permissions
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, id FROM Permissions
ON DUPLICATE KEY UPDATE permission_id = permission_id;

-- Manager: 12 permissions
INSERT IGNORE INTO Role_Permissions (role_id, permission_id) VALUES
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

-- Staff: 6 permissions
INSERT IGNORE INTO Role_Permissions (role_id, permission_id) VALUES
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_ORDERS')),
(3, (SELECT id FROM Permissions WHERE name = 'EDIT_ORDER')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_INVENTORY')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_USERS'));

-- Customer: 2 permissions
INSERT IGNORE INTO Role_Permissions (role_id, permission_id) VALUES
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS'));

-- =========================
-- Assign roles to existing users
-- =========================
INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 1 FROM Users WHERE email = 'admin@example.com'
ON DUPLICATE KEY UPDATE role_id = 1;

INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 2 FROM Users WHERE email = 'manager@example.com'
ON DUPLICATE KEY UPDATE role_id = 2;

INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 3 FROM Users WHERE email = 'staff1@example.com'
ON DUPLICATE KEY UPDATE role_id = 3;

INSERT INTO User_Roles (user_id, role_id)
SELECT user_id, 4 FROM Users
WHERE email IN ('vana@example.com', 'thib@example.com', 'user@example.com')
AND user_id NOT IN (SELECT user_id FROM User_Roles WHERE role_id = 4);
