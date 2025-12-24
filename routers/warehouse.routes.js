const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['owner']), warehouseController.createWarehouse);
router.get('/', authenticate, warehouseController.getAllWarehouses);
router.get('/:id', authenticate, warehouseController.getWarehouseById);
router.put('/:id', authenticate, authorize(['owner']), warehouseController.updateWarehouse);
router.delete('/:id', authenticate, authorize(['owner']), warehouseController.deleteWarehouse);

module.exports = router;
