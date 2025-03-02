const mongoose = require('mongoose');

const categoryOptionSchema = new mongoose.Schema({
    optionTitle: {
        type: String
    },
    optionDescription: {
        type: String
    },
    optionImage: {
        type: String
    }
})

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String, 
    },
    categoryOption: [categoryOptionSchema]
})

module.exports = mongoose.model('Category', CategorySchema);