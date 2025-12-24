const Transaction = require('../models/transaction');

exports.getTransactions = async (req, res) => {
    try {
        const { skuId, warehouse, type, startDate, endDate, page = 1, limit = 20 } = req.query;
        const query = {};

        if (skuId) {
            query.skuId = skuId;
        }

        if (warehouse) {
            query.warehouse = warehouse;
        }

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        const skip = (page - 1) * limit;
        const transactions = await Transaction.find(query)
            .populate('skuId')
            .populate('performedBy', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: transactions,
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

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('skuId')
            .populate('performedBy', 'name email');

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactionsBySKU = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ skuId: req.params.skuId })
            .populate('skuId')
            .populate('performedBy', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await Transaction.countDocuments({ skuId: req.params.skuId });

        res.json({
            success: true,
            data: transactions,
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
