import express from "express";
import { checkAdmin, getMe, login, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post('/login', login);
router.post('/logout', logout);
router.get('/check-admin', checkAdmin);

// Protected routes
router.get('/me', protect, getMe);

export default router;