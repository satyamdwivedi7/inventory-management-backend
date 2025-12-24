const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);
router.get('/sku-performance', authenticate, authorize(['owner', 'manager']), analyticsController.getSKUPerformance);
router.get('/inventory-value', authenticate, authorize(['owner', 'manager']), analyticsController.getInventoryValue);
router.get('/stock-aging', authenticate, authorize(['owner', 'manager']), analyticsController.getStockAgingReport);

module.exports = router;
