import mongoose from 'mongoose';
import User from '../model/user.js'
import Item from '../model/item.js'
import StockRequest from '../model/stockRequest.js';
import StockTransaction from '../model/stockTransaction.js'



const generateRequestNumber = async () => {
    const year = new Date().getFullYear();

    // Find the highest request number for this year
    const lastRequest = await StockRequest.findOne({
        requestNumber: { $regex: `^SR-${year}-` }
    }).sort({ requestNumber: -1 });

    let nextNumber = 1;
    if (lastRequest) {
        // Extract the numeric part from SR-2026-0002 → 2
        const parts = lastRequest.requestNumber.split('-');
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
        }
    }

    const padded = String(nextNumber).padStart(4, '0');
    return `SR-${year}-${padded}`;
};


/**
 * Create stock request
 * POST /api/stock-requests/create
 */
export const createStockRequest = async (req, res) => {
    try {
        const { requestedItems, remarks } = req.body;
        const userId = req.user.id;

        // 1. Validate user exists and has department
        const user = await User.findById(userId).populate('department', 'name');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (!user.department) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to a department. Please contact administrator.',
            });
        }

        // 2. Validate items
        if (!requestedItems || !Array.isArray(requestedItems) || requestedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required.',
            });
        }

        // Check for duplicate items
        const itemIds = requestedItems.map(item => item.item).filter(id => id);
        const uniqueIds = new Set(itemIds.map(id => id.toString()));
        if (itemIds.length !== uniqueIds.size) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate items are not allowed.',
            });
        }

        // Validate each item
        const validatedItems = [];
        for (const [index, itemData] of requestedItems.entries()) {
            const { item: itemId, quantity } = itemData;

            if (!itemId) {
                return res.status(400).json({
                    success: false,
                    message: `Item is required at row ${index + 1}.`,
                });
            }

            if (!mongoose.Types.ObjectId.isValid(itemId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid item ID at row ${index + 1}.`,
                });
            }

            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: `Item not found at row ${index + 1}.`,
                });
            }

            if (!item.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot request inactive item: ${item.name}.`,
                });
            }

            if (item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `${item.name} is out of stock.`,
                });
            }

            if (!quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Quantity must be at least 1 at row ${index + 1}.`,
                });
            }

            if (quantity > item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${item.quantity} ${item.unit} available for ${item.name}.`,
                });
            }

            validatedItems.push({
                item: itemId,
                quantity,
            });
        }

        // 3. Generate request number
        const requestNumber = await generateRequestNumber();

        // 4. Create request
        const stockRequest = new StockRequest({
            requestNumber,
            requestedBy: userId,
            department: user.department._id,
            requestedItems: validatedItems,
            remarks: remarks?.trim() || '',
            status: 'Pending',
        });

        await stockRequest.save();

        // 5. Populate response
        const populatedRequest = await StockRequest.findById(stockRequest._id)
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code unit quantity');

        return res.status(201).json({
            success: true,
            message: 'Stock request created successfully.',
            request: populatedRequest,
        });

    } catch (error) {
        console.error('Create Stock Request Error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Request number already exists.',
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * Get my requests
 */
export const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await StockRequest.find({ requestedBy: userId })
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code unit')
            .populate('approvedBy', 'fullName email')
            .populate('issuedBy', 'fullName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });

    } catch (error) {
        console.error('Get My Requests Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Cancel a pending request
 */
export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID.',
            });
        }

        // Find request
        const request = await StockRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found.',
            });
        }

        // Check ownership
        if (request.requestedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own requests.',
            });
        }

        // Check status
        if (request.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request with status: ${request.status}`,
            });
        }

        // Delete the request (or mark as cancelled)
        await StockRequest.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Request cancelled successfully.',
        });

    } catch (error) {
        console.error('Cancel Request Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get stock request by ID
 */
export const getStockRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID.',
            });
        }

        // 2. Find request with populated fields
        const request = await StockRequest.findById(id)
            .populate('requestedBy', 'fullName email phone')
            .populate('department', 'name code')
            .populate('approvedBy', 'fullName email')
            .populate('issuedBy', 'fullName email')
            .populate('requestedItems.item', 'name code unit quantity minimumStockLevel');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found.',
            });
        }

        // 3.Permission check: Owner OR Department Head
        const isOwner = request.requestedBy._id.toString() === userId;
        const isDepartmentHead = userRole === 'Department Head' &&
            request.department._id.toString() === req.user.department?._id?.toString();
        const isStoreManager = userRole === 'Store Manager';
        const isAdmin = userRole === 'Admin';

        // Allow if: Owner, Department Head, Store Manager, or Admin
        if (!isOwner && !isDepartmentHead && !isStoreManager && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this request.',
            });
        }

        return res.status(200).json({
            success: true,
            request,
        });

    } catch (error) {
        console.error('Get Stock Request By ID Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


// controllers/stockRequestController.js

/**
 * GET pending requests for Department Head
 */
export const getPendingApprovals = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user with department
        const user = await User.findById(userId).populate('department', 'name');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (!user.department) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to a department.',
            });
        }

        // 2. Get pending requests from this department
        const requests = await StockRequest.find({
            department: user.department._id,
            status: 'Pending'
        })
            .populate('requestedBy', 'fullName email phone')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code unit quantity')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            department: user.department,
            requests,
        });

    } catch (error) {
        console.error('Get Pending Approvals Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Approve stock request
 */
export const approveStockRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID.',
            });
        }

        // 2. Find request
        const request = await StockRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found.',
            });
        }

        // 3. Check if already approved/rejected/issued
        if (request.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status.toLowerCase()}.`,
            });
        }

        // 4. Check if user is the Department Head of this department
        const user = await User.findById(userId).populate('department', 'name');
        if (!user || !user.department) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to a department.',
            });
        }

        if (request.department.toString() !== user.department._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only approve requests from your department.',
            });
        }

        // 5. Update request status
        request.status = 'Approved';
        request.approvedBy = userId;
        request.approvedDate = new Date();
        await request.save();

        // 6. Populate response
        const populatedRequest = await StockRequest.findById(id)
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name code')
            .populate('approvedBy', 'fullName email')
            .populate('requestedItems.item', 'name code unit quantity');

        return res.status(200).json({
            success: true,
            message: 'Request approved successfully.',
            request: populatedRequest,
        });

    } catch (error) {
        console.error('Approve Stock Request Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Reject stock request
 */
export const rejectStockRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const userId = req.user.id;

        // 1. Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID.',
            });
        }

        // 2. Find request
        const request = await StockRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found.',
            });
        }

        // 3. Check if already approved/rejected/issued
        if (request.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status.toLowerCase()}.`,
            });
        }

        // 4. Check if user is the Department Head of this department
        const user = await User.findById(userId).populate('department', 'name');
        if (!user || !user.department) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to a department.',
            });
        }

        if (request.department.toString() !== user.department._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only reject requests from your department.',
            });
        }

        // 5. Update request status
        request.status = 'Rejected';
        request.rejectionReason = rejectionReason?.trim() || 'No reason provided.';
        await request.save();

        // 6. Populate response
        const populatedRequest = await StockRequest.findById(id)
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name code')
            .populate('requestedItems.item', 'name code unit quantity');

        return res.status(200).json({
            success: true,
            message: 'Request rejected successfully.',
            request: populatedRequest,
        });

    } catch (error) {
        console.error('Reject Stock Request Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * GET all requests from the department of the logged-in user
 */
export const getDepartmentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user with department
        const user = await User.findById(userId).populate('department', 'name code');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (!user.department) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to a department.',
            });
        }

        // 2. Fetch all requests from this department
        const requests = await StockRequest.find({
            department: user.department._id
        })
            .populate('requestedBy', 'fullName email phone')
            .populate('department', 'name code')
            .populate('approvedBy', 'fullName email')
            .populate('issuedBy', 'fullName email')
            .populate('requestedItems.item', 'name code unit quantity')
            .sort({ createdAt: -1 });

        // 3. Calculate statistics
        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'Pending').length,
            approved: requests.filter(r => r.status === 'Approved').length,
            rejected: requests.filter(r => r.status === 'Rejected').length,
            issued: requests.filter(r => r.status === 'Issued').length,
        };

        return res.status(200).json({
            success: true,
            department: user.department,
            stats,
            requests,
        });

    } catch (error) {
        console.error('Get Department Requests Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * GET all requests (Store Manager & Admin only)
 */
export const getAllRequests = async (req, res) => {
    try {
        // Fetch all requests with populated fields
        const requests = await StockRequest.find()
            .populate('requestedBy', 'fullName email phone')
            .populate('department', 'name code')
            .populate('approvedBy', 'fullName email')
            .populate('issuedBy', 'fullName email')
            .populate('requestedItems.item', 'name code unit quantity minimumStockLevel')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });

    } catch (error) {
        console.error('Get All Requests Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Issue stock request (Store Manager only)
 * PUT /api/requests/issue/:id
 */
export const issueStockRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID.',
            });
        }

        // 2. Find request
        const request = await StockRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found.',
            });
        }

        // 3. Check status
        if (request.status === 'Issued') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been issued.',
            });
        }

        if (request.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: `Cannot issue request with status: ${request.status}. Only Approved requests can be issued.`,
            });
        }

        // 4. Check stock availability for each item
        const insufficientItems = [];
        for (const requestedItem of request.requestedItems) {
            const item = await Item.findById(requestedItem.item);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: `Item not found: ${requestedItem.item}`,
                });
            }

            if (item.quantity < requestedItem.quantity) {
                insufficientItems.push({
                    name: item.name,
                    code: item.code,
                    available: item.quantity,
                    requested: requestedItem.quantity,
                    shortfall: requestedItem.quantity - item.quantity,
                });
            }
        }

        if (insufficientItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock for some items.',
                insufficientItems,
            });
        }

        // 5. Decrease item quantities & create transactions
        const transactions = [];
        for (const requestedItem of request.requestedItems) {
            const item = await Item.findById(requestedItem.item);
            item.quantity -= requestedItem.quantity;
            await item.save();

            // Create stock transaction
            const transaction = new StockTransaction({
                item: requestedItem.item,
                transactionType: 'Stock Out',
                quantity: requestedItem.quantity,
                department:request.department,
                stockRequest: request._id,
                performedBy: userId,
                reason: `Issued for request ${request.requestNumber}`,
                transactionDate: new Date(),
            });
            await transaction.save();
            transactions.push(transaction);
        }

        // 6. Update request status
        request.status = 'Issued';
        request.issuedBy = userId;
        request.issuedDate = new Date();
        await request.save();

        // 7. Return response
        const updatedRequest = await StockRequest.findById(id)
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name code')
            .populate('approvedBy', 'fullName email')
            .populate('issuedBy', 'fullName email')
            .populate('requestedItems.item', 'name code unit quantity');

        return res.status(200).json({
            success: true,
            message: 'Stock issued successfully.',
            request: updatedRequest,
            transactions,
        });

    } catch (error) {
        console.error('Issue Stock Request Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};