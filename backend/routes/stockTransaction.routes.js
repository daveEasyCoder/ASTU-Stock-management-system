// routes/stockTransactionRoutes.js

import express from 'express';
import { getAllTransactions, getTransactionById, getTransactionsByPurchase } from '../controllers/stockTransaction.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get transactions by purchase ID
router.get('/get-stock-transactions-by-purchase/:purchaseId', protect, getTransactionsByPurchase);
router.get('/all', protect, getAllTransactions);
router.get('/get/:id',protect, authorize('Store Manager', 'Admin'), getTransactionById);

export default router;