const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    status: { type: String, default: "native" },
    package_title: { type: String },
    duration: { type: String },
    product_id: [{
        type: mongoose.Types.ObjectId,
        ref: "products"
    }],
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
});

const Packages = mongoose.model('packages', PackageSchema);

module.exports = Packages

