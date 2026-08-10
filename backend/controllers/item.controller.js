
import mongoose from "mongoose";

export const createItem = async (req, res) => {
    try {
        let {
            name,
            code,
            category,
            supplier,
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

        // Validate supplier ID if provided
        if (supplier && !mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID.",
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

        // Check supplier exists and is active if provided
        if (supplier) {
            const existingSupplier = await Supplier.findById(supplier);

            if (!existingSupplier) {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found.",
                });
            }

            if (!existingSupplier.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign an inactive supplier.",
                });
            }
        }

        // Create item
        const item = await Item.create({
            name,
            code,
            category,
            supplier,
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
            {
                path: "supplier",
                select: "companyName",
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

export const getItems = async(req,res) => {}

export const getItemById = async(req,res) => {}

export const updateItem = async(req,res) => {}

export const deleteItem = async(req,res) => {}

export const searchItems = async(req,res) => {}

export const getLowStockItems = async(req,res) => {}