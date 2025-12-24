const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        trim: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
