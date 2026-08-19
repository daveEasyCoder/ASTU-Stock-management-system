// routes/stockTransactionRoutes.js

import express from 'express';
import { getTransactionsByPurchase } from '../controllers/stockTransaction.controller.js';

const router = express.Router();

// Get transactions by purchase ID
router.get('/get-stock-transactions-by-purchase/:purchaseId', getTransactionsByPurchase);

export default router;