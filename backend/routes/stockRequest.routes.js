import express from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { approveStockRequest, cancelRequest, createStockRequest, getAllRequests, getDepartmentRequests, getMyRequests, getPendingApprovals, getStockRequestById, issueStockRequest, rejectStockRequest } from "../controllers/stockRequest.controller.js";

const router = express.Router();

router.post("/create-request", protect, authorize("Staff", "Department Head"), createStockRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/cancel-my-request/:id', protect, cancelRequest);
router.get('/request-detail/:id', protect, authorize("Staff", "Department Head","Admin","Store Manager"), getStockRequestById);

// Admin/Store manager only routes
router.get('/all-requests', protect, authorize("Admin", "Store Manager"), getAllRequests);
router.put('/issue-request/:id', protect, authorize("Admin", "Store Manager"), issueStockRequest);

// Department Head routes
router.get('/pending-approvals', protect, authorize('Department Head'), getPendingApprovals);
router.put('/approve/:id', protect, authorize('Department Head'), approveStockRequest);
router.put('/reject/:id', protect, authorize('Department Head'), rejectStockRequest);
router.get('/department-requests', protect, authorize('Department Head'), getDepartmentRequests);

export default router;