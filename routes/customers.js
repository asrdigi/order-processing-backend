import { Router } from "express";
import pool from "../db/pool.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
const router = Router();


// =============================
// GET ALL CUSTOMERS
// =============================
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // console.log("GET /customers called by user", req.user.username);
    const [rows] = await pool.query(`
    SELECT customer_id, full_name, email, phone
    FROM customers
  `);

  res.json(rows);
  } catch (err) {
    next(err);
  }
});


// =============================
// GET CUSTOMER BY ID
// =============================
router.get("/:id", authenticateToken,async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await pool.query(
      "SELECT customer_id, full_name, email, phone FROM customers WHERE customer_id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});


// =============================
// CREATE CUSTOMER
// =============================
router.post("/", authenticateToken, authorizeRole("ADMIN"),async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    const { full_name, email, phone } = req.body;

    await connection.beginTransaction();

    // Create user with default credentials
    const username = email.split('@')[0];
    const defaultPassword = await import('bcrypt').then(bcrypt => bcrypt.hash('password123', 10));

    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, role) VALUES (?, ?, 'USER')`,
      [username, defaultPassword]
    );

    const userId = userResult.insertId;

    // Create customer with same ID
    await connection.query(
      `INSERT INTO customers (customer_id, full_name, email, phone)
      VALUES (?, ?, ?, ?)`,
      [userId, full_name, email, phone || null]
    );

    await connection.commit();

    res.json({ 
      customer_id: userId,
      full_name,
      email,
      phone
    });

  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    next(err);
  } finally {
    connection.release();
  }
});


// =============================
// UPDATE CUSTOMER
// =============================
router.put("/:id", authenticateToken, authorizeRole("ADMIN"),async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { full_name, email, phone } = req.body;

    const [result] = await pool.query(
      "UPDATE customers SET full_name = ?, email = ?, phone = ? WHERE customer_id = ?",
      [full_name, email, phone || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const [rows] = await pool.query(
      "SELECT customer_id, full_name, email, phone FROM customers WHERE customer_id = ?",
      [id]
    );

    res.json(rows[0]);

  } catch (err) {
    next(err);
  }
});


// =============================
// DELETE CUSTOMER
// =============================
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"),async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.query(
      "DELETE FROM customers WHERE customer_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(204).send();

  } catch (err) {
    next(err);
  }
});


export default router;