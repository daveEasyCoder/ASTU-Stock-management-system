import express from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { approveStockRequest, cancelRequest, createStockRequest, getDepartmentRequests, getMyRequests, getPendingApprovals, getStockRequestById, rejectStockRequest } from "../controllers/stockRequest.controller.js";

const router = express.Router();

router.post("/create-request", protect, authorize("Staff","Department Head"), createStockRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/cancel-my-request/:id', protect, cancelRequest);
router.get('/request-detail/:id', protect, getStockRequestById);

// Department Head routes
router.get('/pending-approvals', protect, authorize('Department Head'), getPendingApprovals);
router.put('/approve/:id', protect, authorize('Department Head'), approveStockRequest);
router.put('/reject/:id', protect, authorize('Department Head'), rejectStockRequest);
router.get('/department-requests', protect, authorize('Department Head'), getDepartmentRequests); 

export default router;