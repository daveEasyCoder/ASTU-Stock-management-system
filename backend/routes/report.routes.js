
import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { getDepartmentReport, getStockReport } from '../controllers/report.controller.js';


const router = express.Router();


router.get('/department-reports', protect, authorize('Department Head'), getDepartmentReport);

// Admin & Store Manager only
router.get('/stock-reports', protect, authorize('Admin', 'Store Manager'), getStockReport);

export default router;