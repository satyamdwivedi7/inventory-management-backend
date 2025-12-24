const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, inventoryController.getInventory);
router.get('/summary', authenticate, inventoryController.getInventorySummary);
router.get('/sku/:skuId', authenticate, inventoryController.getInventoryBySKU);
router.post('/update', authenticate, authorize(['owner', 'manager', 'staff']), inventoryController.updateInventory);
router.post('/set', authenticate, authorize(['owner', 'manager']), inventoryController.setInventory);

module.exports = router;
