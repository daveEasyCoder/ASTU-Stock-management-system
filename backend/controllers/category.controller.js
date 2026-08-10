import Category from "../model/category.js";
import mongoose from "mongoose";


// CREATE CATEGORY for Admin/store Manager
export const createCategory = async (req, res) => {
    try {
        let { name, description } = req.body;

        // Normalize input
        name = name?.trim();
        description = description?.trim();

        // Validate required field
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required.",
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists.",
            });
        }

        // Create category
        const category = await Category.create({
            name,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category,
        });
    } catch (error) {
        console.error("Create Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// GET ALL CATEGORIES for Admin/store Manager
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });

    } catch (error) {
        console.error("Get Categories Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// GET SINGLE CATEGORY BY ID for Admin/store Manager
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }

        const category = await Category.findById(id).select("-__v");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        return res.status(200).json({
            success: true,
            category,
        });

    } catch (error) {
        console.error("Get Category By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// UPDATE CATEGORY for Admin/store Manager
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }

        let {
            name,
            description,
            isActive,
        } = req.body;

        // Normalize input
        if (name) name = name.trim();
        if (description) description = description.trim();

        // Check if category exists
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        // Check duplicate category name
        if (name) {
            const existingCategory = await Category.findOne({
                name,
                _id: { $ne: id },
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Category name already exists.",
                });
            }
        }

        // Update only provided fields
        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category,
        });

    } catch (error) {
        console.error("Update Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// export const deleteCategory = async(req,res) => {}