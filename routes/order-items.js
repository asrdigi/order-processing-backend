import { Router } from "express";
import pool from "../db/pool.js";
import { authenticateToken } from "../middleware/authMiddleware.js";    

const router = Router();

// GET all items for an order
// http://localhost:3000/api/v1/order-items/1
router.get("/:orderId", async (req, res) => {
  try {
    console.log("GET order items called for user ", req.user);
    console.log("GET order items called for", req.params.orderId);
    
    const orderId = req.params.orderId;
    
    const [rows] = await pool.query(
      `SELECT oi.id, oi.quantity, oi.price_at_purchase,
              p.name AS productName
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ status: "failed" });
  }
});

export default router;