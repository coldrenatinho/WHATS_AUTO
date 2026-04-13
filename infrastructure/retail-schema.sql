-- ═══════════════════════════════════════════════════════════════
-- MVP VAREJO 2.0 - SCRIPT DE CRIAÇÃO DAS TABELAS
-- ═══════════════════════════════════════════════════════════════
-- Executar após o banco principal já estar criado
-- Compatível com MariaDB 10.5+

-- ─── CATEGORIAS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_company_slug (company_id, slug),
  INDEX idx_company (company_id),
  INDEX idx_active (is_active),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES retail_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PRODUTOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  stock_unlimited BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  search_terms JSON,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_company_slug (company_id, slug),
  INDEX idx_company (company_id),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured),
  INDEX idx_stock (company_id, stock_quantity),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES retail_categories(id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── CLIENTES VAREJO ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  addresses JSON,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  loyalty_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  preferred_payment VARCHAR(50),
  last_order_at DATETIME,
  tags JSON,
  notes TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_company_phone (company_id, phone),
  INDEX idx_company (company_id),
  INDEX idx_phone (phone),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── CARRINHOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  ticket_id INT,
  contact_phone VARCHAR(20) NOT NULL,
  status ENUM('active', 'abandoned', 'converted') DEFAULT 'active',
  items JSON,
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  delivery_address TEXT,
  delivery_notes TEXT,
  payment_method ENUM('pix', 'card', 'cash'),
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company (company_id),
  INDEX idx_ticket (ticket_id),
  INDEX idx_phone (contact_phone),
  INDEX idx_status (status),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PEDIDOS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  ticket_id INT,
  cart_id INT,
  order_number VARCHAR(50) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') DEFAULT 'pending',
  items JSON,
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method ENUM('pix', 'card', 'cash') NOT NULL,
  payment_status ENUM('pending', 'confirmed', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(100),
  payment_link TEXT,
  payment_qr_code TEXT,
  payment_expires_at DATETIME,
  customer_notes TEXT,
  confirmed_at DATETIME,
  delivered_at DATETIME,
  cancelled_at DATETIME,
  cancel_reason TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_number (order_number),
  INDEX idx_company (company_id),
  INDEX idx_ticket (ticket_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created (created_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (cart_id) REFERENCES retail_carts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TRANSAÇÕES DE FIDELIDADE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_loyalty_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  customer_id INT NOT NULL,
  order_id INT,
  type ENUM('earn', 'redeem', 'expire', 'adjust') NOT NULL,
  points INT NOT NULL,
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company (company_id),
  INDEX idx_customer (customer_id),
  INDEX idx_order (order_id),
  INDEX idx_type (type),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES retail_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES retail_orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PROMOÇÕES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retail_promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('percentage', 'fixed', 'buy_x_get_y', 'loyalty_multiplier') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  product_ids JSON,
  category_ids JSON,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  coupon_code VARCHAR(50),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coupon (coupon_code),
  INDEX idx_company (company_id),
  INDEX idx_active (is_active),
  INDEX idx_dates (starts_at, ends_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
-- DADOS INICIAIS (EXEMPLO)
-- ═══════════════════════════════════════════════════════════════

-- Categorias exemplo (substitua COMPANY_ID pelo ID real)
-- INSERT INTO retail_categories (company_id, name, slug, display_order) VALUES
--   (COMPANY_ID, 'Bebidas', 'bebidas', 1),
--   (COMPANY_ID, 'Laticínios', 'laticinios', 2),
--   (COMPANY_ID, 'Padaria', 'padaria', 3),
--   (COMPANY_ID, 'Hortifruti', 'hortifruti', 4),
--   (COMPANY_ID, 'Limpeza', 'limpeza', 5),
--   (COMPANY_ID, 'Higiene', 'higiene', 6);

-- Produtos exemplo
-- INSERT INTO retail_products (company_id, category_id, name, slug, price, stock_quantity, is_active) VALUES
--   (COMPANY_ID, 1, 'Coca-Cola Lata 350ml', 'coca-cola-lata-350ml', 5.00, 100, TRUE),
--   (COMPANY_ID, 1, 'Coca-Cola 2L', 'coca-cola-2l', 10.00, 50, TRUE),
--   (COMPANY_ID, 1, 'Guaraná Antarctica 2L', 'guarana-antarctica-2l', 8.00, 40, TRUE),
--   (COMPANY_ID, 1, 'Água Mineral 500ml', 'agua-mineral-500ml', 3.00, 200, TRUE);

-- ═══════════════════════════════════════════════════════════════
-- VIEWS ÚTEIS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_retail_dashboard AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_revenue,
  COALESCE(AVG(o.total), 0) AS avg_ticket,
  COUNT(DISTINCT CASE WHEN o.status IN ('pending', 'confirmed', 'preparing') THEN o.id END) AS pending_orders,
  COUNT(DISTINCT rc.id) AS total_customers,
  COUNT(DISTINCT CASE WHEN rc.last_order_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN rc.id END) AS active_customers
FROM companies c
LEFT JOIN retail_orders o ON o.company_id = c.id AND o.status != 'cancelled'
LEFT JOIN retail_customers rc ON rc.company_id = c.id
GROUP BY c.id, c.name;

-- ═══════════════════════════════════════════════════════════════
-- PROCEDURES
-- ═══════════════════════════════════════════════════════════════

DELIMITER //

-- Gerar número de pedido
CREATE PROCEDURE sp_generate_order_number(
  IN p_company_id INT,
  OUT p_order_number VARCHAR(50)
)
BEGIN
  DECLARE v_prefix VARCHAR(20);
  DECLARE v_seq INT;
  DECLARE v_date VARCHAR(8);

  SET v_date = DATE_FORMAT(NOW(), '%y%m%d');
  SET v_prefix = CONCAT('PED', v_date);

  SELECT COALESCE(MAX(CAST(RIGHT(order_number, 4) AS UNSIGNED)), 0) + 1
  INTO v_seq
  FROM retail_orders
  WHERE company_id = p_company_id
    AND order_number LIKE CONCAT(v_prefix, '%');

  SET p_order_number = CONCAT(v_prefix, LPAD(v_seq, 4, '0'));
END //

-- Atualizar tier de fidelidade
CREATE PROCEDURE sp_update_loyalty_tier(
  IN p_customer_id INT
)
BEGIN
  DECLARE v_total_spent DECIMAL(10,2);
  DECLARE v_new_tier VARCHAR(20);

  SELECT total_spent INTO v_total_spent
  FROM retail_customers WHERE id = p_customer_id;

  SET v_new_tier = CASE
    WHEN v_total_spent >= 1000 THEN 'platinum'
    WHEN v_total_spent >= 500 THEN 'gold'
    WHEN v_total_spent >= 100 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE retail_customers
  SET loyalty_tier = v_new_tier
  WHERE id = p_customer_id;
END //

DELIMITER ;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

DELIMITER //

-- Trigger para atualizar estoque ao criar pedido
CREATE TRIGGER tr_update_stock_on_order
AFTER INSERT ON retail_orders
FOR EACH ROW
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE item_count INT;
  DECLARE item_json JSON;
  DECLARE prod_id INT;
  DECLARE qty INT;

  SET item_count = JSON_LENGTH(NEW.items);

  WHILE i < item_count DO
    SET item_json = JSON_EXTRACT(NEW.items, CONCAT('$[', i, ']'));
    SET prod_id = JSON_UNQUOTE(JSON_EXTRACT(item_json, '$.product_id'));
    SET qty = JSON_UNQUOTE(JSON_EXTRACT(item_json, '$.quantity'));

    UPDATE retail_products
    SET stock_quantity = GREATEST(0, stock_quantity - qty)
    WHERE id = prod_id
      AND stock_unlimited = FALSE;

    SET i = i + 1;
  END WHILE;
END //

DELIMITER ;