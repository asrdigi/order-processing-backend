import { Router } from "express";
import pool from "../db/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();


// // =============================
// // LOGIN
// // =============================
// router.post("/login", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Username and password required"
//       });
//     }

//     const [rows] = await pool.query(
//       "SELECT username,password FROM users WHERE username = ? AND password = ?",
//       [username, password]
//     );

//     if (rows.length > 0) {
//       return res.json({
//         status: "success",
//         user: rows[0]
//       });
//     }

//     res.status(401).json({
//       status: "failed",
//       message: "Invalid credentials"
//     });

//   } catch (err) {
//     next(err);
//   }
// });


// // =============================
// // REGISTER
// // =============================
// router.post("/register", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Missing fields"
//       });
//     }

//     const [result] = await pool.query(
//       "INSERT INTO users (username, password) VALUES (?, ?)",
//       [username, password]
//     );

//     res.status(201).json({
//       status: "success",
//       message: "User registered successfully"
//     });

//   } catch (err) {

//     if (err.code === "ER_DUP_ENTRY") {
//       return res.status(400).json({
//         status: "failed",
//         message: "User already exists"
//       });
//     }

//     next(err);
//   }
// });


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {

  const { username, password, full_name, email, phone } = req.body;

  if (!username || !password || !full_name || !email) {
    return res.status(400).json({ status: "failed", message: "Missing required fields" });
  }

  const connection = await pool.getConnection();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await connection.beginTransaction();

    // Insert into users
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, role)
       VALUES (?, ?, 'USER')`,
      [username, hashedPassword]
    );

    const userId = userResult.insertId;

    // Insert into customers (AUTO CREATED)
    await connection.query(
      `INSERT INTO customers (customer_id, full_name, email, phone)
       VALUES (?, ?, ?, ?)`,
      [userId, full_name, email, phone || null]
    );

    await connection.commit();

    res.json({ status: "success" });

  } catch (err) {
    await connection.rollback();
    console.error('Registration error:', err);
    res.status(500).json({ status: "failed", message: err.message });
  } finally {
    connection.release();
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0)
      return res.json({ status: "failed", message: "Invalid credentials" });

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ status: "failed", message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
        {
          user_id: user.user_id,
          role: user.role,
          customer_id: user.user_id   // 1–1 mapping
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
        );


    res.json({
      status: "success",
      token
    });

  } catch (err) {
    res.status(500).json({ status: "failed" });
  }
});


// =============================
// GET ALL USERS (Admin)
// =============================
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, created_at FROM users"
    );

    res.json(rows);

  } catch (err) {
    next(err);
  }
});


export default router;