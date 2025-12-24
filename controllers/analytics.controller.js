const Inventory = require('../models/inventory');
const Transaction = require('../models/transaction');
const SKU = require('../models/sku');

exports.getSKUPerformance = async (req, res) => {
    try {
        const { days = 30, category } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const matchStage = { date: { $gte: startDate } };

        const transactionStats = await Transaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$skuId',
                    totalIn: {
                        $sum: { $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0] }
                    },
                    totalOut: {
                        $sum: { $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0] }
                    },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'sku'
                }
            },
            { $unwind: '$sku' },
            {
                $match: category ? { 'sku.category': category } : {}
            },
            {
                $project: {
                    _id: 1,
                    sku: {
                        name: '$sku.name',
                        skuCode: '$sku.skuCode',
                        category: '$sku.category',
                        unitPrice: '$sku.unitPrice'
                    },
                    totalIn: 1,
                    totalOut: 1,
                    transactionCount: 1,
                    movementScore: '$totalOut'
                }
            },
            { $sort: { movementScore: -1 } }
        ]);

        const avgMovement = transactionStats.length > 0
            ? transactionStats.reduce((sum, item) => sum + item.totalOut, 0) / transactionStats.length
            : 0;

        const fastMoving = transactionStats.filter(item => item.totalOut > avgMovement);
        const slowMoving = transactionStats.filter(item => item.totalOut <= avgMovement && item.totalOut > 0);
        const noMovement = transactionStats.filter(item => item.totalOut === 0);

        res.json({
            success: true,
            data: {
                period: `${days} days`,
                summary: {
                    totalSKUs: transactionStats.length,
                    fastMovingCount: fastMoving.length,
                    slowMovingCount: slowMoving.length,
                    noMovementCount: noMovement.length,
                    averageMovement: Math.round(avgMovement)
                },
                fastMoving: fastMoving.slice(0, 10),
                slowMoving: slowMoving.slice(0, 10),
                noMovement: noMovement.slice(0, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventoryValue = async (req, res) => {
    try {
        const { warehouse, category } = req.query;

        const matchStage = {};
        if (warehouse) {
            matchStage.warehouse = warehouse;
        }

        const valueByCategory = await Inventory.aggregate([
            { $match: matchStage },
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
                $match: category ? { 'sku.category': category } : {}
            },
            {
                $group: {
                    _id: '$sku.category',
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$sku.unitPrice'] } },
                    itemCount: { $sum: 1 }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        const valueByWarehouse = await Inventory.aggregate([
            { $match: matchStage },
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
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$sku.unitPrice'] } },
                    itemCount: { $sum: 1 }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        const overallValue = valueByCategory.reduce((sum, cat) => sum + cat.totalValue, 0);
        const overallQuantity = valueByCategory.reduce((sum, cat) => sum + cat.totalQuantity, 0);

        res.json({
            success: true,
            data: {
                overall: {
                    totalValue: overallValue,
                    totalQuantity: overallQuantity
                },
                byCategory: valueByCategory,
                byWarehouse: valueByWarehouse
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStockAgingReport = async (req, res) => {
    try {
        const { warehouse } = req.query;
        const now = new Date();

        const query = { quantity: { $gt: 0 } };
        if (warehouse) {
            query.warehouse = warehouse;
        }

        const inventory = await Inventory.find(query).populate('skuId');

        const agingBuckets = {
            fresh: [],
            aging: [],
            old: [],
            deadStock: []
        };

        inventory.forEach(item => {
            const daysSinceUpdate = Math.floor((now - new Date(item.lastMovementDate)) / (1000 * 60 * 60 * 24));
            const itemData = {
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
                value: item.quantity * item.skuId.unitPrice,
                daysSinceMovement: daysSinceUpdate,
                lastMovementDate: item.lastMovementDate
            };

            if (daysSinceUpdate <= 7) {
                agingBuckets.fresh.push(itemData);
            } else if (daysSinceUpdate <= 30) {
                agingBuckets.aging.push(itemData);
            } else if (daysSinceUpdate <= 60) {
                agingBuckets.old.push(itemData);
            } else {
                agingBuckets.deadStock.push(itemData);
            }
        });

        const calculateBucketSummary = (bucket) => ({
            count: bucket.length,
            totalQuantity: bucket.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: bucket.reduce((sum, item) => sum + item.value, 0)
        });

        res.json({
            success: true,
            data: {
                summary: {
                    fresh: calculateBucketSummary(agingBuckets.fresh),
                    aging: calculateBucketSummary(agingBuckets.aging),
                    old: calculateBucketSummary(agingBuckets.old),
                    deadStock: calculateBucketSummary(agingBuckets.deadStock)
                },
                details: {
                    fresh: { label: '0-7 days', items: agingBuckets.fresh },
                    aging: { label: '8-30 days', items: agingBuckets.aging },
                    old: { label: '31-60 days', items: agingBuckets.old },
                    deadStock: { label: '60+ days', items: agingBuckets.deadStock }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalSKUs = await SKU.countDocuments({ isActive: true });

        const inventoryStats = await Inventory.aggregate([
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
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$sku.unitPrice'] } },
                    totalItems: { $sum: 1 }
                }
            }
        ]);

        const inventory = await Inventory.find().populate('skuId');
        const lowStockCount = inventory.filter(item => 
            item.skuId && item.quantity <= item.skuId.reorderLevel
        ).length;

        const outOfStockCount = inventory.filter(item => item.quantity === 0).length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deadStockCount = inventory.filter(item => 
            item.quantity > 0 && new Date(item.lastMovementDate) < thirtyDaysAgo
        ).length;

        const recentTransactions = await Transaction.find()
            .populate('skuId')
            .populate('performedBy', 'name')
            .sort({ date: -1 })
            .limit(5);

        const warehouseStats = await Inventory.aggregate([
            {
                $group: {
                    _id: '$warehouse',
                    itemCount: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalSKUs,
                    totalInventoryItems: inventoryStats[0]?.totalItems || 0,
                    totalQuantity: inventoryStats[0]?.totalQuantity || 0,
                    totalValue: inventoryStats[0]?.totalValue || 0
                },
                alerts: {
                    lowStock: lowStockCount,
                    outOfStock: outOfStockCount,
                    deadStock: deadStockCount
                },
                warehouses: warehouseStats,
                recentTransactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
