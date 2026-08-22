
import mongoose from 'mongoose';
import Item from '../model/item.js';
import Purchase from '../model/purchase.js';
import Supplier from '../model/supplier.js';
import User from '../model/user.js';
import StockTransaction from '../model/stockTransaction.js';




// CREATE PURCHASE (Admin/Stock Manager)
export const createPurchase = async (req, res) => {
    try {
        const {
            supplier,
            invoiceNumber,
            purchaseDate,
            purchasedItems,
            remarks,
        } = req.body;

        const createdBy = req.user._id;

        // --- Validation (same as before) ---
        if (!supplier) {
            return res.status(400).json({
                success: false,
                message: 'Supplier is required.',
            });
        }
        
        if (!invoiceNumber) {
            return res.status(400).json({
                success: false,
                message: 'invoiceNumber is required.',
            });
        }


        if (!purchasedItems || !Array.isArray(purchasedItems) || purchasedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required.',
            });
        }

        // Validate supplier
        if (!mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid supplier ID.',
            });
        }

        const supplierExists = await Supplier.findById(supplier);
        if (!supplierExists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found.',
            });
        }
        if (!supplierExists.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create purchase with an inactive supplier.',
            });
        }

        // Validate user
        if (!mongoose.Types.ObjectId.isValid(createdBy)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.',
            });
        }

        const userExists = await User.findById(createdBy);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Validate invoice number
        let finalInvoiceNumber = invoiceNumber?.trim();
            const existingInvoice = await Purchase.findOne({ invoiceNumber: finalInvoiceNumber });
            if (existingInvoice) {
                return res.status(409).json({
                    success: false,
                    message: 'Invoice number already exists.',
                });
            }
    

        // Validate purchased items
        const validatedItems = [];
        let totalAmount = 0;
        const itemIds = purchasedItems.map(item => item.item).filter(id => id);

        const uniqueItemIds = new Set(itemIds.map(id => id.toString()));
        if (uniqueItemIds.size !== itemIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate items are not allowed in a single purchase.',
            });
        }

        for (const [index, itemData] of purchasedItems.entries()) {
            const { item: itemId, quantity, unitPrice } = itemData;

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
                    message: `Cannot purchase an inactive item: ${item.name}.`,
                });
            }

            if (!quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Quantity must be at least 1 at row ${index + 1}.`,
                });
            }

            if (unitPrice === undefined || unitPrice === null || unitPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Unit price must be a positive number at row ${index + 1}.`,
                });
            }

            const subtotal = quantity * unitPrice;
            totalAmount += subtotal;

            validatedItems.push({
                item: itemId,
                quantity,
                unitPrice,
                itemData: item,
            });
        }

        // --- Create Purchase
        const purchase = new Purchase({
            supplier,
            invoiceNumber: finalInvoiceNumber,
            purchaseDate: purchaseDate || new Date(),
            purchasedItems: validatedItems.map(({ item, quantity, unitPrice }) => ({
                item,
                quantity,
                unitPrice,
            })),
            totalAmount,
            remarks: remarks?.trim() || '',
            createdBy,
        });

        await purchase.save();

        // --- Update Item Quantities and Create Stock Transactions ---
        const stockTransactions = [];

        for (const validatedItem of validatedItems) {
            const { item, quantity, unitPrice, itemData } = validatedItem;

            // Update item quantity
            itemData.quantity += quantity;
            await itemData.save();

            // Create stock transaction
            const transaction = new StockTransaction({
                item: item,
                transactionType: 'Stock In',
                quantity,
                unitPrice,
                supplier: supplier,
                purchase: purchase._id,
                referenceNumber: finalInvoiceNumber,
                reason: `Purchase order ${finalInvoiceNumber}`,
                performedBy: createdBy,
                transactionDate: purchaseDate || new Date(),
            });

            await transaction.save();
            stockTransactions.push(transaction);
        }

        // Populate the response
        const populatedPurchase = await Purchase.findById(purchase._id)
            .populate('supplier', 'companyName email phone')
            .populate('createdBy', 'fullName email')
            .populate('purchasedItems.item', 'name code unit');

        return res.status(201).json({
            success: true,
            message: 'Purchase created successfully.',
            purchase: populatedPurchase,
            stockTransactions,
        });

    } catch (error) {
        console.error('Create Purchase Error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Invoice number already exists.',
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error while creating purchase.',
        });
    }
};

//  Purchase list

export const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('supplier', 'companyName email phone')
            .populate('createdBy', 'fullName email')
            .select('-__v')
            .sort({ purchaseDate: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            purchases,
            count: purchases.length,
        });

    } catch (error) {
        console.error('Get Purchases Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * GET purchase by ID with all populated fields
 * Includes: Supplier, CreatedBy, PurchasedItems (with Item details), Stock Transactions
 */
export const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid purchase ID.',
            });
        }

        // Find purchase and populate all references
        const purchase = await Purchase.findById(id)
            .populate('supplier', 'companyName contactPerson email phone address isActive')
            .populate('createdBy', 'fullName email')
            .populate({
                path: 'purchasedItems.item',
                select: 'name code unit category minimumStockLevel quantity isActive',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            })
            .select('-__v')
            .lean();

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found.',
            });
        }

        // --- Fetch Related Stock Transactions for this purchase ---
        const stockTransactions = await StockTransaction.find({ purchase: id })
            .populate('item', 'name code unit')
            .populate('performedBy', 'fullName email')
            .populate('supplier', 'companyName')
            .populate('department', 'name code')
            .sort({ transactionDate: -1, createdAt: -1 })
            .lean();

        // --- Calculate additional stats ---
        const totalItems = purchase.purchasedItems?.length || 0;
        const totalQuantity = purchase.purchasedItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        return res.status(200).json({
            success: true,
            purchase,
            stockTransactions: stockTransactions || [],
            stats: {
                totalItems,
                totalQuantity,
            }
        });

    } catch (error) {
        console.error('Get Purchase By ID Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};