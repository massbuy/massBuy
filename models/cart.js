const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    duration: { type: String, required: true, trim: true },
    category: { type: String, },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    package: {
        type: mongoose.Types.ObjectId,
        ref: "packages"
    },
    frequency: {
        type: { String, required: true }
    }
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