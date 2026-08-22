import Item from "../model/item.js";
import StockRequest from "../model/stockRequest.js";
import User from "../model/user.js";


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