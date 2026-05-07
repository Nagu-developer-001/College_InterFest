const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Matches your User model name
        required: true
    },
    id: { type: Number, required: true },
    partName: String,
    material: String,
    quantity: Number,
    status: { type: String, default: 'Received' },
    deadline: Date,
    qualityNotes: [{
        text: String,
        timestamp: Date
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);