import express from "express";
import { createUser, getUserById, getUsers, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.put("/update-user/:id", updateUser);
router.get("/get-user/:id", getUserById);

export default router;