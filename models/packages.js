const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    status: { type: String, default: "native" },
    package_title: { type: String },
    duration: { type: String },
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

