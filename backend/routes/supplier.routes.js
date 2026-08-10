import express from "express";
import { createSupplier, getSupplierById, getSuppliers, updateSupplier } from "../controllers/supplier.controller.js";

const router = express.Router();

router.post("/create-supplier", createSupplier);
router.get("/get-suppliers", getSuppliers);
router.put("/update-supplier/:id", updateSupplier);
router.get("/get-supplier/:id", getSupplierById);


export default router;