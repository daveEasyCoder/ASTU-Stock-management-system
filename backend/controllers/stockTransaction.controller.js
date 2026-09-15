import mongoose from 'mongoose';
import StockTransaction from '../model/stockTransaction.js';

/**
 * GET all stock transactions for a specific purchase
 */
export const getTransactionsByPurchase = async (req, res) => {
    try {
        const { purchaseId } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid purchase ID.',
            });
        }

        // Fetch transactions for this purchase
        const transactions = await StockTransaction.find({ purchase: purchaseId })
            .populate('item', 'name code unit')
            .populate('performedBy', 'fullName email')
            .sort({ transactionDate: -1, createdAt: -1 })
            .lean();

        // Get count
        const total = transactions.length;

        // Calculate summary (optional)
        const totalStockIn = transactions
            .filter(t => t.transactionType === 'Stock In')
            .reduce((sum, t) => sum + t.quantity, 0);

        return res.status(200).json({
            success: true,
            count: total,
            transactions,
            totalStockIn,
        });

    } catch (error) {
        console.error('Get Transactions By Purchase Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


/**
 * GET all stock transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        // Fetch all transactions with populated fields
        const transactions = await StockTransaction.find()
            .populate('item', 'name code unit category')
            .populate('performedBy', 'fullName email')
            .populate('supplier', 'companyName')
            .populate('department', 'name code')
            .populate('purchase', 'invoiceNumber')
            .populate('stockRequest', 'requestNumber')
            .sort({ transactionDate: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });

    } catch (error) {
        console.error('Get All Transactions Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * GET transaction by ID
 */
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID.',
            });
        }

        const transaction = await StockTransaction.findById(id)
            .populate('item', 'name code unit category minimumStockLevel quantity')
            .populate('performedBy', 'fullName email')
            .populate('supplier', 'companyName email phone')
            .populate('department', 'name code')
            .populate('purchase', 'invoiceNumber supplier purchaseDate totalAmount')
            .populate('stockRequest', 'requestNumber requestedBy status');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.',
            });
        }

        return res.status(200).json({
            success: true,
            transaction,
        });

    } catch (error) {
        console.error('Get Transaction By ID Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};