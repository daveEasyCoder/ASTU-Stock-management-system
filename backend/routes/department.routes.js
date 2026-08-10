import express from "express";
import { createDepartment, getDepartmentById, getDepartments,updateDepartment } from "../controllers/department.controller.js";

const router = express.Router();

router.post("/create-department", createDepartment);
router.get("/get-departments", getDepartments);
router.get("/get-department/:id", getDepartmentById);
router.put("/update-department/:id", updateDepartment);

export default router;