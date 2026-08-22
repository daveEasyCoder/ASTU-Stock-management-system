// routes/dashboardRoutes.js

import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { getDepartmentDashboard } from '../controllers/dashboard.controller.js';


const router = express.Router();


router.get('/department-dashboard', protect, authorize('Department Head'), getDepartmentDashboard);

export default router;