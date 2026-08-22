import express from "express";
import { createUser, getUserById, getUsers, updateUser,resetPassword } from "../controllers/user.controller.js";
import uploadImage from "../middleware/upload.middleware.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-user", protect, authorize("Admin"), createUser);
router.get("/get-users", protect, authorize("Admin"), getUsers);
router.put("/update-user/:id", protect, authorize("Admin"), uploadImage("profiles").single("profileImage"), updateUser);
router.get("/get-user/:id", protect, authorize("Admin"), getUserById);
router.post("/reset-password/:id", protect, authorize("Admin"), resetPassword);

export default router;