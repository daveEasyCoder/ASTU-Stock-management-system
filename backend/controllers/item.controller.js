
import mongoose from "mongoose";
import Item from "../model/item.js";
import Category from "../model/category.js";


// CREATE A NEW ITEM
export const createItem = async (req, res) => {
    try {
        let {
            name,
            code,
            category,
            unit,
            description,
            minimumStockLevel,
        } = req.body;

        // Normalize input
        name = name?.trim();
        code = code?.trim().toUpperCase();
        description = description?.trim();
        const image = req.file ? req.file.filename : "";

        // Validate required fields
        if (!name || !code || !category || !unit) {
            return res.status(400).json({
                success: false,
                message: "Name, code, category, and unit are required.",
            });
        }

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }


        if (minimumStockLevel < 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimum stock level cannot be negative.',
            });
        }
        // Check duplicate item code
        const existingItem = await Item.findOne({ code });

        if (existingItem) {
            return res.status(409).json({
                success: false,
                message: "Item code already exists.",
            });
        }

        // Check category exists and is active
        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        if (!existingCategory.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive category.",
            });
        }

        const units = [
            "Piece",
            "Box",
            "Pack",
            "Kg",
            "Gram",
            "Liter",
            "Meter",
            "Roll",
            "Set",
        ];
        if (!units.includes(unit)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit.",
            });
        }

        // Create item
        const item = await Item.create({
            name,
            code,
            category,
            unit,
            description,
            minimumStockLevel,
            image,
            quantity: 0,
        });

        // Populate references
        await item.populate([
            {
                path: "category",
                select: "name",
            },
        ]);

        return res.status(201).json({
            success: true,
            message: "Item created successfully.",
            item,
        });

    } catch (error) {
        console.error("Create Item Error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Item code already exists.",
            });
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// GET ALL ITEMS
export const getItems = async (req, res) => {
    try {
        const items = await Item.find()
            .populate("category", "name")
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: items.length,
            items,
        });

    } catch (error) {
        console.error("Get Items Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


// GET ITEM BY ID
export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item ID.",
            });
        }

        const item = await Item.findById(id)
            .populate("category", "name")
            .select("-__v");

        // Check if item exists
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found.",
            });
        }

        return res.status(200).json({
            success: true,
            item,
        });

    } catch (error) {
        console.error("Get Item By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate item ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item ID.",
            });
        }

        let {
            name,
            category,
            unit,
            description,
            minimumStockLevel,
            isActive,
        } = req.body;

        // Normalize input
        if (name !== undefined) name = name.trim();
        if (description !== undefined) description = description.trim();

        // Find item
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found.",
            });
        }

        // Validate category if provided
        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID.",
                });
            }

            const existingCategory = await Category.findById(category);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }

            if (!existingCategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign an inactive category.",
                });
            }
        }

        const units = [
            "Piece",
            "Box",
            "Pack",
            "Kg",
            "Gram",
            "Liter",
            "Meter",
            "Roll",
            "Set",
        ];
        if (unit !== undefined && !units.includes(unit)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit.",
            });
        }

        if (req.file) {
            const oldImage = item.image;

            item.image = req.file.filename;

            await item.save();

            // Delete old image after successful update
            if (oldImage) {
                const oldImagePath = path.join("uploads/items", oldImage);

                try {
                    await fs.unlink(oldImagePath);
                } catch (error) {
                    console.error("Failed to delete old image:", error);
                }
            }
        }

        // Update only provided fields
        if (name !== undefined) item.name = name;
        if (category !== undefined) item.category = category;
        if (unit !== undefined) item.unit = unit;
        if (description !== undefined) item.description = description;
        if (minimumStockLevel !== undefined) {
            item.minimumStockLevel = minimumStockLevel;
        }

        if (isActive !== undefined) item.isActive = isActive;

        // Quantity is intentionally NOT updated here.
        // Quantity should be changed through Stock In / Stock Out.

        await item.save();

        // Populate references
        await item.populate([
            {
                path: "category",
                select: "name",
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Item updated successfully.",
            item,
        });

    } catch (error) {
        console.error("Update Item Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Item code already exists.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};



// export const deleteItem = async(req,res) => {}