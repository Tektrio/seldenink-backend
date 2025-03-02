const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
    allergies: [String], 
    auto_immunity: {
        type: String
    }, 
    conditions: [String], 
    diseases: [String], 
    infection_description: {
        type: String
    }, 
    medication_description: {
        type: String
    }, 
    medication_time: {
        type: String
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    }
})

module.exports = mongoose.model('Health', HealthSchema);