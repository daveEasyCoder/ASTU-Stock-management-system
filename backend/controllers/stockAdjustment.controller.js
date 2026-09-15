
import mongoose from 'mongoose';
import StockTransaction from '../model/stockTransaction.js';
import Item from '../model/item.js';


/**
 * Adjust stock (Increase or Decrease)
 */
export const adjustStock = async (req, res) => {
    try {
        const {
            itemId,
            adjustmentType, // 'Increase' or 'Decrease'
            quantity,
            reason,
            remarks,
        } = req.body;

        const userId = req.user.id;

        // 1. Validate input
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'Item is required.',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID.',
            });
        }

        if (!adjustmentType || !['Increase', 'Decrease'].includes(adjustmentType)) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment type must be either "Increase" or "Decrease".',
            });
        }

        const qty = parseInt(quantity, 10);
        if (!qty || qty < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1.',
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reason for adjustment is required.',
            });
        }

        // 2. Find the item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found.',
            });
        }

        if (!item.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot adjust stock for an inactive item.',
            });
        }

        // 3. Check for decrease — cannot go below 0
        if (adjustmentType === 'Decrease' && item.quantity < qty) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${item.quantity} ${item.unit} available for ${item.name}.`,
            });
        }

        // 4. Update item quantity
        const oldQuantity = item.quantity;
        if (adjustmentType === 'Increase') {
            item.quantity += qty;
        } else {
            item.quantity -= qty;
        }
        await item.save();

        // 5. Create Stock Transaction (Adjustment)
        const transaction = new StockTransaction({
            item: itemId,
            transactionType: 'Adjustment',
            quantity: qty,
            reason: `${adjustmentType}: ${reason.trim()}`,
            referenceNumber: remarks?.trim() || '',
            performedBy: userId,
            transactionDate: new Date(),
        });

        await transaction.save();

        // 6. Populate transaction response
        const populatedTransaction = await StockTransaction.findById(transaction._id)
            .populate('item', 'name code unit')
            .populate('performedBy', 'fullName email');

        return res.status(200).json({
            success: true,
            message: `Stock ${adjustmentType.toLowerCase()}d successfully.`,
            item: {
                _id: item._id,
                name: item.name,
                code: item.code,
                unit: item.unit,
                oldQuantity,
                newQuantity: item.quantity,
                adjustment: adjustmentType === 'Increase' ? `+${qty}` : `-${qty}`,
            },
            transaction: populatedTransaction,
        });

    } catch (error) {
        console.error('Adjust Stock Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
