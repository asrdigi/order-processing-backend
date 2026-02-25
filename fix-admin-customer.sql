-- Add admin user to customers table if not exists
INSERT IGNORE INTO customers (customer_id, full_name, email, phone)
VALUES (5, 'Clarke Gable', 'admin@orderprocessing.com', '9999999999');
