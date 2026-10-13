-- =============================================================================
-- StayEase Database Schema Definition (MySQL 8.0 / InnoDB)
-- Professional PG Accommodation & Co-Living Management Platform
-- =============================================================================

CREATE DATABASE IF NOT EXISTS stayease_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stayease_db;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(100) NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'tenant', -- 'super_admin', 'admin', 'owner', 'tenant'
    phone VARCHAR(20) NULL,
    avatar VARCHAR(10) NULL,
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'inactive'
    reset_token_hash VARCHAR(255) NULL,
    reset_token_expires_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ix_users_email (email),
    INDEX ix_users_google_id (google_id),
    INDEX ix_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. PROPERTIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    city VARCHAR(50) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    gender_policy VARCHAR(20) NOT NULL DEFAULT 'unisex', -- 'unisex', 'male', 'female'
    monthly_rent DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2) NOT NULL,
    deposit_months INT NOT NULL DEFAULT 2,
    notice_period_days INT NOT NULL DEFAULT 30,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    reviews_count INT NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    cover_image VARCHAR(500) NULL,
    images JSON NULL,
    amenities JSON NULL,
    house_rules JSON NULL,
    total_beds INT NOT NULL DEFAULT 0,
    vacant_beds INT NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    food_included BOOLEAN NOT NULL DEFAULT FALSE,
    food_type VARCHAR(30) NOT NULL DEFAULT 'veg_only',
    ac_available BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_properties_city (city),
    INDEX ix_properties_gender_policy (gender_policy),
    INDEX ix_properties_monthly_rent (monthly_rent),
    INDEX ix_properties_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. ROOMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(30) NOT NULL DEFAULT 'single', -- 'single', 'double', 'triple', 'four_sharing'
    sharing_capacity INT NOT NULL DEFAULT 1,
    rent DECIMAL(10, 2) NOT NULL,
    ac_available BOOLEAN NOT NULL DEFAULT FALSE,
    floor INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX ix_rooms_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. BEDS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    bed_code VARCHAR(20) NOT NULL, -- e.g. "A", "B", "C"
    availability_status VARCHAR(20) NOT NULL DEFAULT 'vacant', -- 'vacant', 'occupied', 'reserved', 'maintenance'
    monthly_rent DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX ix_beds_room_id (room_id),
    INDEX ix_beds_availability_status (availability_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. JOIN REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS join_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    move_in_date VARCHAR(30) NOT NULL,
    room_type_preference VARCHAR(30) NULL,
    allocated_room VARCHAR(20) NULL,
    allocated_bed VARCHAR(20) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX ix_join_requests_tenant_id (tenant_id),
    INDEX ix_join_requests_property_id (property_id),
    INDEX ix_join_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PAYMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    billing_month VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    rent_component DECIMAL(10, 2) NOT NULL,
    maintenance_component DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'paid'
    payment_method VARCHAR(50) NULL,
    transaction_ref VARCHAR(100) NULL,
    receipt_id VARCHAR(50) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX ix_payments_invoice_number (invoice_number),
    INDEX ix_payments_tenant_id (tenant_id),
    INDEX ix_payments_property_id (property_id),
    INDEX ix_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. COMPLAINTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_number VARCHAR(50) NOT NULL UNIQUE,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'maintenance',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    resolution_notes TEXT NULL,
    resolved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX ix_complaints_complaint_number (complaint_number),
    INDEX ix_complaints_tenant_id (tenant_id),
    INDEX ix_complaints_property_id (property_id),
    INDEX ix_complaints_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_notifications_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    actor_name VARCHAR(100) NULL,
    actor_role VARCHAR(20) NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(50) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX ix_audit_logs_actor_id (actor_id),
    INDEX ix_audit_logs_action (action),
    INDEX ix_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

