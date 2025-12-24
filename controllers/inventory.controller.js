const Inventory = require('../models/inventory');
const SKU = require('../models/sku');
const Transaction = require('../models/transaction');

exports.getInventory = async (req, res) => {
    try {
        const { warehouse, skuId, lowStock, page = 1, limit = 20 } = req.query;
        const query = {};

        if (warehouse) {
            query.warehouse = warehouse;
        }

        if (skuId) {
            query.skuId = skuId;
        }

        const skip = (page - 1) * limit;
        let inventory = await Inventory.find(query)
            .populate('skuId')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ lastUpdated: -1 });

        if (lowStock === 'true') {
            inventory = inventory.filter(item => 
                item.skuId && item.quantity <= item.skuId.reorderLevel
            );
        }

        const total = await Inventory.countDocuments(query);

        res.json({
            success: true,
            data: inventory,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventoryBySKU = async (req, res) => {
    try {
        const inventory = await Inventory.find({ skuId: req.params.skuId }).populate('skuId');
        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const { skuId, warehouse, type, quantity, reason } = req.body;

        const sku = await SKU.findById(skuId);
        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        let inventory = await Inventory.findOne({ skuId, warehouse });

        if (!inventory) {
            if (type === 'OUT') {
                return res.status(400).json({ success: false, message: 'No inventory found for this SKU in warehouse' });
            }
            inventory = new Inventory({
                skuId,
                warehouse,
                quantity: 0
            });
        }

        if (type === 'IN') {
            inventory.quantity += quantity;
        } else if (type === 'OUT') {
            if (inventory.quantity < quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock' });
            }
            inventory.quantity -= quantity;
        }

        inventory.lastUpdated = new Date();
        inventory.lastMovementDate = new Date();
        await inventory.save();

        const transaction = new Transaction({
            skuId,
            warehouse,
            type,
            quantity,
            reason,
            performedBy: req.user.id
        });
        await transaction.save();

        await inventory.populate('skuId');

        res.json({
            success: true,
            message: `Stock ${type === 'IN' ? 'added' : 'removed'} successfully`,
            data: {
                inventory,
                transaction
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.setInventory = async (req, res) => {
    try {
        const { skuId, warehouse, quantity, reason } = req.body;

        const sku = await SKU.findById(skuId);
        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        let inventory = await Inventory.findOne({ skuId, warehouse });
        const previousQuantity = inventory ? inventory.quantity : 0;

        if (!inventory) {
            inventory = new Inventory({
                skuId,
                warehouse,
                quantity
            });
        } else {
            inventory.quantity = quantity;
        }

        inventory.lastUpdated = new Date();
        inventory.lastMovementDate = new Date();
        await inventory.save();

        const difference = quantity - previousQuantity;
        if (difference !== 0) {
            const transaction = new Transaction({
                skuId,
                warehouse,
                type: difference > 0 ? 'IN' : 'OUT',
                quantity: Math.abs(difference),
                reason: reason || 'Stock adjustment',
                performedBy: req.user.id
            });
            await transaction.save();
        }

        await inventory.populate('skuId');

        res.json({
            success: true,
            message: 'Inventory set successfully',
            data: inventory
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventorySummary = async (req, res) => {
    try {
        const summary = await Inventory.aggregate([
            {
                $lookup: {
                    from: 'skus',
                    localField: 'skuId',
                    foreignField: '_id',
                    as: 'sku'
                }
            },
            { $unwind: '$sku' },
            {
                $group: {
                    _id: '$warehouse',
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$sku.unitPrice'] } }
                }
            }
        ]);

        const totalInventory = await Inventory.aggregate([
            {
                $lookup: {
                    from: 'skus',
                    localField: 'skuId',
                    foreignField: '_id',
                    as: 'sku'
                }
            },
            { $unwind: '$sku' },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$sku.unitPrice'] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                byWarehouse: summary,
                overall: totalInventory[0] || { totalItems: 0, totalQuantity: 0, totalValue: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
