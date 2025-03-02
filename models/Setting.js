const mongoose = require('mongoose');

const Setting = new mongoose.Schema({
    status_customer: {
        type: String
    },
    sms: {
        type: String
    },
    notification: {
        type: String
    },
    email_newsletter: {
        type: String
    },
    announcement: {
        type: String
    },
    share_browser: {
        type: String
    },
    accept_support: {
        type: String
    },
    appointment_reminder: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct appointment reminder'
        },
    },
    hipaa_compliant_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct hipaa compliant notification'
        }
    },
    includes_message_emails: {
        type: String,
    },
    welcome_email: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct welcome email'
        }
    },
    business_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct business notification'
        }
    },
    notification_employee: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct notification employee'
        }
    },
    email_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct email notification'
        }
    },
    text_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct text notification'
        }
    },
    push_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct push notification'
        }
    },
    low_inventory_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct low inventory notification'
        }
    },
    marketing_email_business: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct marketing email business'
        }
    },
    tektrio_emails: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct tektrio emails'
        }
    },
    tektrio_text_notification: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct tektrio text notifications'
        }
    },
    new_customer_appointments: { 
        type: String
    }, 
    old_customer_appointments: { 
        type: String
    },
    customer_with_no_shows_or_cancellations: { 
        type: String
    },
    block_new_customer_online_booking: {
        type: String,
        enum: {
            values: ['Yes','No'],
            message: 'choose a correct tektrio text notifications'
        }
    }, 
    limit_how_far_in_advance_customer_can_book: {
        type: String
    },
    limit_how_far_in_advance_customer_can_class: {
      type: String  
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    }, 
    admin_status: {
        type: String
    },
    admin_online_booking: {
        type: String
    },
    admin_share_calendar: {
        type: String
    },
    admin_display_on_team_page: {
        type: String
    }
})

module.exports = mongoose.model('Setting', Setting);