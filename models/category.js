const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, default: "Others" },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    }
},
    {
        timestamps: true
    });

const Category = mongoose.model('categories', CategorySchema);

module.exports = Category;