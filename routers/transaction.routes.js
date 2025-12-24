const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, transactionController.getTransactions);
router.get('/:id', authenticate, transactionController.getTransactionById);
router.get('/sku/:skuId', authenticate, transactionController.getTransactionsBySKU);

module.exports = router;
