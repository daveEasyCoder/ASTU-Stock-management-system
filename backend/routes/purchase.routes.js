import express from "express";
import { createPurchase, getPurchaseById, getPurchases } from "../controllers/purchase.controller.js";
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/create-purchase", protect, createPurchase);
router.get("/get-purchases", protect, getPurchases);
router.get('/get-purchase/:id', protect, getPurchaseById);

export default router;