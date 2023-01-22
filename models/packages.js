const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    status: { type: String, default: "native" },
    package_title: { type: String },
    duration: { type: Number },
    package_category: {
        type: mongoose.Types.ObjectId,
        ref: "package-categories"
    },
    product_id: [{
        item: {
            type: mongoose.Types.ObjectId,
            ref: "products"
        },
        qty: { type: Number, default: 1 }
    }],
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    payment_frequency: {
        type: String, required: true
    },
    total: {
        type: Number, required: true
    },
    daily: {
        type: Number
    },
    weekly: {
        type: Number
    },
    monthly: {
        type: Number
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

const Packages = mongoose.model('packages', PackageSchema);

module.exports = Packages

