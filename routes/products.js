import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";  

const router = Router();

router.get('/', authenticateToken,async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products');
  res.json(rows);
});

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {

    const { name, price, stock } = req.body;

    const [result] = await pool.query(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );

    res.json({
      product_id: result.insertId,
      name,
      price,
      stock
    });
});

/* PARTIAL UPDATE */
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {

    const { name, price, stock } = req.body;

    await pool.query(
      "UPDATE products SET name=?, price=?, stock=? WHERE product_id=?",
      [name, price, stock, req.params.id]
    );

    res.json({
      product_id: req.params.id,
      name,
      price,
      stock
    });
});

/* DELETE */
router.delete(
 "/:id",
 authenticateToken,
 authorizeRole("ADMIN"),
 async (req, res) => {
   await pool.query("DELETE FROM products WHERE product_id=?", [req.params.id]);
   res.json({ message: "Product deleted" });
 }
);

export default router;
