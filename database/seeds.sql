-- =============================================================================
-- StayEase Database Initial Seed Data
-- =============================================================================

USE stayease_db;

-- -----------------------------------------------------------------------------
-- 1. SEED USERS (Password for all accounts is 'password123')
-- Bcrypt hash: $2b$12$Z0bCknuXm/yJq/T6cO1eGeTfFv9yT4uM4J8yQhL2v2D5gI3tqM3nK
-- -----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, name, role, phone, avatar, kyc_status, status)
VALUES 
(1, 'superadmin@stayease.com', '$2b$12$Z0bCknuXm/yJq/T6cO1eGeTfFv9yT4uM4J8yQhL2v2D5gI3tqM3nK', 'Vikramaditya Rao', 'super_admin', '+91 98000 11223', 'VR', 'verified', 'active'),
(2, 'admin@stayease.com', '$2b$12$Z0bCknuXm/yJq/T6cO1eGeTfFv9yT4uM4J8yQhL2v2D5gI3tqM3nK', 'Priya Nair', 'admin', '+91 98999 88776', 'PN', 'verified', 'active'),
(3, 'rajesh.verma@stayliving.com', '$2b$12$Z0bCknuXm/yJq/T6cO1eGeTfFv9yT4uM4J8yQhL2v2D5gI3tqM3nK', 'Rajesh Verma', 'owner', '+91 98111 22334', 'RV', 'verified', 'active'),
(4, 'rohan.sharma@example.com', '$2b$12$Z0bCknuXm/yJq/T6cO1eGeTfFv9yT4uM4J8yQhL2v2D5gI3tqM3nK', 'Rohan Sharma', 'tenant', '+91 98765 43210', 'RS', 'verified', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- -----------------------------------------------------------------------------
-- 2. SEED PROPERTIES
-- -----------------------------------------------------------------------------
INSERT INTO properties (
    id, owner_id, name, description, city, locality, address, gender_policy,
    monthly_rent, deposit, deposit_months, notice_period_days, rating, reviews_count,
    verified, cover_image, images, amenities, house_rules, total_beds, vacant_beds,
    is_available, food_included, food_type, ac_available
) VALUES 
(
    1, 3, 'GreenLeaf Luxury Coliving & PG',
    'Premium techie living with high-speed fiber & gourmet dining',
    'Bangalore', 'Koramangala 4th Block',
    'Plot 88, 17th Main Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    'unisex', 12500.00, 25000.00, 2, 30, 4.85, 42, 1,
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"]',
    '["High-Speed Wi-Fi (300 Mbps)", "24x7 Power Backup", "Daily Housekeeping", "Biometric Door Lock", "CCTV Surveillance", "Fitness Gym"]',
    '["Visitor entry allowed until 9:30 PM", "No smoking in rooms"]',
    48, 6, 1, 1, 'veg_and_non_veg', 1
),
(
    2, 3, 'UrbanNest Executive PG for Men',
    'Walk to IT park, peaceful atmosphere and homestyle meals',
    'Pune', 'Hinjawadi Phase 1',
    'Opposite Tech Mahindra Gate 2, Hinjawadi Phase 1, Pune, Maharashtra 411057',
    'male', 8500.00, 17000.00, 2, 30, 4.70, 28, 1,
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"]',
    '["High-Speed Wi-Fi", "24x7 Power Backup", "Daily Housekeeping"]',
    '["Gate closed from 11:00 PM"]',
    32, 4, 1, 1, 'veg_and_non_veg', 1
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- -----------------------------------------------------------------------------
-- 3. SEED ROOMS & BEDS
-- -----------------------------------------------------------------------------
INSERT INTO rooms (id, property_id, room_number, room_type, sharing_capacity, rent, ac_available, floor)
VALUES (1, 1, '101', 'single', 1, 16000.00, 1, 1)
ON DUPLICATE KEY UPDATE room_number=VALUES(room_number);

INSERT INTO beds (id, room_id, bed_code, availability_status, monthly_rent)
VALUES (1, 1, 'A', 'occupied', 16000.00)
ON DUPLICATE KEY UPDATE bed_code=VALUES(bed_code);

-- -----------------------------------------------------------------------------
-- 4. SEED JOIN REQUESTS
-- -----------------------------------------------------------------------------
INSERT INTO join_requests (id, tenant_id, property_id, status, move_in_date, room_type_preference, allocated_room, allocated_bed, notes)
VALUES (1, 4, 1, 'approved', '2025-01-01', 'single', '101', 'A', 'Preferred quiet room on 1st floor')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- -----------------------------------------------------------------------------
-- 5. SEED PAYMENTS
-- -----------------------------------------------------------------------------
INSERT INTO payments (id, invoice_number, tenant_id, property_id, billing_month, amount, rent_component, maintenance_component, due_date, paid_date, status, payment_method, transaction_ref, receipt_id)
VALUES (1, 'INV-202501-1001', 4, 1, 'January 2025', 16000.00, 15000.00, 1000.00, '2025-01-05', '2025-01-04', 'paid', 'UPI', 'UPI/9876543210/PAY', 'RCP-202501-8842')
ON DUPLICATE KEY UPDATE status=VALUES(status);
