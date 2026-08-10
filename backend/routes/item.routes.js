import express from "express";
import { createItem } from "../controllers/item.controller.js";
import uploadItemImage from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create-item", uploadItemImage.single("image"), createItem);



export default router;