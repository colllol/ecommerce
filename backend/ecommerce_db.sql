-- =====================================================
-- E-Commerce Database Schema with RBAC Integration
-- MySQL 8+ | UTF8MB4 | InnoDB
-- =====================================================

-- Railway uses 'railway' as database name, skip CREATE DATABASE
USE railway;

-- =========================
-- 1) USERS (người dùng)
-- =========================
CREATE TABLE IF NOT EXISTS Users (
  user_id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name          VARCHAR(150) NOT NULL,
  email              VARCHAR(255) NOT NULL,
  phone              VARCHAR(20) DEFAULT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  role               ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer',
  status             ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_phone (phone)
) ENGINE=InnoDB;

-- =========================
-- 2) RBAC: ROLES
-- =========================
CREATE TABLE IF NOT EXISTS Roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- 3) RBAC: PERMISSIONS
-- =========================
CREATE TABLE IF NOT EXISTS Permissions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- 4) RBAC: USER_ROLES (many-to-many)
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
-- 5) RBAC: ROLE_PERMISSIONS (many-to-many)
-- =========================
CREATE TABLE IF NOT EXISTS Role_Permissions (
  role_id       INT UNSIGNED NOT NULL,
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
-- 6) CATEGORIES (danh mục)
-- =========================
CREATE TABLE IF NOT EXISTS Categories (
  category_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name       VARCHAR(120) NOT NULL,
  slug                VARCHAR(160) NOT NULL,
  parent_category_id  BIGINT UNSIGNED DEFAULT NULL,
  description         TEXT DEFAULT NULL,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_categories_slug (slug),
  UNIQUE KEY uk_categories_name (category_name),
  KEY idx_categories_parent (parent_category_id),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- 7) PRODUCTS (sản phẩm)
-- =========================
CREATE TABLE IF NOT EXISTS Products (
  product_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id          BIGINT UNSIGNED NOT NULL,
  product_name         VARCHAR(200) NOT NULL,
  slug                 VARCHAR(220) NOT NULL,
  sku                  VARCHAR(100) NOT NULL,
  short_description    VARCHAR(500) DEFAULT NULL,
  description          TEXT DEFAULT NULL,
  price                DECIMAL(12,2) NOT NULL,
  discount_percent     DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  image_url            VARCHAR(500) DEFAULT NULL,
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_products_slug (slug),
  UNIQUE KEY uk_products_sku (sku),
  KEY idx_products_category (category_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_discount CHECK (discount_percent >= 0 AND discount_percent <= 100)
) ENGINE=InnoDB;

-- =========================
-- 8) INVENTORY (kho hàng)
-- =========================
CREATE TABLE IF NOT EXISTS Inventory (
  inventory_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id           BIGINT UNSIGNED NOT NULL,
  stock_quantity       INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_quantity    INT UNSIGNED NOT NULL DEFAULT 0,
  available_quantity   INT UNSIGNED NOT NULL DEFAULT 0,
  warehouse_location   VARCHAR(100) DEFAULT NULL,
  last_updated         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_inventory_product (product_id),
  KEY idx_inventory_product (product_id),
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 9) INVENTORY_TRANSACTIONS (lịch sử xuất/nhập kho)
-- =========================
CREATE TABLE IF NOT EXISTS InventoryTransactions (
  transaction_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inventory_id         BIGINT UNSIGNED NOT NULL,
  product_id           BIGINT UNSIGNED NOT NULL,
  transaction_type     ENUM('in', 'out', 'adjustment', 'return') NOT NULL,
  quantity             INT NOT NULL,
  reference_type       VARCHAR(50) DEFAULT NULL,
  reference_id         BIGINT UNSIGNED DEFAULT NULL,
  staff_id             BIGINT UNSIGNED NOT NULL,
  note                 VARCHAR(500) DEFAULT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transactions_inventory (inventory_id),
  KEY idx_transactions_product (product_id),
  KEY idx_transactions_staff (staff_id),
  KEY idx_transactions_type (transaction_type),
  CONSTRAINT fk_transactions_inventory
    FOREIGN KEY (inventory_id) REFERENCES Inventory(inventory_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transactions_product
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transactions_staff
    FOREIGN KEY (staff_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================
-- 10) ORDERS (đặt hàng)
-- =========================
CREATE TABLE IF NOT EXISTS Orders (
  order_id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  order_code            VARCHAR(50) NOT NULL,
  order_status          ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled')
                        NOT NULL DEFAULT 'pending',
  shipping_name         VARCHAR(150) NOT NULL,
  shipping_phone        VARCHAR(20) NOT NULL,
  shipping_address      VARCHAR(300) NOT NULL,
  note                  VARCHAR(500) DEFAULT NULL,
  subtotal_amount       DECIMAL(12,2) NOT NULL,
  shipping_fee          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount          DECIMAL(12,2) NOT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_orders_order_code (order_code),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status (order_status),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_orders_amounts CHECK (
    subtotal_amount >= 0 AND shipping_fee >= 0 AND discount_amount >= 0 AND total_amount >= 0
  )
) ENGINE=InnoDB;

-- =========================
-- 11) ORDERITEM (chi tiết đơn hàng)
-- =========================
CREATE TABLE IF NOT EXISTS OrderItem (
  order_item_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id               BIGINT UNSIGNED NOT NULL,
  product_id             BIGINT UNSIGNED NOT NULL,
  quantity               INT UNSIGNED NOT NULL,
  unit_price             DECIMAL(12,2) NOT NULL,
  discount_percent       DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  line_total             DECIMAL(12,2) NOT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_orderitem_order_product (order_id, product_id),
  KEY idx_orderitem_product (product_id),
  CONSTRAINT fk_orderitem_order
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_orderitem_quantity CHECK (quantity > 0),
  CONSTRAINT chk_orderitem_prices CHECK (
    unit_price >= 0 AND discount_percent >= 0 AND discount_percent <= 100 AND line_total >= 0
  )
) ENGINE=InnoDB;

-- =========================
-- 12) PAYMENTS (thanh toán)
-- =========================
CREATE TABLE IF NOT EXISTS Payments (
  payment_id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id               BIGINT UNSIGNED NOT NULL,
  payment_method         ENUM('cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay', 'paypal', 'stripe')
                         NOT NULL,
  transaction_ref        VARCHAR(120) DEFAULT NULL,
  payment_status         ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  amount                 DECIMAL(12,2) NOT NULL,
  paid_at                DATETIME DEFAULT NULL,
  gateway_response       JSON DEFAULT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_order (order_id),
  KEY idx_payments_status (payment_status),
  UNIQUE KEY uk_payments_transaction_ref (transaction_ref),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Categories
INSERT INTO Categories (category_name, slug, description)
VALUES
('Điện thoại', 'dien-thoai', 'Các loại smartphone chính hãng'),
('Laptop', 'laptop', 'Laptop văn phòng, gaming'),
('Phụ kiện', 'phu-kien', 'Tai nghe, sạc, chuột...');

-- Products
INSERT INTO Products (category_id, product_name, slug, sku, price, image_url)
VALUES
(1, 'iPhone 15 Pro', 'iphone-15-pro', 'IP15PRO001', 28000000, 'iphone15.jpg'),
(1, 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'SSS24001', 22000000, 's24.jpg'),
(2, 'MacBook Air M3', 'macbook-air-m3', 'MBAIRM3001', 32000000, 'macbookm3.jpg'),
(3, 'Tai nghe Bluetooth Sony', 'tai-nghe-sony', 'SONYBT001', 2500000, 'sony.jpg');

-- Inventory
INSERT INTO Inventory (product_id, stock_quantity, reserved_quantity, available_quantity, warehouse_location)
VALUES
(1, 20, 0, 20, 'Kho A'),
(2, 15, 0, 15, 'Kho A'),
(3, 10, 0, 10, 'Kho B'),
(4, 50, 0, 50, 'Kho C');

-- RBAC: Roles
INSERT INTO Roles (name, description) VALUES
('Admin', 'Quản trị viên - Toàn quyền truy cập hệ thống'),
('Manager', 'Quản lý - Quản lý người dùng, sản phẩm, đơn hàng'),
('Staff', 'Nhân viên - Xử lý đơn hàng, hỗ trợ khách hàng'),
('Customer', 'Khách hàng - Mua sắm, xem sản phẩm');

-- RBAC: Permissions (22 permissions)
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

-- RBAC: Role Permissions
-- Admin: All 22 permissions
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, id FROM Permissions;

-- Manager: 12 permissions
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

-- Staff: 6 permissions
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_ORDERS')),
(3, (SELECT id FROM Permissions WHERE name = 'EDIT_ORDER')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_INVENTORY')),
(3, (SELECT id FROM Permissions WHERE name = 'VIEW_USERS'));

-- Customer: 2 permissions (basic)
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_DASHBOARD')),
(4, (SELECT id FROM Permissions WHERE name = 'VIEW_PRODUCTS'));

-- Users (password: 123456 for all)
-- bcrypt hash of '123456' with salt rounds 10
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
VALUES
('Admin', 'admin@example.com', '0900000000',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'admin', 'active'),

('Nguyễn Văn A', 'vana@example.com', '0901111111',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'customer', 'active'),

('Trần Thị B', 'thib@example.com', '0902222222',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'customer', 'active'),

('Nhân Viên 1', 'staff1@example.com', '0903333333',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'staff', 'active'),

('Manager User', 'manager@example.com', '0900000002',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'staff', 'active'),

('Basic User', 'user@example.com', '0900000003',
 '$2a$10$l2eenx/7sZ6ymURFdgxMSe8Bfr31Jyi8spXSb/GOyokEU.2ybPjXi',
 'customer', 'active');

-- Assign roles to users
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
SELECT user_id, 4 FROM Users WHERE email IN ('vana@example.com', 'thib@example.com', 'user@example.com')
ON DUPLICATE KEY UPDATE role_id = 4;

-- Sample Order
INSERT INTO Orders
(user_id, order_code, order_status,
 shipping_name, shipping_phone, shipping_address,
 subtotal_amount, shipping_fee, discount_amount, total_amount)
VALUES
(2, 'ORD0001', 'confirmed',
 'Nguyễn Văn A', '0901111111', 'Hà Nội',
 28000000, 30000, 0, 28030000);

INSERT INTO OrderItem
(order_id, product_id, quantity, unit_price, discount_percent, line_total)
VALUES
(1, 2, 1, 22000000, 0, 22000000);

INSERT INTO Payments
(order_id, payment_method, transaction_ref, payment_status, amount, paid_at, gateway_response)
VALUES
(1, 'vnpay', 'VNPAY123456', 'paid', 28030000, NOW(),
 JSON_OBJECT('bank', 'VCB', 'response_code', '00'));
