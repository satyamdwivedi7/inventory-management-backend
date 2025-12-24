const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
