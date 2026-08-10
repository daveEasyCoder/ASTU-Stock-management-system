import Department from "../model/department.js";
import User from "../model/user.js";
import mongoose from "mongoose";


// CREATE  DEPARTMENT  for Admin only 
export const createDepartment = async (req, res) => {
    try {
        let { name, code, description } = req.body;

        // Trim inputs
        name = name?.trim();
        code = code?.trim().toUpperCase();
        description = description?.trim();

        // Required validation
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required.",
            });
        }

        // Check duplicate name
        const existingName = await Department.findOne({ name });

        if (existingName) {
            return res.status(400).json({
                success: false,
                message: "Department name already exists.",
            });
        }

        // Check duplicate code
        const existingCode = await Department.findOne({ code });

        if (existingCode) {
            return res.status(400).json({
                success: false,
                message: "Department code already exists.",
            });
        }


        // Create department
        const department = await Department.create({
            name,
            code,
            description: description || "",
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully.",
            department,
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to create department.",
            error: error.message,
        });
    }
};


// GET ALL DEPARTMENTS for Admin only
export const getDepartments = async (req, res) => {
    try {

        const departments = await Department.find()
            .sort({ createdAt: -1 })
            .lean();

        // Add user count for each department
        const departmentsWithUsers = await Promise.all(
            departments.map(async (department) => {

                const userCount = await User.countDocuments({
                    department: department._id,
                    isActive: true
                });


                return {
                    ...department,
                    userCount,
                };

            })
        );



        res.status(200).json({
            success: true,
            count: departmentsWithUsers.length,
            departments: departmentsWithUsers,
        });



    } catch (error) {

        console.error("Error fetching departments:", error);


        res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            error: error.message,
        });
    }
};


// Get Department By ID for Admin only
export const getDepartmentById = async (req, res) => {
    try {

        const { id } = req.params;


        // Validate department ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }



        // Find department
        const department = await Department.findById(id)
            .lean();



        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }



        // Get users in this department
        const users = await User.find({
            department: id,
        })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();



        res.status(200).json({
            success: true,
            department: {
                ...department,
                userCount: users.length,
                users,
            },
        });



    } catch (error) {

        console.error("Error fetching department:", error);


        res.status(500).json({
            success: false,
            message: "Failed to fetch department",
            error: error.message,
        });
    }
};


// UPDATE DEPARTMENT for admin only
export const updateDepartment = async (req, res) => {
    try {

        const { id } = req.params;


        // Validate department ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }


        let {
            name,
            code,
            description,
            isActive
        } = req.body;



        // Trim and normalize input
        name = name?.trim();
        code = code?.trim().toUpperCase();
        description = description?.trim();



        // Find department
        const department = await Department.findById(id);


        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }



        // Check duplicate name
        if (name) {

            const existingName = await Department.findOne({
                name,
                _id: { $ne: id }
            });


            if (existingName) {
                return res.status(400).json({
                    success: false,
                    message: "Department name already exists",
                });
            }
        }



        // Check duplicate code
        if (code) {

            const existingCode = await Department.findOne({
                code,
                _id: { $ne: id }
            });


            if (existingCode) {
                return res.status(400).json({
                    success: false,
                    message: "Department code already exists",
                });
            }
        }



        // Prepare update data
        const updateData = {};


        if (name !== undefined) {
            updateData.name = name;
        }


        if (code !== undefined) {
            updateData.code = code;
        }


        if (description !== undefined) {
            updateData.description = description;
        }


        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }



        // Update department
        const updatedDepartment =
            await Department.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );



        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department: updatedDepartment,
        });



    } catch (error) {

        console.error("Error updating department:", error);


        res.status(500).json({
            success: false,
            message: "Failed to update department",
            error: error.message,
        });
    }
};


// export const deleteDepartment = async (req, res) => { }