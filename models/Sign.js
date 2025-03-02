const mongoose = require('mongoose');


const newSignArrayData = mongoose.Schema({
    sign1: String, 
    sign2: String, 
    sign3: String, 
    sign4: String, 
    sign5: String, 
    sign6: String, 
    sign7: String, 
    sign8: String, 
    sign9: String, 
    sign10: String, 
    sign11: String, 
    sign12: String, 
    sign13: String, 
    sign14: String, 
}, { _id: false })

const SignSchema = new mongoose.Schema({
    signEntries: [newSignArrayData],
    signValueSave: String,
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    }
})

module.exports = mongoose.model('Sign', SignSchema);
