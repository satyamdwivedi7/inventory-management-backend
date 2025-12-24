const Inventory = require('../models/inventory');
const SKU = require('../models/sku');

exports.getLowStockAlerts = async (req, res) => {
    try {
        const { warehouse } = req.query;
        const query = {};

        if (warehouse) {
            query.warehouse = warehouse;
        }

        const inventory = await Inventory.find(query).populate('skuId');

        const lowStockAlerts = inventory
            .filter(item => item.skuId && item.quantity <= item.skuId.reorderLevel)
            .map(item => ({
                inventoryId: item._id,
                sku: {
                    id: item.skuId._id,
                    name: item.skuId.name,
                    skuCode: item.skuId.skuCode,
                    category: item.skuId.category
                },
                warehouse: item.warehouse,
                currentQuantity: item.quantity,
                reorderLevel: item.skuId.reorderLevel,
                deficit: item.skuId.reorderLevel - item.quantity,
                status: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                severity: item.quantity === 0 ? 'critical' : item.quantity <= item.skuId.reorderLevel / 2 ? 'high' : 'medium'
            }))
            .sort((a, b) => a.currentQuantity - b.currentQuantity);

        res.json({
            success: true,
            data: {
                totalAlerts: lowStockAlerts.length,
                criticalCount: lowStockAlerts.filter(a => a.severity === 'critical').length,
                highCount: lowStockAlerts.filter(a => a.severity === 'high').length,
                mediumCount: lowStockAlerts.filter(a => a.severity === 'medium').length,
                alerts: lowStockAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDeadStockAlerts = async (req, res) => {
    try {
        const { warehouse, days = 30 } = req.query;
        const query = {};

        if (warehouse) {
            query.warehouse = warehouse;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        query.lastMovementDate = { $lt: cutoffDate };
        query.quantity = { $gt: 0 };

        const deadStock = await Inventory.find(query).populate('skuId');

        const deadStockAlerts = deadStock.map(item => {
            const daysSinceMovement = Math.floor((new Date() - new Date(item.lastMovementDate)) / (1000 * 60 * 60 * 24));
            return {
                inventoryId: item._id,
                sku: {
                    id: item.skuId._id,
                    name: item.skuId.name,
                    skuCode: item.skuId.skuCode,
                    category: item.skuId.category,
                    unitPrice: item.skuId.unitPrice
                },
                warehouse: item.warehouse,
                quantity: item.quantity,
                valueBlocked: item.quantity * item.skuId.unitPrice,
                lastMovementDate: item.lastMovementDate,
                daysSinceMovement,
                status: 'DEAD_STOCK'
            };
        }).sort((a, b) => b.daysSinceMovement - a.daysSinceMovement);

        const totalValueBlocked = deadStockAlerts.reduce((sum, item) => sum + item.valueBlocked, 0);

        res.json({
            success: true,
            data: {
                totalItems: deadStockAlerts.length,
                totalValueBlocked,
                threshold: parseInt(days),
                alerts: deadStockAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllAlerts = async (req, res) => {
    try {
        const { warehouse, deadStockDays = 30 } = req.query;
        const query = {};

        if (warehouse) {
            query.warehouse = warehouse;
        }

        const inventory = await Inventory.find(query).populate('skuId');

        const lowStockAlerts = inventory
            .filter(item => item.skuId && item.quantity <= item.skuId.reorderLevel)
            .map(item => ({
                type: 'LOW_STOCK',
                inventoryId: item._id,
                sku: item.skuId,
                warehouse: item.warehouse,
                currentQuantity: item.quantity,
                reorderLevel: item.skuId.reorderLevel,
                severity: item.quantity === 0 ? 'critical' : 'high'
            }));

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(deadStockDays));

        const deadStockAlerts = inventory
            .filter(item => 
                item.skuId && 
                item.quantity > 0 && 
                new Date(item.lastMovementDate) < cutoffDate
            )
            .map(item => ({
                type: 'DEAD_STOCK',
                inventoryId: item._id,
                sku: item.skuId,
                warehouse: item.warehouse,
                quantity: item.quantity,
                valueBlocked: item.quantity * item.skuId.unitPrice,
                lastMovementDate: item.lastMovementDate,
                severity: 'medium'
            }));

        res.json({
            success: true,
            data: {
                lowStock: {
                    count: lowStockAlerts.length,
                    alerts: lowStockAlerts
                },
                deadStock: {
                    count: deadStockAlerts.length,
                    alerts: deadStockAlerts
                },
                totalAlerts: lowStockAlerts.length + deadStockAlerts.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
