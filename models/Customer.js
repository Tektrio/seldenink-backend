const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const hoursSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
    },
    startTime: String,
    startPeriod: {
        type: String,
        enum: ['AM', 'PM'],
        required: true,
    },
    endTime: String,
    endPeriod: {
        type: String,
        enum: ['AM', 'PM'],
        required: true,
    },
    store: {
        type: String
    }
});

const notificationSchema = new mongoose.Schema({
    visible: {
        type: Boolean,
        default: false
    },
    customer: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now // Preenche automaticamente com a data e hora atuais
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId, // Referência ao agendamento
        ref: 'Book'
    },
    tag: {
        type: String
    }
})


const Customer = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'customer must have a name']
    },
    email: {
        type: String,
        required: [true, 'customer must have an email'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'customers must have a phone']
    },
    birth: {
        type: Date,
        default: Date.now()
    },
    imageUrl: {
        type: String
    },
    imageUrlDocument: {
        type: String
    },
    // role: {
    //     type: String,
    //     enum: {
    //         values: ['user','admin','artist'],
    //         message: 'choose a correct role'
    //     },
    //     default: 'user'
    // },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'artist', 'owner'],
        default: ['user']
    },
    password: {
        type: String,
        required: [true, ' customer must have a password'],
        select: false
    },
    nationality: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'Choose a correct nationality - Yes or No'
        }
    },
    country: {
        type: String
    },
    zipcode: {
        type: String,
        maxlength: [8,'zipcode CAN NOT be greater than 8 characters.']
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    location: {
        type: String
    },
    notifications: [notificationSchema],
    hoursOfOperation: [hoursSchema],
    gender: {
        type: String,
        enum: {
            values: ['Male','Female','Private'],
            message: 'Select a corret gender'
        }
    },
    referral: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'Choose a corret referral - Yes or No'
        }
    },
    referral_opt_email: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'Choose a correct referral email opt --> Yes or No'
        }
    },
    referral_name: {
        type: String
    },
    referral_email: {
        type: String
    },
    referral_phone: {
        type: String
    },
    document_id_profile: {
        type: String
    },
    p_shop: {
        type: String
    },
    p_w_role: {
        type: String
    },
    p_w_days: {
        type: String
    },
    p_w_hours: {
        type: String
    },
    p_city: { 
        type: String
    },
    p_location: {
        type: String
    },
    bio: {
        type: String
    },
    display_on_staff_page: {
        type: String,
        enum:  {
            values: ["yes","no"],
            message: 'Select correct type display on staff page'
        }
    },
    status: {
        type: String,
        enum:  {
            values: ["inactive","active"],
            message: 'Select correct type status'
        }
    },
    online_booking: {
        type: String,
        enum:  {
            values: ["yes","no"],
            message: 'Select correct type online_booking'
        }
    },
    share_calendar: {
        type: String,
        enum:  {
            values: ["yes","no"],
            message: 'Select correct type share_calendar'
        }
    },
    resetPasswordToken: String,
    resetPasswordTOkenExpires: Date
},{
    timestamps: true
});

// encrypt password before save it
Customer.pre('save', async function(next) {
    if(!this.isModified('password'))return next();

    this.password = await bcrypt.hash(this.password, 12);

    next();
})

// Compare if password is equal to the database
Customer.methods.correctPassword = async function(candidatePassword, password){
    return await bcrypt.compare(candidatePassword, password);
}

Customer.methods.compareOldPassword = async function(oldPassword){
    return await bcrypt.compare(oldPassword, this.password);
}

// Generate a custom token 
Customer.methods.generateHashToken = function(){
    const hashToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto.createHash('sha256').update(hashToken).digest('hex');

    this.resetPasswordTOkenExpires = Date.now() + 30 * 60 * 60 * 1000;

    return hashToken;
}

module.exports = mongoose.model('Customer', Customer);
