import express from "express";
import cors from "cors";
import customers from "./routes/customers.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import users from "./routes/users.js";
import orderItems from "./routes/order-items.js";
import dotenv from "dotenv";

dotenv.config();


const app = express();


app.set('etag', false);

// Middleware, allow all origins
app.use(cors());


// app.use(cors({
//   origin: 'http://localhost:4200',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type']
// }));


app.use(express.json());

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));