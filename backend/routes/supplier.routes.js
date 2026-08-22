import express from "express";
import { createSupplier, getSupplierById, getSuppliers, updateSupplier } from "../controllers/supplier.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-supplier", protect, authorize("Admin","Store Manager"), createSupplier);
router.get("/get-suppliers", protect, authorize("Admin","Store Manager"), getSuppliers);
router.put("/update-supplier/:id", protect, authorize("Admin","Store Manager"), updateSupplier);
router.get("/get-supplier/:id", protect, authorize("Admin","Store Manager"), getSupplierById);


export default router;