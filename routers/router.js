const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const skuRoutes = require('./sku.routes');
const inventoryRoutes = require('./inventory.routes');
const transactionRoutes = require('./transaction.routes');
const alertsRoutes = require('./alerts.routes');
const analyticsRoutes = require('./analytics.routes');
const warehouseRoutes = require('./warehouse.routes');

router.use('/users', userRoutes);
router.use('/sku', skuRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/alerts', alertsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/warehouses', warehouseRoutes);

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date() });
});

module.exports = router;