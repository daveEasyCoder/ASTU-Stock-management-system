import express from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { changePassword, updateProfile } from "../controllers/profile.controller.js";
import uploadImage from "../middleware/upload.middleware.js";

const router = express.Router();

router.put("/update-profile", protect, authorize("Staff", "Department Head", "Store Manager", "Admin"), uploadImage("profiles").single("image"),  updateProfile);
router.put("/change-password", protect, authorize("Staff", "Department Head", "Store Manager"),  changePassword);


export default router;