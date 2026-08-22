
import jwt from 'jsonwebtoken';
import User from '../model/user.js';

export const protect = async (req, res, next) => {
    try {
        // 1. Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.',
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aslk598KDKLSJi4584958sojggj9549dkjgdkfjdlgjdliKJ4954998');

        // 3. Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. Please contact administrator',
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        
        // Clear invalid cookie
        res.clearCookie('token');
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Invalid token.',
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role} cannot perform this action.`,
            });
        }

        next();
    };
};