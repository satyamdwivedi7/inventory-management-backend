const Warehouse = require('../models/warehouse');

exports.createWarehouse = async (req, res) => {
    try {
        const { name, location, address, contactPerson, contactPhone } = req.body;

        const existingWarehouse = await Warehouse.findOne({ name });
        if (existingWarehouse) {
            return res.status(400).json({ success: false, message: 'Warehouse name already exists' });
        }

        const warehouse = new Warehouse({
            name,
            location,
            address,
            contactPerson,
            contactPhone
        });

        await warehouse.save();

        res.status(201).json({
            success: true,
            message: 'Warehouse created successfully',
            data: warehouse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ isActive: true });
        res.json({ success: true, data: warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        res.json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWarehouse = async (req, res) => {
    try {
        const { name, location, address, contactPerson, contactPhone } = req.body;

        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            { name, location, address, contactPerson, contactPhone },
            { new: true, runValidators: true }
        );

        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        res.json({ success: true, message: 'Warehouse updated', data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        res.json({ success: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
