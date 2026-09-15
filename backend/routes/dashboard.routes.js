// routes/dashboardRoutes.js

import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { getDashboardOverview, getDepartmentDashboard, getStaffDashboard } from '../controllers/dashboard.controller.js';


const router = express.Router();


router.get('/department-dashboard', protect, authorize('Department Head'), getDepartmentDashboard);
router.get('/staff-dashboard', protect, authorize('Staff'), getStaffDashboard);
router.get('/overview', protect, authorize('Admin','Store Manager'), getDashboardOverview);

export default router;