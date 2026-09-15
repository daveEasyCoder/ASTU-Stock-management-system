// routes/stockAdjustmentRoutes.js

import express from 'express';
import { adjustStock } from '../controllers/stockAdjustment.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();


// Admin & Store Manager only
router.post('/adjust', protect, authorize('Admin', 'Store Manager'), adjustStock);

export default router;