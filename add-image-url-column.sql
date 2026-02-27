-- Add image_url column to products table
ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

-- Optional: Update existing products with sample image URLs
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' WHERE product_id = 1; -- Laptop
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200' WHERE product_id = 2; -- Smartphone
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' WHERE product_id = 3; -- Headphones
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200' WHERE product_id = 4; -- Keyboard
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200' WHERE product_id = 5; -- Monitor
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=200' WHERE product_id = 10; -- DD5 32GB
