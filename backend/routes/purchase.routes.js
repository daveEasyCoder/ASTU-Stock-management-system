import express from "express";
import { createPurchase, getPurchaseById, getPurchases } from "../controllers/purchase.controller.js";


const router = express.Router();

router.post("/create-purchase", createPurchase);
router.get("/get-purchases", getPurchases);
router.get('/get-purchase/:id', getPurchaseById);

export default router;