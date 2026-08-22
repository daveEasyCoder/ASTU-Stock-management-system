import express from "express";
import { createCategory, getCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-category", protect, createCategory);
router.get("/get-categories", protect, getCategories);
router.get("/get-category/:id", protect, getCategoryById);
router.put("/update-category/:id", protect, updateCategory);



export default router;