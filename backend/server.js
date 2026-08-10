import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import supplierRoutes from "./routes/supplier.routes.js"
import categoryRoutes from "./routes/category.routes.js";
import itemRoutes from "./routes/item.routes.js";

dotenv.config();
connectDB()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes

app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/suppliers", supplierRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/items",itemRoutes)


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});