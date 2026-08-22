import User from "../model/user.js";
import bcrypt from "bcryptjs";

/**
 * UPDATE user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone } = req.body;
        const userId = req.user.id;

        // Build update object
        const updateData = {};

        if (fullName !== undefined) {
            if (!fullName.trim() || fullName.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name must be at least 2 characters.',
                });
            }
            updateData.fullName = fullName.trim();
        }

        if (phone !== undefined) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit phone number.',
                });
            }
            updateData.phone = phone.trim();
        }

        // Handle profile image upload
        if (req.file) {
            // Get old image path to delete later
            const oldUser = await User.findById(userId);
            
            // Save new image
            updateData.profileImage = req.file.filename;

            // Delete old image if exists
            if (oldUser && oldUser.profileImage) {
                const oldImagePath = path.join('uploads/profiles', oldUser.profileImage);
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (err) {
                    console.error('Error deleting old profile image:', err);
                }
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('department', 'name code')
        .select('-password -__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user,
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * CHANGE user password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required.',
            });
        }

        // Check if new password matches confirmation
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirmation do not match.',
            });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters.',
            });
        }

        // Get user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully.',
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * REMOVE profile image
 */
export const removeProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Delete image file
        if (user.profileImage) {
            const imagePath = path.join('uploads/profiles', user.profileImage);
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (err) {
                console.error('Error deleting profile image:', err);
            }
        }

        // Remove from database
        user.profileImage = '';
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile image removed successfully.',
            user,
        });

    } catch (error) {
        console.error('Remove Profile Image Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};