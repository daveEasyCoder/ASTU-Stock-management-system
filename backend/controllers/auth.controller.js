
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.js'

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.',
            });
        }

        // 2. Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        // 3. Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.',
            });
        }

        // 4. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'aslk598KDKLSJi4584958sojggj9549dkjgdkfjdlgjdliKJ4954998',
            { expiresIn: '7d' }
        );

        // 6. Set HTTP-only cookie
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: process.env.COOKIE_DOMAIN || undefined,
        });

        const populatedUser = await User.findById(user._id)
            .populate('department', 'name code')
            .select('-password -__v');

        // 8. Return user info
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: {
                id: populatedUser._id,
                fullName: populatedUser.fullName,
                email: populatedUser.email,
                phone: populatedUser.phone,
                role: populatedUser.role,
                department: populatedUser.department,
                profileImage: populatedUser.profileImage,
                isActive: populatedUser.isActive,
            },
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Logout – Clear cookie
 */
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        });
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get current user
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
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
            user,
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * Check if admin exists
 */
export const checkAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'Admin' });
        return res.status(200).json({
            success: true,
            hasAdmin: !!admin,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};