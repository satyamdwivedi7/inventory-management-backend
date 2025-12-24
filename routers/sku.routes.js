const express = require('express');
const router = express.Router();
const skuController = require('../controllers/sku.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['owner', 'manager']), skuController.createSKU);
router.get('/', authenticate, skuController.getAllSKUs);
router.get('/:id', authenticate, skuController.getSKUById);
router.put('/:id', authenticate, authorize(['owner', 'manager']), skuController.updateSKU);
router.delete('/:id', authenticate, authorize(['owner']), skuController.deleteSKU);

module.exports = router;
