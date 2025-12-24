const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    skuCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['tiles', 'laminates', 'lighting', 'hardware', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        trim: true
    },
    reorderLevel: {
        type: Number,
        required: true,
        min: 0,
        default: 10
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: 'pcs',
        enum: ['pcs', 'box', 'sqft', 'kg', 'meter']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SKU', skuSchema);
