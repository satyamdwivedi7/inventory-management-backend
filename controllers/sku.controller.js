const SKU = require('../models/sku');

exports.createSKU = async (req, res) => {
    try {
        const { name, skuCode, category, description, reorderLevel, unitPrice, unit } = req.body;

        const existingSKU = await SKU.findOne({ skuCode: skuCode.toUpperCase() });
        if (existingSKU) {
            return res.status(400).json({ success: false, message: 'SKU code already exists' });
        }

        const sku = new SKU({
            name,
            skuCode: skuCode.toUpperCase(),
            category,
            description,
            reorderLevel,
            unitPrice,
            unit
        });

        await sku.save();

        res.status(201).json({
            success: true,
            message: 'SKU created successfully',
            data: sku
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllSKUs = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { skuCode: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const skus = await SKU.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await SKU.countDocuments(query);

        res.json({
            success: true,
            data: skus,
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

exports.getSKUById = async (req, res) => {
    try {
        const sku = await SKU.findById(req.params.id);
        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }
        res.json({ success: true, data: sku });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSKU = async (req, res) => {
    try {
        const { name, category, description, reorderLevel, unitPrice, unit } = req.body;

        const sku = await SKU.findByIdAndUpdate(
            req.params.id,
            { name, category, description, reorderLevel, unitPrice, unit },
            { new: true, runValidators: true }
        );

        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        res.json({ success: true, message: 'SKU updated', data: sku });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSKU = async (req, res) => {
    try {
        const sku = await SKU.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        res.json({ success: true, message: 'SKU deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
