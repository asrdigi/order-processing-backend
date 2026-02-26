import { Router } from "express";
import pool from "../db/pool.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = Router();

/* ==============================
   GET ALL ORDERS
   http://localhost:3000/api/v1/orders
================================ */
// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     console.log("GET /orders called by user", req.user.username);
//     const [rows] = await pool.query(`
//       SELECT id, customer_id, total_amount, status, order_date
//       FROM orders
//       ORDER BY id DESC
//     `);

//     res.json(rows);

//   } catch (err) {
//     res.status(500).json({ status: "failed", error: err.message });
//   }
// });



router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("GET /orders - Fetching orders for user:", req.user.customer_id);

    // ADMIN → all orders
    if (req.user.role === "ADMIN") {
      const [rows] = await pool.query(`
     SELECT o.order_id, o.total_amount, o.status, o.order_date,
            c.full_name
     FROM orders o
     JOIN customers c ON o.customer_id = c.customer_id ORDER BY o.order_id DESC
   `);

      return res.json(rows);

    }

    // USER → only his orders
    // USER → only his orders
    const [rows] = await pool.query(
      `SELECT order_id, total_amount, status, order_date
    FROM orders
    WHERE customer_id = ? ORDER BY order_id DESC`,
      [req.user.customer_id]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/* ==============================
   CREATE ORDER
================================ */
router.post("/", authenticateToken, async (req, res) => {

  const connection = await pool.getConnection();

  try {
    const { items } = req.body;

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_id, order_date) VALUES (?, NOW())`,
      [req.user.customer_id]
    );

    const orderId = orderResult.insertId;
    let totalAmount = 0;

    for (const item of items) {

      const [product] = await connection.query(
        `SELECT price FROM products WHERE product_id = ?`,
        [item.productId]
      );

      const price = product[0].price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      await connection.query(
        `INSERT INTO order_items
        (order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, price]
      );
    }

    await connection.query(
      `UPDATE orders SET total_amount = ? WHERE order_id = ?`,
      [totalAmount, orderId]
    );

    await connection.commit();

    res.json({ status: "success", order_id: orderId });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});


router.put(
  "/:order_id/status",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {

    await pool.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [req.body.status, req.params.order_id]
    );

    res.json({ message: "Status updated" });
  });

/* ==============================
   TEST ENDPOINT - Verify deployment
================================ */
router.get("/test-delete-route", (req, res) => {
  res.json({ message: "DELETE route is deployed", timestamp: new Date().toISOString() });
});

/* ==============================
   DELETE ORDER
================================ */
router.delete("/:order_id", authenticateToken, async (req, res) => {
  try {
    console.log('DELETE /orders/:order_id called');
    console.log('User:', req.user);
    console.log('Order ID from params:', req.params.order_id);

    const [result] = await pool.query(
      `DELETE FROM orders WHERE order_id = ?`,
      [req.params.order_id]
    );

    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error('Error in DELETE /orders/:order_id:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ==============================
   GET ORDER ITEMS
================================ */
router.get("/:order_id/items", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT oi.order_item_id as id, oi.quantity, oi.price_at_purchase,
              p.name as productName
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [req.params.order_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




export default router;
