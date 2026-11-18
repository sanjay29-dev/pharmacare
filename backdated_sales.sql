-- PharmaCare Phase 7D: Backdated demand test data
-- Run only in your development database.
-- This inserts historical sales records without changing batch stock.

USE pharmacare_db;

START TRANSACTION;

-- Select an existing active medicine and one unexpired batch.
SET @medicine_id = (
    SELECT id
    FROM medicines
    WHERE status = 'ACTIVE'
    ORDER BY id
    LIMIT 1
);

SET @batch_id = (
    SELECT id
    FROM batches
    WHERE medicine_id = @medicine_id
      AND expiry_date >= CURDATE()
      AND quantity > 0
    ORDER BY expiry_date, id
    LIMIT 1
);

SET @price = (
    SELECT selling_price
    FROM batches
    WHERE id = @batch_id
);

-- Stop if suitable test records are unavailable.
-- Check @medicine_id and @batch_id before continuing if either is NULL.
SELECT @medicine_id AS test_medicine_id,
       @batch_id AS test_batch_id,
       @price AS test_selling_price;

-- Sale 1: 1 day ago, quantity 10
INSERT INTO sales
(invoice_number, customer_name, sale_date, subtotal, discount, tax,
 total_amount, status, created_at, updated_at)
VALUES
(CONCAT('TEST-DMD-', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'), '-1'),
 'Demand Test', NOW() - INTERVAL 1 DAY,
 @price * 10, 0, 0, @price * 10, 'COMPLETED', NOW(), NOW());

SET @sale_id = LAST_INSERT_ID();

INSERT INTO sale_items
(sale_id, medicine_id, batch_id, quantity, selling_price, line_total)
VALUES (@sale_id, @medicine_id, @batch_id, 10, @price, @price * 10);

-- Sale 2: 4 days ago, quantity 8
INSERT INTO sales
(invoice_number, customer_name, sale_date, subtotal, discount, tax,
 total_amount, status, created_at, updated_at)
VALUES
(CONCAT('TEST-DMD-', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'), '-2'),
 'Demand Test', NOW() - INTERVAL 4 DAY,
 @price * 8, 0, 0, @price * 8, 'COMPLETED', NOW(), NOW());

SET @sale_id = LAST_INSERT_ID();

INSERT INTO sale_items
(sale_id, medicine_id, batch_id, quantity, selling_price, line_total)
VALUES
(CONCAT('TEST-DMD-', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'), '-3'),
SET @sale_id = LAST_INSERT_ID();
INSERT INTO sale_items
(sale_id, medicine_id, batch_id, quantity, selling_price, line_total)
VALUES (@sale_id, @medicine_id, @batch_id, 12, @price, @price * 12);
-- Sale 4: 16 days ago, quantity 6
INSERT INTO sales
 total_amount, status, created_at, updated_at)
VALUES
(CONCAT('TEST-DMD-', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'), '-4'),
 @price * 6, 0, 0, @price * 6, 'COMPLETED', NOW(), NOW());
SET @sale_id = LAST_INSERT_ID();
INSERT INTO sale_items
(sale_id, medicine_id, batch_id, quantity, selling_price, line_total)
VALUES (@sale_id, @medicine_id, @batch_id, 6, @price, @price * 6);
-- Sale 5: 25 days ago, quantity 9
INSERT INTO sales
(invoice_number, customer_name, sale_date, subtotal, discount, tax,
(CONCAT('TEST-DMD-', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'), '-5'),
 @price * 9, 0, 0, @price * 9, 'COMPLETED', NOW(), NOW());


INSERT INTO sale_items
VALUES (@sale_id, @medicine_id, @batch_id, 9, @price, @price * 9);


-- Verify the inserted test sales.
SELECT s.invoice_number, s.sale_date,
       si.medicine_id, si.quantity
FROM sales s
JOIN sale_items si ON si.sale_id = s.id
WHERE s.customer_name = 'Demand Test'
ORDER BY s.sale_date DESC;COMMIT;
(sale_id, medicine_id, batch_id, quantity, selling_price, line_total)
SET @sale_id = LAST_INSERT_ID();
 'Demand Test', NOW() - INTERVAL 25 DAY,
VALUES
 total_amount, status, created_at, updated_at)



 'Demand Test', NOW() - INTERVAL 16 DAY,
(invoice_number, customer_name, sale_date, subtotal, discount, tax,



 @price * 12, 0, 0, @price * 12, 'COMPLETED', NOW(), NOW());
 'Demand Test', NOW() - INTERVAL 9 DAY,
 total_amount, status, created_at, updated_at)
-- Sale 3: 9 days ago, quantity 12
INSERT INTO sales
(invoice_number, customer_name, sale_date, subtotal, discount, tax,
VALUES (@sale_id, @medicine_id, @batch_id, 8, @price, @price * 8);

