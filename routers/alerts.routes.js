const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alerts.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, alertsController.getAllAlerts);
router.get('/low-stock', authenticate, alertsController.getLowStockAlerts);
router.get('/dead-stock', authenticate, alertsController.getDeadStockAlerts);

module.exports = router;
