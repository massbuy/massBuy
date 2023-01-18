const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const Cart = mongoose.model('carts', CartSchema);

module.exports = Cart;