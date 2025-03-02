const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        validate: {
            validator: async function (value) {
                const existingStore = await mongoose.model('Store', storeSchema)
                    .findOne({ email: new RegExp(`^${value}$`, 'i') });

                return !existingStore;
            },
            message: 'Este e-mail já está cadastrado, por favor, escolha outro.',
        }
    },
    imageUrl: {
        type: String
    },
    phone: {
        type: String, 
    },
    whatsapp: {
        type: String 
    },
    zipcode: {
        type: String,
        // required: true 
    },
    address: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    comments: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    days_open: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    }
})

module.exports = mongoose.model('Store', storeSchema);