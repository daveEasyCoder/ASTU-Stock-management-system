import express from "express";
import { createUser, getUserById, getUsers, updateUser,resetPassword } from "../controllers/user.controller.js";
import uploadImage from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.put("/update-user/:id", uploadImage("profiles").single("profileImage"), updateUser);
router.get("/get-user/:id", getUserById);
router.post("/reset-password/:id", resetPassword);

export default router;