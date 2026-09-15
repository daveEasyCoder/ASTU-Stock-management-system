
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import supplierRoutes from "./routes/supplier.routes.js"
import categoryRoutes from "./routes/category.routes.js";
import itemRoutes from "./routes/item.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js"
import stockTransactionRoutes from './routes/stockTransaction.routes.js';
import authRoutes from './routes/auth.routes.js'
import stockRequestRoutes from './routes/stockRequest.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import stockAdjustmentRoutes from './routes/stockAdjustment.routes.js';
import reportRoutes from './routes/report.routes.js'
import profileRoutes from './routes/profile.routes.js'

import cors from "cors";
import path from "path"
import cookieParser from 'cookie-parser';


connectDB()

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://astu-stock-management-t6zb.onrender.com",
];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// Routes

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes)
app.use("/api/purchases", purchaseRoutes)
app.use("/api/purchases", purchaseRoutes)
app.use('/api/stock-transactions', stockTransactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock-requests', stockRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});