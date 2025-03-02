const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilterSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    runTime: {
        type: String
    },
    deposit_amount: {
        type: String    
    },
    checkout_amount: { 
        type: Number
    },
    total_amount: { 
        type: String
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive'],
            message: 'Correct status is required'
        }
    },
    store_filter: {
        type: [String] // Alterado para Array de String
    },
    artist_filter: {
        type: [String] // Alterado para Array de String
    },
    category_filter: [Schema.Types.Mixed],
    cost: {
        type: String
    },
    discount: {
        type: String
    },
    tax: {
        type: String
    },
    fee: {
        type: String
    }
});


     // {
    //     "title": "Service I",
    //     "description": "Filter description test",
    //     "runTime": "230",
    //     "deposit_amount": "300",
    //     "checkout_amount": "1200",
    //     "total_amount": "1500",
    //     "store_filter": "Selden Ink ",
    //     "artist_filter": "artist",
    //     "category_filter": [
    //         {
    //             "Skin Tone": "2 - Fair "
    //         },
    //         {
    //             "Skin Tone": "3 - Medium"
    //         },
    //         {
    //             "Placement": "Back"
    //         },
    //         {
    //             "Placement": "Front"
    //         },
    //         {
    //             "Placement": "Leg"
    //         }
    //     ]
    // }


module.exports = mongoose.model('Filter', FilterSchema);