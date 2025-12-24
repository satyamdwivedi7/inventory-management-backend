const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    skuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SKU',
        required: true
    },
    warehouse: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    lastMovementDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

inventorySchema.index({ skuId: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
