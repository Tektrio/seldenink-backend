const mongoose = require('mongoose');

const serviceInfoSchema = new mongoose.Schema({
    price: {
        type: Number, 
        required: [true,'Price is required, please provide a valid price field']
    },
    duration: {
        type: String, 
        required: [true,'Duration is required, please provide a valid duration field']
    },
    professional: {
        type: String, 
        required: [true,'Professional is required, please provide a valid professional field']
    }
})

const servicesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Service name is required, please provide a service name']
    }, 
    category: {
        type: String,
        enum: {
            values: [
                'tattoo',
                'piercing',
                'supply',
                'after care',
                'other'
            ],
            message: 'Select a correct category'
        },
        required: [true,'category is required, please provide a category']
    },
    description: {
        type: String, 
    },
    resources: {
        type: String 
    },
    b_cost: {
        type: Number, 
    },
    tax: {
        type: String,
    },
    serviceInfo: [serviceInfoSchema],
    imageUrl: {
        type: String
    }
})

module.exports = mongoose.model('Service', servicesSchema);