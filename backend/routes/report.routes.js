
import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { getDepartmentReport } from '../controllers/report.controller.js';


const router = express.Router();


router.get('/department-reports', protect, authorize('Department Head'), getDepartmentReport);

export default router;