-- Schema MySQL cho website bán hàng
-- Tương thích MySQL 8+

CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

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
-- 2) CATEGORIES (danh mục)
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
-- 3) PRODUCTS (sản phẩm) - Thông tin sản phẩm
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
-- 3b) INVENTORY (kho hàng) - Tách từ Products ra
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
-- 3c) INVENTORY_TRANSACTIONS (lịch sử xuất/nhập kho)
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
-- 4) ORDERS (đặt hàng)
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
-- 5) ORDERITEM (giỏ hàng / chi tiết đơn)
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
-- 6) PAYMENTS (thanh toán online)
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

-- Gợi ý: lấy tổng tiền đơn hàng từ OrderItem
-- SELECT order_id, SUM(line_total) FROM OrderItem GROUP BY order_id;

INSERT INTO Categories (category_name, slug, description)
VALUES
('Điện thoại', 'dien-thoai', 'Các loại smartphone chính hãng'),
('Laptop', 'laptop', 'Laptop văn phòng, gaming'),
('Phụ kiện', 'phu-kien', 'Tai nghe, sạc, chuột...');

-- Insert Products (without stock_quantity)
INSERT INTO Products
(category_id, product_name, slug, sku, price, image_url)
VALUES
(1, 'iPhone 15 Pro', 'iphone-15-pro', 'IP15PRO001', 28000000, 'iphone15.jpg'),
(1, 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'SSS24001', 22000000, 's24.jpg'),
(2, 'MacBook Air M3', 'macbook-air-m3', 'MBAIRM3001', 32000000, 'macbookm3.jpg'),
(3, 'Tai nghe Bluetooth Sony', 'tai-nghe-sony', 'SONYBT001', 2500000, 'sony.jpg');

-- Insert Inventory data (tách từ stock_quantity ra)
INSERT INTO Inventory (product_id, stock_quantity, reserved_quantity, available_quantity, warehouse_location)
VALUES
(1, 20, 0, 20, 'Kho A'),
(2, 15, 0, 15, 'Kho A'),
(3, 10, 0, 10, 'Kho B'),
(4, 50, 0, 50, 'Kho C');

-- Insert Users with staff role
INSERT INTO Users (full_name, email, phone, password_hash, role, status)
VALUES
('Nguyễn Văn A', 'vana@example.com', '0901111111',
 '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
 'customer', 'active'),

 ('Admin', 'admin@example.com', '0900000000',
 '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
 'admin', 'active'),

('Trần Thị B', 'thib@example.com', '0902222222',
 '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
 'customer', 'active'),

('Nhân Viên 1', 'staff1@example.com', '0903333333',
 '$2a$10$YrDWemak5jvx2G9IuL8Pr..Vk9TgBUSy8p3RSiGqATZ9j4o1rPfpK',
 'staff', 'active');
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
 select*from Users
 