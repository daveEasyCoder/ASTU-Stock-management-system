import Item from "../model/item.js";
import StockRequest from "../model/stockRequest.js";
import User from "../model/user.js";
import Category from "../model/category.js"
import Supplier from "../model/supplier.js"
import Department from "../model/department.js"
import Purchase from "../model/purchase.js"
import StockTransaction from "../model/stockTransaction.js"


/**
 * GET Department Dashboard Statistics
 */
export const getDepartmentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only Department Head can access
        if (userRole !== 'Department Head') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Department Head only.',
            });
        }

        // Get user with department
        const user = await User.findById(userId).populate('department', 'name code');
        if (!user || !user.department) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to a department.',
            });
        }

        const departmentId = user.department._id;

        // 1. Request statistics
        const totalRequests = await StockRequest.countDocuments({ department: departmentId });
        const pendingRequests = await StockRequest.countDocuments({
            department: departmentId,
            status: 'Pending'
        });
        const approvedRequests = await StockRequest.countDocuments({
            department: departmentId,
            status: 'Approved'
        });
        const rejectedRequests = await StockRequest.countDocuments({
            department: departmentId,
            status: 'Rejected'
        });
        const issuedRequests = await StockRequest.countDocuments({
            department: departmentId,
            status: 'Issued'
        });

        // 2. Recent requests (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRequests = await StockRequest.find({
            department: departmentId,
            createdAt: { $gte: sevenDaysAgo }
        })
        .populate('requestedBy', 'fullName email')
        .populate('requestedItems.item', 'name code unit')
        .sort({ createdAt: -1 })
        .limit(10);

        // 3. Pending approvals (for quick action)
        const pendingApprovals = await StockRequest.find({
            department: departmentId,
            status: 'Pending'
        })
        .populate('requestedBy', 'fullName email')
        .populate('requestedItems.item', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

        // 4. Staff count in department
        const staffCount = await User.countDocuments({
            department: departmentId,
            isActive: true,
            role: { $in: ['Staff', 'Department Head'] }
        });

        // 5. Low stock items (from department's requests)
        const departmentItems = await StockRequest.find({
            department: departmentId,
            status: 'Issued'
        })
        .populate('requestedItems.item')
        .lean();

        const itemIds = new Set();
        departmentItems.forEach(req => {
            req.requestedItems.forEach(item => {
                if (item.item) itemIds.add(item.item._id.toString());
            });
        });

        const lowStockItems = await Item.countDocuments({
            _id: { $in: Array.from(itemIds) },
            isActive: true,
            $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
        });

        return res.status(200).json({
            success: true,
            department: user.department,
            stats: {
                totalRequests,
                pending: pendingRequests,
                approved: approvedRequests,
                rejected: rejectedRequests,
                issued: issuedRequests,
                staffCount,
                lowStockItems,
            },
            recentRequests,
            pendingApprovals,
        });

    } catch (error) {
        console.error('Department Dashboard Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};




export const getStaffDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's requests
        const requests = await StockRequest.find({ requestedBy: userId })
            .populate('requestedItems.item', 'name code unit')
            .sort({ createdAt: -1 });

        // Stats
        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'Pending').length,
            approved: requests.filter(r => r.status === 'Approved').length,
            rejected: requests.filter(r => r.status === 'Rejected').length,
            issued: requests.filter(r => r.status === 'Issued').length,
        };

        // Recent requests (last 5)
        const recentRequests = requests.slice(0, 5);

        return res.status(200).json({
            success: true,
            stats,
            recentRequests,
        });

    } catch (error) {
        console.error('Staff Dashboard Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * GET dashboard data based on user role
 */
export const getDashboardOverview = async (req, res) => {
    try {
        
        const userRole = req.user.role;
    
        const dashboardData = { role: userRole };

        // --- Common Data for All Roles ---
        const totalItems = await Item.countDocuments({ isActive: true });
        const totalCategories = await Category.countDocuments({ isActive: true });
        const totalSuppliers = await Supplier.countDocuments({ isActive: true });
        const totalDepartments = await Department.countDocuments({ isActive: true });

        // Stock stats
        const totalStock = await Item.aggregate([
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        const lowStockItems = await Item.countDocuments({
            isActive: true,
            $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
        });

        const outOfStockItems = await Item.countDocuments({
            isActive: true,
            quantity: 0
        });

        // --- Admin Specific Data ---
        if (userRole === 'Admin') {
            // User stats
            const totalUsers = await User.countDocuments({ isActive: true });
            const usersByRole = await User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            // Request stats (global)
            const pendingRequests = await StockRequest.countDocuments({ status: 'Pending' });
            const approvedRequests = await StockRequest.countDocuments({ status: 'Approved' });
            const rejectedRequests = await StockRequest.countDocuments({ status: 'Rejected' });
            const issuedRequests = await StockRequest.countDocuments({ status: 'Issued' });

            // Purchase stats
            const totalPurchases = await Purchase.countDocuments();
            const totalPurchaseAmount = await Purchase.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]);

            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentRequests = await StockRequest.find({
                createdAt: { $gte: sevenDaysAgo }
            })
            .populate('requestedBy', 'fullName')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code')
            .sort({ createdAt: -1 })
            .limit(5);

            const recentTransactions = await StockTransaction.find({
                transactionDate: { $gte: sevenDaysAgo }
            })
            .populate('item', 'name code')
            .populate('performedBy', 'fullName')
            .sort({ transactionDate: -1 })
            .limit(5);

            dashboardData.stats = {
                totalUsers,
                totalItems,
                totalCategories,
                totalSuppliers,
                totalDepartments,
                usersByRole,
                stock: {
                    totalQuantity: totalStock[0]?.total || 0,
                    lowStock: lowStockItems,
                    outOfStock: outOfStockItems,
                },
                requests: {
                    pending: pendingRequests,
                    approved: approvedRequests,
                    rejected: rejectedRequests,
                    issued: issuedRequests,
                    total: pendingRequests + approvedRequests + rejectedRequests + issuedRequests,
                },
                purchases: {
                    total: totalPurchases,
                    totalAmount: totalPurchaseAmount[0]?.total || 0,
                },
                recentActivity: {
                    requests: recentRequests,
                    transactions: recentTransactions,
                },
            };
        }

        // --- Store Manager Specific Data ---
        if (userRole === 'Store Manager') {
            // Request stats (global)
            const pendingRequests = await StockRequest.countDocuments({ status: 'Pending' });
            const approvedRequests = await StockRequest.countDocuments({ status: 'Approved' });
            const issuedRequests = await StockRequest.countDocuments({ status: 'Issued' });

            // Pending issuance (approved requests waiting to be issued)
            const pendingIssuance = await StockRequest.find({
                status: 'Approved'
            })
            .populate('requestedBy', 'fullName')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code unit')
            .sort({ createdAt: -1 })
            .limit(10);

            // Recent issuances (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentIssuances = await StockRequest.find({
                status: 'Issued',
                issuedDate: { $gte: sevenDaysAgo }
            })
            .populate('requestedBy', 'fullName')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code')
            .sort({ issuedDate: -1 })
            .limit(5);

            // Low stock items (for alerts)
            const lowStockItemsList = await Item.find({
                isActive: true,
                $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
            })
            .populate('category', 'name')
            .sort({ quantity: 1 })
            .limit(5);

            dashboardData.stats = {
                totalItems,
                stock: {
                    totalQuantity: totalStock[0]?.total || 0,
                    lowStock: lowStockItems,
                    outOfStock: outOfStockItems,
                },
                requests: {
                    pending: pendingRequests,
                    approved: approvedRequests,
                    issued: issuedRequests,
                },
            };
            dashboardData.pendingIssuance = pendingIssuance;
            dashboardData.recentIssuances = recentIssuances;
            dashboardData.lowStockItems = lowStockItemsList;
        }

        return res.status(200).json({
            success: true,
            data: dashboardData,
        });

    } catch (error) {
        console.error('Dashboard Overview Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};