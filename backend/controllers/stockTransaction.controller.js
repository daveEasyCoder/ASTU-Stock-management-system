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