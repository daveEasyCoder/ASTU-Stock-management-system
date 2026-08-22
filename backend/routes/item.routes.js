import express from "express";
import { createItem, getItemById, getItems, updateItem } from "../controllers/item.controller.js";
import uploadImage from "../middleware/upload.middleware.js";
import { authorize, protect } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/create-item", protect, authorize("Admin","Store Manager"), uploadImage("items").single("image"), createItem);
router.get("/get-items", protect, authorize("Admin","Store Manager","Staff","Department Head"), getItems);
router.get("/get-item/:id", protect, authorize("Admin","Store Manager"), getItemById);
router.put("/update-item/:id", protect, authorize("Admin","Store Manager"), uploadImage("items").single("image"), updateItem);



export default router;