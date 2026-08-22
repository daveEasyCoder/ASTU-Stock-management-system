import express from "express";
import { createDepartment, getDepartmentById, getDepartments,updateDepartment } from "../controllers/department.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-department", protect, createDepartment);
router.get("/get-departments", protect, getDepartments);
router.get("/get-department/:id", protect, getDepartmentById);
router.put("/update-department/:id", protect, updateDepartment);

export default router;