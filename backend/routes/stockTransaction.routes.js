// routes/stockTransactionRoutes.js

import express from 'express';
import { getTransactionsByPurchase } from '../controllers/stockTransaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get transactions by purchase ID
router.get('/get-stock-transactions-by-purchase/:purchaseId', protect, getTransactionsByPurchase);

export default router;