const mongoose = require('mongoose');

const Checkin = new mongoose.Schema({
    read_before: {
        type: String,
    },
    document_photo: {
        type: String,
    },
    bio: {
        type: String,
    },
    health: {
        type: String,
    },
    legal: {
        type: String,
    },
    social: {
        type: String,
    },
    guidelines_preparation: {
        type: String,
    },
    sterilization_safety: {
        type: String,
    },
    confirm: {
        type: String
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    }
});

module.exports = mongoose.model('Checkin', Checkin);
