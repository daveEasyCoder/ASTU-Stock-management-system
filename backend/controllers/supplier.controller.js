import Supplier from "../model/supplier.js";
import mongoose from "mongoose";
import validator from "validator";

// @access  Private (Admin/Store Manager)
export const createSupplier = async (req, res) => {
    try {
        const { companyName, contactPerson, phone, email, address } = req.body;

        // Basic required-field validation
        if (!companyName || !contactPerson || !phone || !email || !address) {
            return res.status(400).json({
                success: false,
                message:
                    "companyName, contactPerson, phone, email, and address are all required.",
            });
        }

        // Optional: basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const existingEmail = await Supplier.findOne({ email: email.trim().toLowerCase() });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists.",
            });
        }
        // Check for existing supplier with the same company name (case-insensitive)
        const existingSupplier = await Supplier.findOne({
            companyName: { $regex: `^${companyName.trim()}$`, $options: "i" },
        });

        if (existingSupplier) {
            return res.status(409).json({
                success: false,
                message: "A supplier with this company name already exists.",
            });
        }

        const supplier = await Supplier.create({
            companyName,
            contactPerson,
            phone,
            email,
            address,
        });

        return res.status(201).json({
            success: true,
            message: "Supplier created successfully.",
            data: supplier,
        });
    } catch (error) {
        // Handle duplicate key error from unique index (race condition safety net)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A supplier with this company name already exists.",
            });
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }

        console.error("Error creating supplier:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating supplier.",
        });
    }
};


// Get all suppliers (Admin/Store Manager)
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: suppliers.length,
            suppliers,
        });
    } catch (error) {
        console.error("Get suppliers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch suppliers",
        });
    }
};

// Get supplier by ID (Admin/Store Manager)
export const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID.",
            });
        }

        const supplier = await Supplier.findById(id).select("-__v");

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found.",
            });
        }

        return res.status(200).json({
            success: true,
            supplier,
        });
    } catch (error) {
        console.error("Get Supplier By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// update supplier by (Admin/Store Manager)
export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID.",
            });
        }

        let {
            companyName,
            contactPerson,
            phone,
            email,
            address,
            isActive,
        } = req.body;

        // Normalize input
        if (companyName) companyName = companyName.trim();
        if (contactPerson) contactPerson = contactPerson.trim();
        if (phone) phone = phone.trim();
        if (email) email = email.trim().toLowerCase();
        if (address) address = address.trim();

        if(email){
            if(!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address.",
                });
            }
        }
        
        // Check if supplier exists
        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found.",
            });
        }

        // Check duplicate company name
        if (companyName) {
            const existingCompany = await Supplier.findOne({
                companyName,
                _id: { $ne: id },
            });

            if (existingCompany) {
                return res.status(409).json({
                    success: false,
                    message: "Company name already exists.",
                });
            }
        }

        // Check duplicate email
        if (email) {
            const existingEmail = await Supplier.findOne({
                email,
                _id: { $ne: id },
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists.",
                });
            }
        }

        // Update only provided fields
        if (companyName !== undefined) supplier.companyName = companyName;
        if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
        if (phone !== undefined) supplier.phone = phone;
        if (email !== undefined) supplier.email = email;
        if (address !== undefined) supplier.address = address;
        if (isActive !== undefined) supplier.isActive = isActive;

        await supplier.save();

        return res.status(200).json({
            success: true,
            message: "Supplier updated successfully.",
            supplier,
        });
    } catch (error) {
        console.error("Update Supplier Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
