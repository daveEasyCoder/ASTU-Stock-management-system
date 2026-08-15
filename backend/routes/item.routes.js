import express from "express";
import { createItem, getItemById, getItems, updateItem } from "../controllers/item.controller.js";
import uploadImage from "../middleware/upload.middleware.js";


const router = express.Router();

router.post("/create-item", uploadImage("items").single("image"), createItem);
router.get("/get-items", getItems);
router.get("/get-item/:id", getItemById);
router.put("/update-item/:id", uploadImage("items").single("image"), updateItem);



export default router;