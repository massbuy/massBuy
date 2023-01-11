const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }
}, {
    timestamps: true
});

const Cart = mongoose.model('carts', CartSchema);

module.exports = Cart;