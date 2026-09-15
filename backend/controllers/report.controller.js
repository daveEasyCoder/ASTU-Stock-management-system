import Category from "../model/category.js";
import Item from "../model/item.js";
import StockRequest from "../model/stockRequest.js";
import StockTransaction from "../model/stockTransaction.js";
import Supplier from "../model/supplier.js";
import User from "../model/user.js";

/**
 * GET Department Report Data
 */
export const getDepartmentReport = async (req, res) => {
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

        // Fetch ALL requests from this department (no filters)
        const requests = await StockRequest.find({
            department: departmentId
        })
        .populate('requestedBy', 'fullName email phone')
        .populate('requestedItems.item', 'name code unit quantity minimumStockLevel')
        .populate('approvedBy', 'fullName email')
        .populate('issuedBy', 'fullName email')
        .sort({ createdAt: -1 });

        // Get all staff in department
        const staff = await User.find({
            department: departmentId,
            isActive: true,
            role: { $in: ['Staff', 'Department Head'] }
        })
        .select('fullName email phone')
        .lean();

        // Get all items requested by department
        const itemIds = new Set();
        requests.forEach(req => {
            req.requestedItems.forEach(item => {
                if (item.item) itemIds.add(item.item._id.toString());
            });
        });

        const items = await Item.find({
            _id: { $in: Array.from(itemIds) },
            isActive: true
        })
        .populate('category', 'name')
        .lean();

        return res.status(200).json({
            success: true,
            department: user.department,
            requests,
            staff,
            items,
        });

    } catch (error) {
        console.error('Department Report Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * GET Stock Report Data
 */
export const getStockReport = async (req, res) => {
    try {
        // 1. Fetch all items with populated references
        const items = await Item.find()
            .populate('category', 'name code')
            .select('-__v')
            .sort({ createdAt: -1 })
            .lean();

        // 2. Get latest unit price for each item from Stock In transactions
        const itemIds = items.map(i => i._id);

        const latestPrices = await StockTransaction.aggregate([
            {
                $match: {
                    item: { $in: itemIds },
                    transactionType: 'Stock In',
                    unitPrice: { $gt: 0 },
                },
            },
            { $sort: { transactionDate: -1 } },
            {
                $group: {
                    _id: '$item',
                    unitPrice: { $first: '$unitPrice' },
                    lastStockInDate: { $first: '$transactionDate' },
                },
            },
        ]);

        const priceMap = {};
        latestPrices.forEach((p) => {
            priceMap[p._id.toString()] = {
                unitPrice: p.unitPrice,
                lastStockInDate: p.lastStockInDate,
            };
        });

        // 3. Merge latest price into each item and compute stock value
        const itemsWithPrice = items.map((item) => {
            const priceInfo = priceMap[item._id.toString()] || {};
            const unitPrice = priceInfo.unitPrice || 0;
            return {
                ...item,
                latestUnitPrice: unitPrice,
                stockValue: unitPrice * (item.quantity || 0),
                lastStockInDate: priceInfo.lastStockInDate || null,
            };
        });

        // 4. Optionally return list of categories & suppliers to help frontend filters
        const categories = await Category.find({ isActive: true })
            .select('name code')
            .lean();
        const suppliers = await Supplier.find({ isActive: true })
            .select('companyName')
            .lean();

        return res.status(200).json({
            success: true,
            count: itemsWithPrice.length,
            items: itemsWithPrice,
            categories,
            suppliers,
        });
    } catch (error) {
        console.error('Get Stock Report Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};