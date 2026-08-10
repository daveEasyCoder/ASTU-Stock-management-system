import express from "express";
import { createCategory, getCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js";

const router = express.Router();

router.post("/create-category", createCategory);
router.get("/get-categories", getCategories);
router.get("/get-category/:id", getCategoryById);
router.put("/update-category/:id", updateCategory);



export default router;