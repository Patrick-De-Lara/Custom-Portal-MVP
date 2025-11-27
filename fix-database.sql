-- Fix database index issues
-- Run this in phpMyAdmin or MySQL command line

USE customer_portal;

-- Show all indexes on customers table
SHOW INDEX FROM customers;

-- Drop duplicate indexes (keep only the essential ones)
-- Note: You may need to adjust these based on what SHOW INDEX returns

-- Keep only PRIMARY key and email unique constraint
-- Drop any duplicate email indexes if they exist
ALTER TABLE customers DROP INDEX IF EXISTS email_2;
ALTER TABLE customers DROP INDEX IF EXISTS email_3;
ALTER TABLE customers DROP INDEX IF EXISTS email_4;
ALTER TABLE customers DROP INDEX IF EXISTS email_5;

-- Alternative: If the table is corrupted, you can recreate it
-- (Make sure to backup your data first!)

/*
-- Backup existing data
CREATE TABLE customers_backup AS SELECT * FROM customers;

-- Drop and recreate customers table
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  servicem8_company_uuid VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Restore data
INSERT INTO customers SELECT * FROM customers_backup;

-- Drop backup table
DROP TABLE customers_backup;
*/
