const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    seq: {
        type: Number,
        default: 0
    }
});

const continueAppointmentSchema = new mongoose.Schema({
    commentsContinue: {
        type: String,
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
})

const Counter = mongoose.model('Counter', CounterSchema);

const BookNowSchema = new mongoose.Schema({
    store: {
        type: String,
    },
    artist: {
        type: String, 
    },
    categories: [Schema.Types.Mixed],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    appointmentNumber: { type: String },
    book_confirm: {
        type: Boolean,
        required: false
    },
    payment: {
        type: String
    },
    arrival_status: {
        type: Boolean,
        default: false
    },
    // finish_book: {
    //     type: Boolean
    // },
    images: [String],
    imagesReferenceArtistImages: [String],
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
    deposit_amount: {
        type: String
    },
    run_time: {
        type: String
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    type_service: {
        type: String
    },
    checkout_amount: {
        type: String
    },  
    total_amount: {
        type: String
    },
    cost: {
        type: String
    },
    discount: {
        type: String
    },
    tax: {
        type: String
    },
    continueAppointmentsData: {
        type: continueAppointmentSchema,
        required: false
    },
    fee: {
        type: String
    },
    checkout_payment_status: {
        type: String
    },
    confirm_payment: {
        type: String
    },
    payment_method: {
        type: String
    },
    customer_payment_confirmed: {
        type: Boolean
    },
    customer_after_care_instructions: {
        type: Boolean
    },
    send_email_customer_receipt: {
        Type: Boolean
    },
    imageUrlCheckoutProgress: {
        type: String
    },
    checkout_status_tattoo_artist: {
        type: String
    }, 
    checkout_comments_tattoo_artist: {
        type: String
    },
    artist_rating_to_customer: {
        type: Number
    },
    customer_rating_to_artist: {
        type: Number
    },
    artist_finish_checkout_without_link: {
        type: Boolean
    },
    customer_finish_and_confirm_checkout: {
        type: Boolean
    },
    continue_tattoo_artist_status: {
        type: Boolean
    },
    continue_checkout_mixed: {
        type: Boolean
    },
    pay_on_cash: {
        type: Boolean
    },
    checkinApproved: [
        {
            image: String,
            status: String,
            comments: String
        }
    ],
    comments_reference: {
        type: String
    },
    customer_rate_final_tattoo: {
        type: String
    },
    emailSentToCustomerBeforeAppointment: {
        type: Boolean,
        default: false
    },
    cancelled_appointment_customer_sorry: {
        type: Boolean,
        default: false
    },
    googleCalendarEventId: {
        type: String
    },
    continue_tattoo_closed: {
        type: Boolean,
        default: undefined
    },
    artist_checkin_status: {
        type: String
    },
    artist_checkin_comments: {
        type: String 
    },
    checkin_artist_customer_description: {
        type: String
    },
    checkin_artist_fixed_price: {
        type: String
    },
    checkin_artist_per_hours: {
        type: String
    },
    checkin_artist_confirm_deposit: {
        type: String
    },
    checkin_artist_design_approved: {
        type: String
    },
    checkin_artist_design_approved_explain: {
        type: String
    },
    checkin_artist_start_tattoo: {
        type: String
    },
    checkin_artist_start_tattoo_explain: {
        type: String
    },
    appointment_continue_reference: {
        type: String
    },
    history: [
        {
            appointmentNumber: { type: String }, // Número do agendamento anterior
            date: { type: String },
            time: { type: String },
            artist: { type: String },
        }
    ],
    tag: {
        type: Number
    },
    update_fields_checkin_customer_tatoo: {
        type: Boolean
    },
    only_update_fields_checkin_customer_tattoo: {
        type: Boolean
    }
})


BookNowSchema.pre('save', async function(next) {
    const doc = this;
    const counterId = `appointmentCounter-${doc.customer}`;

    const counter = await Counter.findOneAndUpdate(
        { _id: 'globalAppointmentCounter' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    doc.appointmentNumber = `Appointment #${counter.seq.toString().padStart(3, '0')}`;
    next();
});


module.exports = mongoose.model('Book', BookNowSchema);



