import express from "express";
import { createPurchase } from "../controllers/purchase.controller.js";


const router = express.Router();

router.post("/create-purchase", createPurchase);

export default router;