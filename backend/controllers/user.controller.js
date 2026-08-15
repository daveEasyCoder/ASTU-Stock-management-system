import User from "../model/user.js"
import bcrypt from "bcryptjs";
import validator from "validator";
import Department from "../model/department.js";
import mongoose from "mongoose";


// CREATE USER Admin only
export const createUser = async (req, res) => {
    try {
        let {
            fullName,
            email,
            password,
            phone,
            role,
            department
        } = req.body;

        // Trim and normalize input
        fullName = fullName?.trim();
        email = email?.trim().toLowerCase();
        password = password?.trim();
        phone = phone?.trim();
        role = role?.trim();
        department = department?.trim();

        if (!fullName || !email || !password || !phone || !role) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }

        if (role !== "Admin" && !department) {
            return res.status(400).json({
                success: false,
                message: "Department is required for non-admin users."
            });
        }

        // Email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address",
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Validate role
        const allowedRoles = [
            "Admin",
            "Store Manager",
            "Department Head",
            "Staff"
        ];


        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid user role"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
            });
        }

        // check if phone number already exists
        const existingPhone = await User.findOne({ phone });

        if (existingPhone) {
            return res.status(400).json({
                message: "User with this phone number already exists",
            });
        }

        // Check if department exists when provided
        if (department) {
            const departmentExists = await Department.findById(department);
            if (!departmentExists) {
                return res.status(400).json({
                    message: "Department not found",
                });
            }
            if (!departmentExists.isActive) {
                return res.status(400).json({
                    message: "Cannot assign user to inactive department",
                });
            }
        }

        // **NEW VALIDATION: Check if there's already a Department Head for this department**
        if (role === "Department Head" && department) {
            // Check if any active user with role "Department Head" exists for this department
            const existingDepartmentHead = await User.findOne({
                role: "Department Head",
                department: department,
                isActive: true
            });

            if (existingDepartmentHead) {
                return res.status(400).json({
                    message: `This department already has a Department Head.`,
                    existingHead: {
                        fullName: existingDepartmentHead.fullName,
                        email: existingDepartmentHead.email,
                        phone: existingDepartmentHead.phone
                    }
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Create new user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            role,
            department,
        });


        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });


    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Internal Server error",
            error: error.message,
        });

    }
};



//  GET ALL USER Admin only
export const getUsers = async (req, res) => {
    try {
        const { search, role, isActive } = req.query;

        const users = await User.find()
            .select("-password")
            .populate("department", "name isActive code")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve users.",
            error: error.message,
        });
    }
};


// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Find user and populate department
        const user = await User.findById(id)
            .populate(
                "department",
                "name code description isActive"
            );

        // User not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Error getting user:", error);

        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message,
        });
    }
};

// UPDATE USER 
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;


        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }


        let {
            fullName,
            email,
            phone,
            role,
            department,
            isActive,
        } = req.body;


        const profileImage = req.file ? req.file.filename : "";
        // Trim and normalize input
        fullName = fullName?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();
        role = role?.trim();
        department = department?.trim();



        // Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }



        // Allowed roles
        const allowedRoles = [
            "Admin",
            "Store Manager",
            "Department Head",
            "Staff",
        ];


        // Validate role
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role",
            });
        }



        // Validate email
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }



        // Check duplicate email
        if (email) {

            const existingEmail = await User.findOne({
                email,
                _id: { $ne: id },
            });


            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists for another user",
                });
            }
        }



        // Check duplicate phone
        if (phone) {

            const existingPhone = await User.findOne({
                phone,
                _id: { $ne: id },
            });


            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already exists for another user",
                });
            }
        }



        /*
            Final values
            If field is not provided,
            keep old value
        */

        const finalRole = role || user.role;


        const finalDepartment =
            department !== undefined
                ? department || null
                : user.department;



        const finalIsActive =
            isActive !== undefined
                ? isActive
                : user.isActive;




        // --------------------------------------------
        // Validate Department
        // --------------------------------------------

        if (finalDepartment) {

            if (!mongoose.Types.ObjectId.isValid(finalDepartment)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID",
                });
            }


            const departmentExists =
                await Department.findById(finalDepartment);



            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }



            if (!departmentExists.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign user to inactive department",
                });
            }
        }




        // --------------------------------------------
        // Department requirement by role
        // --------------------------------------------

        if (
            (
                finalRole === "Department Head" ||
                finalRole === "Staff" ||
                finalRole === "Store Manager"
            )
            &&
            !finalDepartment
        ) {

            return res.status(400).json({
                success: false,
                message: `${finalRole} must belong to a department`,
            });
        }




        // --------------------------------------------
        // Department Head validation
        // --------------------------------------------

        if (
            finalRole === "Department Head" &&
            finalDepartment
        ) {


            const existingDepartmentHead =
                await User.findOne({
                    role: "Department Head",
                    department: finalDepartment,
                    isActive: true,
                    _id: { $ne: id },
                });



            if (existingDepartmentHead) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This department already has an active Department Head.",
                    existingHead: {
                        fullName: existingDepartmentHead.fullName,
                        email: existingDepartmentHead.email,
                        phone: existingDepartmentHead.phone,
                    }
                });
            }
        }





        // --------------------------------------------
        // Prepare update data
        // --------------------------------------------

        const updateData = {};


        if (fullName !== undefined) {
            updateData.fullName = fullName;
        }


        if (email !== undefined) {
            updateData.email = email;
        }


        if (phone !== undefined) {
            updateData.phone = phone;
        }


        if (role !== undefined) {
            updateData.role = role;
        }


        if (department !== undefined) {
            updateData.department = finalDepartment;
        }


        if (profileImage !== undefined && profileImage.trim() !== "") {
            updateData.profileImage = profileImage.trim();
        }


        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }




        // Update user

        const updatedUser =
            await User.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            )
                .populate("department", "name code");




        // Remove password
        updatedUser.password = undefined;



        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });



    } catch (error) {

        console.error("Error updating user:", error);


        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message,
        });
    }
};


// RESET PASSWORD only Admin can reset password for other users
export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate a random 6-character temporary password
        const generateTemporaryPassword = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < 8; i++) {
                password += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return password;
        };

        const temporaryPassword = generateTemporaryPassword();

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            temporaryPassword: temporaryPassword,
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message,
        });
    }
};


