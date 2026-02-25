import express from "express";
import cors from "cors";
import customers from "./routes/customers.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import users from "./routes/users.js";
import orderItems from "./routes/order-items.js";
import pool from "./db/pool.js";
import dotenv from "dotenv";

dotenv.config();


const app = express();


app.set('etag', false);

// CORS Configuration - Allow Vercel frontend
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      /^https:\/\/order-processing-frontend.*\.vercel\.app$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());

// Debug endpoint to check database tables
app.get("/api/debug/tables", async (req, res) => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const tableInfo = {};
    for (const tableName of tableNames) {
      const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      tableInfo[tableName] = rows[0].count;
    }
    
    res.json({
      success: true,
      tables: tableNames,
      counts: tableInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes (versioned)
app.use("/api/v1/customers", customers);
app.use("/api/v1/products", products);
app.use("/api/v1/orders", orders);
app.use("/api/v1/users", users);
app.use("/api/v1/order-items", orderItems);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} - Updated with order_date fix`));// Updated Wed Feb 25 16:42:53 IST 2026
