const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    dueDate: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["Active", "Pending", "Completed"]
    },
    frequency: { type: String, required: true },
    delivery_id: {
        type: mongoose.Types.ObjectId,
        ref: "delivery"
    },
    cart_id: {
        type: mongoose.Types.ObjectId,
        ref: "carts"
    }
}, {
    timestamps: true
});

const Order = mongoose.model('orders', OrderSchema);

module.exports = Order;