const Filter = require('../models/Filter');
const Category = require('../models/Category');
const Book   = require('../models/Book');
const Store = require('../models/Store');
const cloudinary   = require('../middlewares/cloudinary');  
const moment = require('moment-timezone');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_TEST);


const { google } = require('googleapis');
const dotenv = require('dotenv');
const ErrorHandler = require('../utils/ErrorHandler');
dotenv.config({ path: './config/config.env' });

const sendMailer = require('../utils/sendEmail');
const Customer = require('../models/Customer');


// Env config google calendar 
// const CREDENTIAL = JSON.parse(process.env.CREDENTIALS);
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS_TEKTRIO);
const calendarId = process.env.CALENDAR_ID_TEKTRIO;
const SCOPES = 'https://www.googleapis.com/auth/calendar';

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });



const retrieveAllEventList = async(startTimeDate,endTimeDate) => {
    try {
        const response = await calendar.events.list({
            auth: auth,
            calendarId: calendarId,
            timeMin: startTimeDate,
            timeMax: endTimeDate,
            timeZone: 'America/Recife'
        })

        const eventsCalendar = response['data']['items'];
        return eventsCalendar;
    }catch(err){
        console.log(`Something went wrong when you trying to access list events data: ${err.message}`)
    }
}

// let start = '2023-01-01T00:00:00.000Z';
// let end = '2023-12-31T00:00:00.000Z';

// 2024-01-06T22:00

// retrieveAllEventList(start,end)
//     .then(resp => console.log(resp))
//     .catch(err => console.log(err.message))

const TIMEOFFSET = '+05:30';


exports.getGoogleCalendar = async(req,res,next) => {
    const { start, end } = req.body;

    let newDateTime = `${start}:00.000${TIMEOFFSET}`;
    
    let event = new Date(Date.parse(newDateTime));

    let startTimeDate = event;

    let endTimeDate = new Date(new Date(startTimeDate).setHours(startTimeDate.getHours()+1));
    
    // console.log(startTimeDate)
    // console.log(endTimeDate)
    const results = await retrieveAllEventList(startTimeDate,endTimeDate);

    try {
        if(results.length !== 0){
            res.status(200).json({
                results,
                status: 'success'
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// --------------------------------------------------------------------------------------
// FILTER 

// CREATE / POST new filter items 
// CREATE / POST new filter items 
exports.postFilter = async (req, res, next) => {
    const {
        title,
        description,
        runTime,
        deposit_amount,
        checkout_amount,
        total_amount,
        status,
        store_filter,
        artist_filter,
        category_filter,
        cost,
        discount,
        tax,
        fee
    } = req.body;

    try {
        // Convert store_filter and artist_filter to arrays if they are not already
        const storeFilterArray = Array.isArray(store_filter) ? store_filter : [store_filter];
        const artistFilterArray = Array.isArray(artist_filter) ? artist_filter : [artist_filter];

        const filter = await Filter.create({
            title,
            description,
            runTime,
            deposit_amount,
            checkout_amount,
            total_amount,
            status,
            store_filter: storeFilterArray,
            artist_filter: artistFilterArray,
            category_filter,
            cost,
            discount,
            tax,
            fee
        });

        res.status(200).json({
            status: 'success',
            filter
        });

    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};


// LIST / GET All filter items 
exports.getFilter = async(req,res,next) => {
    try {
        const filter = await Filter.find({})

        res.status(200).json({
            status: 'success',
            filter
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// Edit section book-now 
exports.editSectionBooknowFields = async(req,res,next) => {
    const { field, value } = req.body;

    try {
        const response = await Book.findOneAndUpdate(
            { customer: req.user._id, confirm: { $exists: false } },
            { [field]: value },
            { new: true }
        )

        // console.log('RESPONSE -->', response)

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// Edit section book-now 
exports.editSectionCheckoutArtistFields = async(req,res,next) => {
    const { 
        confirm_payment,
        send_email_customer_receipt,
        imageUrlCheckoutProgress,
        checkout_status_tattoo_artist,
        continue_checkout_mixed,
        artist_rating_to_customer,
        id 
    } = req.body;

    // console.log(req.body);
    try {

        // Mudar o filtro
        const response = await Book.findOneAndUpdate(
            { _id: id },
            {
                confirm_payment: confirm_payment,
                send_email_customer_receipt: send_email_customer_receipt,
                imageUrlCheckoutProgress: imageUrlCheckoutProgress,
                checkout_status_tattoo_artist: checkout_status_tattoo_artist,
                continue_checkout_mixed: continue_checkout_mixed,
                artist_rating_to_customer: artist_rating_to_customer
            },
            { new: true }
        )

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// LIST / GET return only one filter item 
exports.getFilterDetail = async(req,res,next) => {
    const { id } = req.params;

    try {
        const filter = await Filter.findOne({ _id: id })

        if(!filter){
            return next(new ErrorHandler('Filter not found','fail',404))
        }

        res.status(200).json({
            status: 'success',
            filter
        })
    }catch(err){
        return next(new ErrorHandler(`${err}`,'fail',500))
    }
}

exports.updateFilter = async(req,res,next) => {
    const { id } = req.params;

    const {
        title,
        description,
        runTime,
        deposit_amount,
        checkout_amount,
        total_amount,
        store_filter,
        artist_filter,
        category_filter,
        cost,
        discount,
        tax,
        fee
    } = req.body;

    try {       
        const existingArtistFilter = await Filter.findOne({
            artist_filter: artist_filter,
            _id: { $ne: id }
        })

        // if(existingArtistFilter){
        //     return next(new ErrorHandler(`Another filter with the same artist filter already exists.`,'fail',400));
        // }else {
            await Filter.findByIdAndUpdate({ _id: id }, {
                title,
                description,
                runTime,
                deposit_amount,
                checkout_amount,
                total_amount,
                store_filter,
                artist_filter,
                category_filter,
                cost,
                discount,
                tax,
                fee
            }) 
    
            res.status(200).json({
                status: 'success',
                message: 'Filter updated successfuly!'
            })
        // }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// Delete one filter item 
exports.deleteFilterItem = async(req,res,next) => {
    const { id } = req.params;

    try {
        const result = await Filter.findByIdAndDelete({ _id: id });

        // console.log(result);
        res.status(204).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

// delete one booked
exports.deleteOneBookedSchedule = async(req, res, next) => {
    const { id } = req.params;

    try {
        await Book.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};


exports.reverseUserRoles = async(req,res,next) => {
    try {
        const customer = await Customer.findOne({ _id: req.user.id });

        if(!customer){
            return next(new ErrorHandler(`Customer not found, please try again --> ${err}`, 'fail', 404));
        }

        customer.roles.reverse();
        await customer.save();

        res.status(200).json({
            status: 'success',
            message: 'Everything is okay'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
} 



// --------------------------------------------------------------------------------------
// CATEGORY 

exports.postCategory = async(req,res,next) => {
    const {
        name,
        description,
        categoryOption
    } = req.body;

    try {
        const categoryData = await Category.create({
            name,
            description,
            categoryOption
        })

        res.status(200).json({
            status: 'success',
            categoryData
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

exports.getCategory= async(req,res,next) => {
    try {
        const categories = await Category.find({})

        res.status(200).json({
            status: 'success',
            categories
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

exports.getCategoryDetail = async(req,res,next) => {
    const { id } = req.params;

    try {
        const categorie = await Category.findOne({ _id: id })

        if(!categorie){
            return next(new ErrorHandler('Category not found','fail',404))
        }

        res.status(200).json({
            status: 'success',
            categorie
        })
    }catch(err){
        return next(new ErrorHandler(`${err}`,'fail',500))
    }
}


exports.updateCheckinApproved = async (req, res, next) => {
    const { id } = req.params;
    let checkinApproved;

    try {
        checkinApproved = JSON.parse(req.body.checkinApproved); // Recebe os dados do frontend
        const files = req.files; // Recebe as imagens uploadadas

        // Adiciona as URLs das imagens ao campo checkinApproved
        for (let index = 0; index < checkinApproved.length; index++) {
            const file = files.find(f => f.fieldname === `image-${index}`);
            if (file) {
                const fileType = file.originalname.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

                if (!allowedExtensions.includes(fileType)) {
                    return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
                }

                const result = await cloudinary.uploader.upload(file.path);
                checkinApproved[index].image = result.url;
            }
        }

        const book = await Book.findByIdAndUpdate(
            id,
            { checkinApproved },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            data: book
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};

exports.updateCategory = async(req,res,next) => {
    const { id } = req.params;

    const {
        name,
        description,
        categoryOption
    } = req.body;

    try {        
        await Category.findByIdAndUpdate({ _id: id }, {
            name,
            description,
            categoryOption
        }) 

        res.status(200).json({
            status: 'success',
            message: 'Category updated successfuly!'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}



exports.updateArtistCheckiValuesToCustomer = async(req,res,next) => {
    const { id } = req.body;
    const { 
        artist_checkin_status,
        artist_checkin_comments,
        checkin_artist_customer_description,
        checkin_artist_fixed_price,
        checkin_artist_per_hours, 
        checkin_artist_confirm_deposit,
        checkin_artist_design_approved,
        checkin_artist_design_approved_explain,
        checkin_artist_start_tattoo,
        checkin_artist_start_tattoo_explain,
        total_amount
    } = req.body;

        // console.log(id);



    try {
        await Book.findByIdAndUpdate({ _id: id }, {
            artist_checkin_status,
            artist_checkin_comments,
            checkin_artist_customer_description,
            checkin_artist_fixed_price,
            checkin_artist_per_hours,
            checkin_artist_confirm_deposit,
            checkin_artist_design_approved,
            checkin_artist_design_approved_explain,
            checkin_artist_start_tattoo,
            checkin_artist_start_tattoo_explain,
            total_amount
        }) 

        res.status(200).json({
            status: 'success',
            message: 'Updated successfuly!'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
} 


exports.askToCustomerToCheckin = async(req,res,next) => {
    const { schedule } = req.body;
    try {
        const message = `Don't forget to check in for your tattoo. Your booking number is ${schedule.appointmentNumber}`;

        await sendMailer({
            to: schedule.customer.email,
            subject: `${schedule.store} - Remember your check-in`,
            message
        })

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

// ---------------------------------------------------------------------------------------------------------

// Book Customer - POST 
// exports.bookCreate = async(req,res,next) => {
//     const { store, artist, categories, appointmentNumber, book_confirm } = req.body;

//     try {
//         const bookData = await Book.findOne({ appointmentNumber: appointmentNumber })

//         if(bookData && bookData?.book_confirm == false){
//             const book = await Book.findOneAndUpdate(bookData._id, {
//                 store, 
//                 artist, 
//                 categories,
//                 book_confirm
//             })

//             return res.status(200).json({
//                 status: 'success',
//                 book,
//                 message: 'Book updated successfuly!'
//             })
//         }else {
//             const book = await Book.create({
//                 store, 
//                 artist, 
//                 categories,
//                 book_confirm,
//                 customer: req.user.id
//             })   

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Book created successfuly!',
//                 book
//             })
//         }
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// GET/ All books return 
exports.getAllBooks = async(req,res,next) => {
    try {
        const dataBooks = await Book.find({}).populate('customer')

        res.status(200).json({
            status: 'success',
            dataBooks
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

// GET/ just one book per ID
exports.getOneBook = async(req,res,next) => {
    try {
        // const dataBook = await Book.findOne({ customer: req.user.id, confirm: { $exists: false } })
        const dataBook = await Book.findOne({ customer: req.user.id, confirm: { $exists: false } })

        res.status(200).json({
            status: 'success',
            dataBook
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


exports.getOneBookSchedule = async(req,res,next) => {
    const { id } = req.params;
    // console.log(id);
    try {

        const dataBooked = await Book.findOne({ _id: id }).populate('customer');

        // console.log(dataBooked);
        res.status(200).json({
            status: 'success',
            booked: dataBooked
        })

    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

exports.getCustomerBooked = async(req,res,next) => {
    const { id } = req.params;

    try {
        const customerBooked = await Book.findOne({ customer: id })

        res.status(200).json({
            status: 'success',
            customerBooked
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


exports.getScheduleBooked = async(req,res,next) => {
    const { id } = req.params;

    try {
        const scheduleBooked = await Book.findOne({ _id: id }).populate('customer')

        // console.log('Schedule booked --> ', scheduleBooked);

        res.status(200).json({
            status: 'success',
            scheduleBooked
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

exports.getFilterByStoreBookedSchedule = async(req,res,next) => {
    const { store } = req.params;

    // console.log(store)
    try {
        const scheduleFilterBooked = await Filter.find({ store_filter: store.trim() });

        // console.log(scheduleFilterBooked)

        res.status(200).json({
            status: 'success',
            scheduleFilterBooked
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


exports.getAllBookedCustomer = async(req,res,next) => {
    const { id } = req.params;

    try {
        const customerBooked = await Book.find({ customer: id })

        // console.log(customerBooked);
        res.status(200).json({
            status: 'success',
            customerBooked
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}


// Filter runTime, deposit_amount and more...
exports.getFilteredBooks = async (req, res, next) => {
    try {
        const books = await Book.aggregate([
            {
                $match: {
                    "customer": req.user._id, 
                    "book_confirm": { $ne: true }
                }
            },
            {
                $lookup: {
                    from: "filters", 
                    localField: "artist", 
                    foreignField: "artist_filter", 
                    as: "filterDetails"
                }
            },
            {
                $unwind: {
                    path: "$filterDetails",
                    preserveNullAndEmptyArrays: false // Ajuda a garantir que apenas documentos com detalhes de filtros sejam processados
                }
            },
            {
                $project: {
                    store: 1,
                    artist: 1,
                    categories: 1,
                    runtime: "$filterDetails.runTime",
                    deposit_amount: "$filterDetails.deposit_amount",
                    total_amount: "$filterDetails.total_amount",
                    checkout_amount: "$filterDetails.checkout_amount",
                    type_service: "$filterDetails.title",
                    cost: "$filterDetails.cost",
                    tax: "$filterDetails.tax",
                    fee: "$filterDetails.fee",
                    discount: "$filterDetails.discount",
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: books
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// Book Customer - POST 
// exports.bookCreate = async(req, res, next) => {
//     const { 
//         store, 
//         artist, 
//         categories, 
//         book_confirm, 
//         images, 
//         payment,
//         read_before,
//         document_photo,
//         bio,
//         health,
//         legal,
//         social,
//         guidelines_preparation,
//         sterilization_safety,
//         confirm,
//         deposit_amount,
//         run_time,
//         date, 
//         time,
//         type_service,
//         checkout_amount,
//         total_amount,
//         cost,
//         discount,
//         tax,
//         fee,
//         checkout_payment_status,
//         comments_reference
//     } = req.body;



//     // console.log('PAYMENT --> ', payment)
//     try {
//         // Procura por um agendamento existente para o usuário que ainda não foi confirmado.
//         const existingBooking = await Book.findOne({ customer: req.user._id, confirm: { $exists: false }, confirm_checkout: { $exists: false }});

//         if(existingBooking) {
//             // Atualiza o agendamento existente.
//             await Book.updateOne({ _id: existingBooking._id }, 
//                 { 
//                     store, 
//                     artist, 
//                     categories, 
//                     book_confirm: book_confirm || existingBooking.book_confirm, 
//                     images,
//                     payment,
//                     read_before,
//                     document_photo,
//                     bio,
//                     health,
//                     legal,
//                     social,
//                     guidelines_preparation,
//                     sterilization_safety,
//                     confirm,
//                     deposit_amount: deposit_amount,
//                     run_time,
//                     date,
//                     time,
//                     type_service,
//                     checkout_amount: checkout_amount,
//                     total_amount: total_amount,
//                     cost,
//                     discount,
//                     tax,
//                     fee,
//                     checkout_payment_status,
//                     comments_reference
//                 }
//             );

//             // Se estiver confirmando o agendamento, não cria um novo imediatamente.
//             if(book_confirm) {
//                 return res.status(200).json({
//                     status: 'success',
//                     message: 'Booking confirmed successfully!'
//                 });
//             } else {
//                 return res.status(200).json({
//                     status: 'success',
//                     message: 'Booking updated successfully!'
//                 });
//             }
//         } else {
//             // Se não houver agendamento não confirmado, cria um novo agendamento.
//             const newBooking = await Book.create({
//                 store, 
//                 artist, 
//                 categories,
//                 customer: req.user._id,
//                 book_confirm,
//                 images,
//                 payment,
//                 read_before,
//                 document_photo,
//                 bio,
//                 health,
//                 legal,
//                 social,
//                 guidelines_preparation,
//                 sterilization_safety,
//                 confirm,
//                 deposit_amount,
//                 run_time,
//                 type_service,
//                 comments_reference
//             });

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Booking created successfully!'
//             });
//         }
//     } catch(err) {
//         return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
// };


// show only in groups continue tattoos history... 
exports.showHistoryContinueTattoos = async (req, res, next) => {
    try {
        // 1. Busque todos os agendamentos agrupados pelo campo `tag`
        const bookings = await Book.find().lean();

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }

        // 2. Agrupe os agendamentos por `tag`
        const groupedBookings = bookings.reduce((acc, booking) => {
            const tag = booking.tag;

            if (!acc[tag]) {
                acc[tag] = [];
            }

            acc[tag].push({
                appointmentNumber: booking.appointmentNumber,
                customerId: booking.customer,
                artist: booking.artist,
                date: booking.date,
                time: booking.time,
                total_amount: booking.total_amount,
                images: booking.images,
                continue_tattoo_artist_status: booking.continue_tattoo_artist_status
            });

            return acc;
        }, {});

        // 3. Para cada grupo, buscar informações do cliente
        const response = await Promise.all(
            Object.keys(groupedBookings).map(async (tag) => {
                const bookingsForTag = groupedBookings[tag];

                // Adicionar detalhes do cliente para cada agendamento
                const detailedBookings = await Promise.all(
                    bookingsForTag.map(async (booking) => {
                        const customer = await Customer.findById(booking.customer).select('name email phone').lean();

                        return {
                            ...booking,
                            customer: customer ? {
                                name: customer.name,
                                email: customer.email,
                                phone: customer.phone
                            } : null
                        };
                    })
                );

                return {
                    tag,
                    appointments: detailedBookings
                };
            })
        );

        // 4. Enviar a resposta agrupada
        return res.status(200).json(response);
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 500));
    }
};


exports.bookCreate = async (req, res, next) => {
    const { 
        store, 
        artist, 
        categories, 
        book_confirm, 
        images, 
        payment,
        read_before,
        document_photo,
        bio,
        health,
        legal,
        social,
        guidelines_preparation,
        sterilization_safety,
        confirm,
        deposit_amount,
        run_time,
        date, 
        time,
        type_service,
        checkout_amount,
        total_amount,
        cost,
        discount,
        tax,
        fee,
        checkout_payment_status,
        comments_reference,
        appointmentNumber,
        update_fields_checkin_customer_tatoo,
        only_update_fields_checkin_customer_tattoo
    } = req.body;

    try {
        // Se houver um appointmentNumber, verifique se ele já existe no banco de dados
        if(appointmentNumber){
            let existingBooking;
            

            console.log(read_before)
            if (appointmentNumber) {
                existingBooking = await Book.findOne({ 
                    customer: req.user._id, 
                    appointmentNumber, // Procurar pelo número do agendamento específico
                    confirm_checkout: { $exists: false }, // O pagamento ainda não foi concluído
                    checkout_payment_status: { $ne: 'paid' } // O pagamento ainda não foi pago
                });
            } else {
                // Se não houver appointmentNumber, procure um agendamento não finalizado
                existingBooking = await Book.findOne({ 
                    customer: req.user._id, 
                    confirm: { $ne: 'Confirm' }, // O cliente ainda não confirmou o agendamento
                    confirm_checkout: { $exists: false }, // O pagamento ainda não foi concluído
                    checkout_payment_status: { $ne: 'paid' } 
                });
            }
        
            // Se houver um agendamento existente
            if (existingBooking) {
                // Atualize o agendamento existente
                await Book.updateOne({ _id: existingBooking._id }, 
                    { 
                        store, 
                        artist, 
                        categories, 
                        book_confirm: book_confirm || existingBooking.book_confirm, 
                        images,
                        payment,
                        read_before,
                        document_photo,
                        bio,
                        health,
                        legal,
                        social,
                        guidelines_preparation,
                        sterilization_safety,
                        confirm,
                        deposit_amount,
                        run_time,
                        date,
                        time,
                        type_service,
                        checkout_amount: checkout_amount || existingBooking.checkout_amount,
                        total_amount: total_amount || existingBooking.total_amount,
                        cost: cost || existingBooking.cost,
                        discount: discount || existingBooking.discount,
                        tax: tax || existingBooking.tax,
                        fee: fee || existingBooking.fee,
                        checkout_payment_status: checkout_payment_status || existingBooking.checkout_payment_status,
                        comments_reference: comments_reference || existingBooking.comments_reference,
                        update_fields_checkin_customer_tatoo,
                        only_update_fields_checkin_customer_tattoo
                    }
                );
            }

            // console.log('EXISTE UM APPOINTMENT')

            return res.status(200).json({
                status: 'success'
            })
        } 

        const existingBooking = await Book.findOne({ customer: req.user._id, confirm: { $exists: false }, confirm_checkout: { $exists: false }});

        if(existingBooking) {
            // Atualiza o agendamento existente.
            await Book.updateOne({ _id: existingBooking._id }, 
                { 
                    store, 
                    artist, 
                    categories, 
                    book_confirm: book_confirm || existingBooking.book_confirm, 
                    images,
                    payment,
                    read_before,
                    document_photo,
                    bio,
                    health,
                    legal,
                    social,
                    guidelines_preparation,
                    sterilization_safety,
                    confirm,
                    deposit_amount: deposit_amount,
                    run_time,
                    date,
                    time,
                    type_service,
                    checkout_amount: checkout_amount,
                    total_amount: total_amount,
                    cost,
                    discount,
                    tax,
                    fee,
                    checkout_payment_status,
                    comments_reference,
                    update_fields_checkin_customer_tatoo,
                    only_update_fields_checkin_customer_tattoo
                }
            );

            // console.log('Há um registro em aberto')

            return res.status(200).json({ status: 'success' })
        }else {
            let tag = 1;

            const bookConfirm = await Book.findOne({ customer: req.user._id, categories: { $exists: false } });

            const lookingForTag = await Book.findOne({ customer: req.user._id, tag: { $exists: true }})
            
            if(lookingForTag){
                tag = tag + lookingForTag.tag;
            }else{
                tag = tag;
            }

            if(categories){
                if(!bookConfirm){
                    const newBooking = await Book.create({
                        store, 
                        artist, 
                        categories,
                        customer: req.user._id,
                        appointmentNumber, // Incluindo o número do agendamento
                        book_confirm,
                        images,
                        payment,
                        read_before,
                        document_photo,
                        bio,
                        health,
                        legal,
                        social,
                        guidelines_preparation,
                        sterilization_safety,
                        confirm,
                        deposit_amount,
                        run_time,
                        date,
                        time,
                        type_service,
                        checkout_amount,
                        total_amount,
                        cost,
                        discount,
                        tax,
                        fee,
                        checkout_payment_status,
                        comments_reference,
                        tag
                    });
                }
            }
            // Se não houver um agendamento existente, crie um novo agendamento

            // console.log('Não há nenhum registro ainda, você pode criar um')
            return res.status(200).json({ status: 'success' })
        }  
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 500));
    }
};

// exports.bookCreate = async (req, res, next) => {
//     const {
//         store,
//         artist,
//         categories,
//         book_confirm,
//         images,
//         payment,
//         read_before,
//         document_photo,
//         bio,
//         health,
//         legal,
//         social,
//         guidelines_preparation,
//         sterilization_safety,
//         confirm,
//         deposit_amount,
//         run_time,
//         date,
//         time,
//         type_service,
//         checkout_amount,
//         total_amount,
//         cost,
//         discount,
//         tax,
//         fee,
//         checkout_payment_status,
//         comments_reference,
//         appointmentNumber, // Número do agendamento
//     } = req.body;

//     try {
//         // 1. Verificar se há um agendamento de continuação
//         const continuationBooking = await Book.findOne({
//             customer: req.user._id,
//             appointment_continue_reference: { $exists: true },
//             confirm_checkout: { $exists: false }, // Não finalizado
//             checkout_payment_status: { $ne: 'paid' }, // Não está pago
//         });

//         if (continuationBooking) {
//             console.log('Agendamento de continuação encontrado:', continuationBooking);

//             // Atualiza somente o agendamento de continuação
//             await Book.updateOne(
//                 { _id: continuationBooking._id },
//                 {
//                     store,
//                     artist,
//                     categories,
//                     book_confirm: book_confirm || continuationBooking.book_confirm,
//                     images,
//                     payment,
//                     read_before,
//                     document_photo,
//                     bio,
//                     health,
//                     legal,
//                     social,
//                     guidelines_preparation,
//                     sterilization_safety,
//                     confirm,
//                     deposit_amount,
//                     run_time,
//                     date,
//                     time,
//                     type_service,
//                     checkout_amount,
//                     total_amount,
//                     cost,
//                     discount,
//                     tax,
//                     fee,
//                     checkout_payment_status,
//                     comments_reference,
//                 }
//             );

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Agendamento de continuação atualizado com sucesso.',
//             });
//         }

//         // 2. Verificar se há um agendamento em aberto (nova tatuagem)
//         const existingBooking = await Book.findOne({
//             customer: req.user._id,
//             confirm_checkout: { $exists: false }, // Não finalizado
//             checkout_payment_status: { $ne: 'paid' }, // Não está pago
//         });

//         if (existingBooking) {
//             console.log('Agendamento em aberto encontrado:', existingBooking);

//             // Atualiza o agendamento existente para nova tatuagem
//             await Book.updateOne(
//                 { _id: existingBooking._id },
//                 {
//                     store,
//                     artist,
//                     categories,
//                     book_confirm: book_confirm || existingBooking.book_confirm,
//                     images,
//                     payment,
//                     read_before,
//                     document_photo,
//                     bio,
//                     health,
//                     legal,
//                     social,
//                     guidelines_preparation,
//                     sterilization_safety,
//                     confirm,
//                     deposit_amount,
//                     run_time,
//                     date,
//                     time,
//                     type_service,
//                     checkout_amount,
//                     total_amount,
//                     cost,
//                     discount,
//                     tax,
//                     fee,
//                     checkout_payment_status,
//                     comments_reference,
//                 }
//             );

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Agendamento atualizado com sucesso.',
//             });
//         }

//         // 3. Se nenhum agendamento existir, criar um novo
//         console.log('Criando um novo agendamento.');
//         await Book.create({
//             store,
//             artist,
//             categories,
//             customer: req.user._id,
//             appointmentNumber, // Incluindo o número do agendamento
//             book_confirm,
//             images,
//             payment,
//             read_before,
//             document_photo,
//             bio,
//             health,
//             legal,
//             social,
//             guidelines_preparation,
//             sterilization_safety,
//             confirm,
//             deposit_amount,
//             run_time,
//             date,
//             time,
//             type_service,
//             checkout_amount,
//             total_amount,
//             cost,
//             discount,
//             tax,
//             fee,
//             checkout_payment_status,
//             comments_reference,
//         });

//         return res.status(200).json({
//             status: 'success',
//             message: 'Novo agendamento criado com sucesso.',
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Something went wrong: ${err.message}`, 500));
//     }
// };





exports.getCustomerAppointments = async (req, res, next) => {
    try {
        // Obter o ID do usuário logado
        const customerId = req.user._id;

        // Buscar todos os agendamentos associados ao ID do cliente
        const appointments = await Book.find({ 
            customer: customerId,
            continue_tattoo_artist_status: false
        }).populate('customer');

        // Verificar se há agendamentos
        if (!appointments.length) {
            return res.status(200).json({
                status: 'success',
                message: 'No appointments found for this customer.',
                data: []
            });
        }

        // Retornar os agendamentos encontrados
        res.status(200).json({
            status: 'success',
            data: appointments
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};



exports.saveReferecenArtistImagesToCustomer = async(req,res,next) => {
    const { id, imagesReferenceArtistImages } = req.body;
    
    try {

        // console.log(imagesReferenceArtistImages);
        await Book.findByIdAndUpdate(id, { 
            $set: { imagesReferenceArtistImages: imagesReferenceArtistImages }
        });

        res.status(200).json({ status: 'success' })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 500));
    }
}



exports.arrivalNotificationStatus = async(req,res,next) => {
    const { bookingId } = req.body;  
    const { arrival_status } = req.body; 

    try {
        // Atualiza o campo arrival_status para o agendamento específico
        await Book.updateOne({ _id: bookingId }, { $set: { arrival_status: arrival_status } });

        res.status(200).json({
            status: 'success',
            message: 'Arrival status updated successfully'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

exports.checkoutUpdateField = async(req,res,next) => {
    const { id } = req.params;
    const { 
        checkout_payment_status,
        confirm_payment,
        payment_method,
        customer_payment_confirmed,
        customer_after_care_instructions,
        pay_on_cash
    } = req.body;


    // console.log('CUSTOMER PAYMENT CONFIRMED', customer_payment_confirmed);

    try {
        const existingCheckoutRegister = await Book.findOne({ _id: id, confirm: { $exists: true }, confirm_checkout: { $exists: false } });


        // console.log('EXISTING CHECKOUT REGISTER --> ', existingCheckoutRegister);
        if(existingCheckoutRegister) {
            await Book.updateOne({ _id: existingCheckoutRegister._id }, 
                { 
                    checkout_payment_status,
                    confirm_payment,
                    payment_method,
                    customer_payment_confirmed,
                    customer_after_care_instructions,
                    pay_on_cash
                }
            );

            res.status(200).json({
                status: 'success',
                message: 'checkout updated successfuly'               
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

exports.permissionToContinueTattoo = async(req,res,next) => {
    const { id, continue_tattoo_closed } = req.body;

    // console.log('ID --> ', id);
    // console.log('CONTINUE TATTOO CLOSED CUSTOM --> ', continue_tattoo_closed);

    try {
        // Verifica se o ID foi enviado
        if (!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required field: id'
            });
        }

        // Atualiza apenas o campo que foi enviado
        const result = await Book.updateOne(
            { _id: id }, 
            { $set: { continue_tattoo_closed } }  // Atualiza apenas continue_tattoo_closed
        );

        // Verifica se o documento foi modificado
        if (result.nModified === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'No document was updated'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Field updated successfully'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
}



// Create new appointment based on continue tattoo
exports.createNewAppointmentContinueTattoo = async(req,res,next) => {
    try {
        const {
            appointmentNumber,
            artist,
            book_confirm,
            categories,
            cost,
            customer,
            date,
            deposit_amount,
            checkout_amount,
            googleCalendarEventId,
            images,
            payment,
            payment_method,
            run_time,
            store,
            time,
            total_amount,
            type_service,
            appointment_continue_reference,
            imagesReferenceArtistImages,
            comments_reference,
        } = req.body;

        // const updateOldContinueAppointment = await Book.findOne({ appointmentNumber: appointment_continue_reference, customer: req.user._id })
    
        const updateOldContinueAppointment = await Book.findOneAndUpdate({ 
            appointmentNumber: appointment_continue_reference,
            customer: req.user._id 
            },{
                continue_tattoo_artist_status: false,
                continue_tattoo_closed: false 
            },
            { new: true }
        ).lean(); // return only pure object and remove some method from mongoose by default.

        if(!updateOldContinueAppointment) {
            return res.status(400).json({
                status: 'fail',
                message: `Semething went wrong when you tried to updated old appointment, please try again.`
            })
        }

        // Create just an object to prevent duplicate ._id
        const newAppointmentData = {
            appointmentNumber,
            arrival_status: false,
            artist,
            book_confirm,
            categories,
            cost,
            customer,
            date,
            deposit_amount,
            googleCalendarEventId,
            images,
            payment,
            payment_method,
            run_time,
            store,
            time,
            checkout_amount,
            total_amount,
            type_service,
            appointment_continue_reference,
            imagesReferenceArtistImages,
            comments_reference,
            emailSentToCustomerBeforeAppointment: false, // Inicializa como falso
            cancelled_appointment_customer_sorry: false, // Inicializa como falso
            history: [
                ...(updateOldContinueAppointment.history || []), // Certificar que o histórico existe
                {
                    appointmentNumber: updateOldContinueAppointment.appointmentNumber,
                    date: updateOldContinueAppointment.date,
                    time: updateOldContinueAppointment.time,
                    artist: updateOldContinueAppointment.artist
                }
            ],
            tag: updateOldContinueAppointment.tag
        };

        // Prevent that the previous _id be added to new documen.t
        delete newAppointmentData._id;


        // Create new document in the collection.
        await Book.create(newAppointmentData);

        res.status(200).json({
            status: 'success',
            message: 'new appointment saved sucessfuly!'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500))
    }
}


exports.checkoutArtistContinueTattoo = async (req, res, next) => {
    const { 
        id,
        continue_tattoo_artist_status,
        continue_tattoo_closed,
        continue_checkout_mixed
    } = req.body;

    // console.log('CONTINUE TATTOO ARTIST STATUS --> ', continue_tattoo_artist_status);
    try {
        // Verificando se os dados obrigatórios foram fornecidos
        if (!id || continue_tattoo_artist_status === undefined) {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required fields: id and/or continue_tattoo_artist_status'
            });
        }

        // Buscando o registro existente
        const existingCheckoutRegister = await Book.findById(id);

        // Verificando se o registro existe
        if (!existingCheckoutRegister) {
            return res.status(404).json({
                status: 'fail',
                message: 'Checkout not found'
            });
        }

        // Atualizando apenas o campo necessário
        await Book.updateOne(
            { _id: id }, 
            { $set: { continue_tattoo_artist_status, continue_tattoo_closed, continue_checkout_mixed } } // Usando $set para atualizar o campo específico
        );

        return res.status(200).json({
            status: 'success',
            message: 'Checkout updated successfully'
        });
    } catch (err) {
        // Tratando erros com uma mensagem mais descritiva
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};



exports.getStoreByName = async(req,res,next) => {
    const { store } = req.body;
    
    try {
        const storeCustom = await Store.findOne({ name: store })

        // console.log(storeCustom);


        return res.status(200).json({
            status: 'success',
            data: storeCustom
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}


// exports.getArtistByNameCustom = async(req,res,next) => {
//     const { artist_name } = req.body;
    
//     try {
//         const artistCustom = await Customer.findOne({ name: artist_name })

//         const storeCustom = await Store.findOne({ name: store })
        

//         console.log(artistCustom);


//         return res.status(200).json({
//             status: 'success',
//             data: artistCustom
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
// }


exports.getArtistByNameCustom = async (req, res, next) => {
    const { artist_name } = req.body;

    try {
        // Encontrar o artista pelo nome
        const artistCustom = await Customer.findOne({ name: artist_name });
        
        // Verificar se o artista foi encontrado
        if (!artistCustom) {
            return res.status(404).json({
                status: 'fail',
                message: 'Artist not found'
            });
        }

        // Encontrar a loja relacionada ao artista
        const storeCustom = await Store.findOne({ name: artistCustom.store });

        // Encontrar os filtros relacionados ao artista
        const filters = await Filter.findOne({ artist_filter: { $in: [artist_name] } });
        
        if (!filters) {
            return res.status(404).json({
                status: 'fail',
                message: 'No filters found for this artist'
            });
        }

        // Preparar uma lista de valores para estilos e serviços de maneira dinâmica
        let dynamicData = [];

        // Iterar pelas categorias e adicionar os pares chave-valor dinamicamente
        filters.category_filter.forEach(category => {
            // Iterar sobre cada chave e valor dinamicamente
            for (let [key, value] of Object.entries(category)) {
                dynamicData.push(`${value}`);
            }
        });

       

        // Preparar a resposta com os dados específicos
        const response = {
            Shop: filters.store_filter ? filters.store_filter[0] : 'Unknown',  // Primeira loja encontrada no array
            DynamicInfo: dynamicData.length > 0 ? dynamicData.join(', ') : 'No additional info available',  // Dados dinâmicos (chave e valor)
            Services: filters.title  
        };

        // Retornar os dados
        return res.status(200).json({
            status: 'success',
            data: response,
            artistCustom
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
};

exports.getOneBookeFinishedTattoo = async(req,res,next) => {
    const { id } = req.params;

    try {
        const cancelledAndFinishedTattoo = await Book.findOne({ _id: id }).populate('customer');

        res.status(200).json({
            result: cancelledAndFinishedTattoo
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
}


exports.restoreAppointmentCancelledTattoo = async(req,res,next) => {
    const { id } = req.body;
    
    try {   
     
        await Book.findOneAndUpdate({ _id: id }, {
            continue_tattoo_artist_status: false,
            artist_finish_checkout_without_link: false
        },{
            new: true
        })

        res.status(200).json({
            status: 'success',
            message: 'updated successfuly'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
}

// Return an collections according appointment number
exports.getAppointmentNumber = async(req,res,next) => {
    const { appointmentNumber } = req.body;

    try {
        // console.log('REQUEST USER --> ', req.user)
        // console.log(req.user);
        const appointment = await Book.findOne({ appointmentNumber: 'Appointment #' + appointmentNumber, customer: req.user._id })

        // console.log(appointment);

        res.status(200).json({
            status: 'success',
            appointment
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
} 


exports.clearAppointmentFields = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        // console.log('ID CONTINUE --> ', req.body);

        // Verifique se o ID foi fornecido
        if (!appointmentId) {
            return res.status(400).json({ status: 'fail', message: 'Appointment ID is required.' });
        }

        // Atualize os campos especificados para `null`
        const updatedAppointment = await Book.findByIdAndUpdate(
            appointmentId,
            {
                confirm_payment: null,
                customer_rating_to_artist: null,
                customer_payment_confirmed: null,
                customer_after_care_instructions: null,
                customer_finish_and_confirm_checkout: null,
                checkout_payment_status: null,
                pay_on_cash: null
            },
            { new: true }
        );

        // Verifique se a atualização foi bem-sucedida
        if (!updatedAppointment) {
            return res.status(404).json({ status: 'fail', message: 'Appointment not found.' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Fields cleared successfully.',
            data: updatedAppointment
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
};


exports.getAppointmentsNumberContinueTattoo = async(req,res,next) => {
    try {
        const appointments = await Book.find({
            "continueAppointmentsData": { $exists: true, $ne: null },
            customer: req.user._id
        })

        res.status(200).json({
            status: 'success',
            data: {
                appointments
            }
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
}



// UPDATE NEW - appointment
exports.updateAppointmentNumber = async(req,res,next) => {
    const { appointmentNumber, continueAppointmentsData } = req.body;
    
    // Acessa o campo 'commentsContinue' de 'continueAppointmentsData'
    const commentsContinue = continueAppointmentsData.commentsContinue;
    const date = continueAppointmentsData.date;
    let time = continueAppointmentsData.time;

    time = moment(time, 'hh:mm A').subtract(1, 'hours').format('hh:mm A');

    // console.log('BODY--> ', req.body)

    try {
        // Log para garantir que o campo está chegando corretamente no backend
        // console.log('BODY --> ', req.body);

        // Encontrar o agendamento pelo número e pelo cliente logado
        const appointment = await Book.findOneAndUpdate(
            { appointmentNumber: appointmentNumber, customer: req.user._id },
            { $set: { 
                'continueAppointmentsData.commentsContinue': commentsContinue,
                'continueAppointmentsData.date': date,
                'continueAppointmentsData.time': time
            } }, // Atualiza o campo
            { new: true } // Retorna o documento atualizado
        );

        // console.log('DATA -->', appointment);

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                appointment
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
}

// Upload just one image
exports.uploadCustomerFinalTattooCheckout = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];
    let imageUrl = ''; // Para armazenar a URL da imagem carregada

    try {
        // Verifica se há arquivos enviados
        if (!req.files || req.files.length === 0) {
            return next(new ErrorHandler('No file uploaded', 'fail', 400));
        }

        // Verifica se o número de arquivos é maior que 1
        if (req.files.length > 1) {
            return next(new ErrorHandler('You can upload only one image.', 'fail', 400));
        }

        const file = req.files[0]; // Pega o primeiro e único arquivo enviado
        const fileType = file.originalname.split('.').pop().toLowerCase();

        // Valida a extensão do arquivo
        if (!allowedExtensions.includes(fileType)) {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed.', 'fail', 400));
        }

        // Carregar a imagem para o Cloudinary
        const result = await cloudinary.uploader.upload(file.path);
        imageUrl = result.secure_url; // Armazenar a URL da imagem retornada

        // Atualizar o documento de agendamento (BookNow) com a URL da imagem
        const updatedBookNow = await Book.findByIdAndUpdate(
            req.params.id, // ID do agendamento passado como parâmetro
            { customer_rate_final_tattoo: imageUrl }, // Atualiza o campo com a URL da imagem
            { new: true, runValidators: true } // Retorna o documento atualizado e executa validações
        );

        // Verifica se o documento foi encontrado e atualizado
        if (!updatedBookNow) {
            return next(new ErrorHandler(`Appointment not found with id: ${req.params.id}`, 'fail', 404));
        }

        // Resposta de sucesso com o documento atualizado
        res.status(200).json({
            status: 'success',
            message: 'Image uploaded and appointment updated successfully',
            updatedBookNow // Retorna o documento atualizado
        });

    } catch (err) {
        return next(new ErrorHandler(`Upload failed: ${err.message}`, 'fail', 400));
    }
};




// References images tattoo - Upload multiples images 
exports.uploadReferenceImagesBookNow = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];
    let imagesUrls = []; // Para armazenar as URLs das imagens carregadas


    try {
        // Verifica se o número de arquivos excede o limite de 5
        if (req.files.length > 5) {
            return next(new ErrorHandler(`You can upload a maximum of 5 images.`, 'fail', 400));
        }

        // Iterar sobre cada arquivo enviado
        for (const file of req.files) {
            const fileType = file.originalname.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileType)) {
                return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
            }

            // Carregar para o Cloudinary
            const result = await cloudinary.uploader.upload(file.path);
            imagesUrls.push(result.secure_url); // Armazenar a URL retornada
        }

        // Aqui você pode salvar as URLs no banco de dados conforme necessário
        // Por exemplo, atualizando um documento existente com as novas URLs de imagem
        res.status(200).json({
            status: 'success',
            imagesUrls
        });
    } catch (err) {
        return next(new ErrorHandler(`Upload fail: ${err.message}`, 'fail', 400));
    }
};


// ---------------------------------------------------------------------------------------------------

// Checkout payment STRIPE 
exports.bookPaymentStripe = async(req,res,next) => {
    try {
        let { amount, id, email, appointmentId } = req.body;

        try {
            // console.log('success')
            const customer = await stripe.customers.create({
                email,
                payment_method: id
            })
            
            const payment = await stripe.paymentIntents.create({
                amount,
                currency: 'USD',
                customer: customer.id,
                description: 'Memory RAM',
                payment_method: id,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            })

            // Atualizar o status de pagamento no banco de dados
            await Book.findByIdAndUpdate(appointmentId, { payment: 'paid' });
    
            res.status(200).json({
                status: 'success',
                payment
            })
        }catch(err){
            res.status(400).json({
                status: 'fail',
                message: err.message
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Upload fail: ${err.message}`, 'fail', 400));
    }
}

// All schedules customer 
exports.allSchedulesCustomer = async (req, res, next) => {
    try {
        const customerSchedules = await Book.find({ customer: req.user.id }).sort({ date: -1 }); // Suponho que `req.user.id` está correto e você tem autenticação configurada
        

        // Verificar se há registros retornados
        if (customerSchedules && customerSchedules.length > 0) {
            res.status(200).json({
                status: 'success',
                data: customerSchedules // Use um campo como `data` para enviar os dados de agendamentos
            });
        } else {
            // Se não houver agendamentos, pode ser tratado como uma consulta bem-sucedida, mas sem dados
            res.status(200).json({
                status: 'success',
                message: 'No schedules found for this customer.'
            });
        }
    } catch (err) {
        // Use o next com um erro personalizado ou retorne diretamente uma resposta de erro
        return next(new ErrorHandler(`Service fail, please try again: ${err.message}`, 'fail', 500));
    }
}


exports.artistCheckoutFilterAndSort = async (req, res, next) => {
    const { sort } = req.query;

    // Define a ordem com base no valor enviado no corpo da requisição
    const sorted = sort === 'asc' ? 1 : -1;

    try {
        const allCheckoutFiltered = await Book.find({
            book_confirm: true,
            confirm: 'Confirm',  
            arrival_status: true,
            $or: [
                { customer_finish_and_confirm_checkout: { $exists: false } },
                { customer_finish_and_confirm_checkout: false }
            ]
        }).populate('customer').sort({ date: sorted, time: sorted }); // Usa a variável sorted dinamicamente

        // Log para depuração
        // console.log('Ordenação:', sort, sorted);
        // console.log('Resultados ordenados:', allCheckoutFiltered);

        res.status(200).json({
            status: 'success',
            allCheckoutFiltered
        });
    } catch (err) {
        console.error('Erro no artistCheckinFilterAndSort:', err); // Log de erro para depuração
        return next(new ErrorHandler(`Your service stopped because an error occurred: ${err.message}`, 'fail', 500));
    }
};



exports.artistCheckinFilterAndSort = async (req, res, next) => {
    const { sort } = req.query;

    const sorted = sort === 'asc' ? 1 : -1;

    try {
        const allCheckinFiltered = await Book.find({
            book_confirm: true,
            confirm: 'Confirm',
            $or: [
                { customer_payment_confirmed: false },
                { customer_payment_confirmed: { $exists: false } }
            ],
            $or: [
                { arrival_status: false },
                { arrival_status: { $exists: false } }
            ]
        }).populate('customer').sort({ date: sorted, time: sorted }); 

        // Log para depuração
        // console.log('Ordenação:', sort, sorted);
        // console.log('Resultados ordenados:', allCheckinFiltered);

        res.status(200).json({
            status: 'success',
            allCheckinFiltered
        });
    } catch (err) {
        console.error('Erro no artistCheckinFilterAndSort:', err); // Log de erro para depuração
        return next(new ErrorHandler(`Your service stopped because an error occurred: ${err.message}`, 'fail', 500));
    }
};

// Fetch and sort all schedules from artist
exports.sortedItemsTableScheduleArtist = async(req,res,next) => {
    const { sort } = req.query;
    const sorted = sort === 'asc' ? 1 : -1;
    
    try {
        const allSchedulesFiltered = await Book.find({
            book_confirm: true,
            confirm: 'Confirm'
        }).populate('customer').sort({ date: sorted, time: sorted }); 

        res.status(200).json({
            status: 'success',
            allSchedulesFiltered
        })
    }catch(err){
        return next(new ErrorHandler(`Your service stopped because an error occurred: ${err.message}`, 'fail', 500));
    }
}

// artist checkin update fields 
exports.artistCheckinUpdateFields = async(req,res,next) => {
    const { field, value, id } = req.body;


    // console.log('FIELD ==> ', field)
    // console.log('ID ==> ', id)
    // console.log('VALUE ==> ', value)
    try {
        const response = await Book.findOneAndUpdate(
            { _id: id },
            { [field]: value },
            { new: true }
        )

        // console.log('RESPONSE ==> ', response);

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Your service stopped because an error occurred: ${err.message}`, 'fail', 500));
    }
}


// CHECKOUT
exports.checkoutBooked = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const customerCheckoutBooked = await Book.findOne({ _id: id }).populate('customer');

        // Verificar se há registro retornado
        if (customerCheckoutBooked) {
            res.status(200).json({
                status: 'success',
                data: customerCheckoutBooked // Use um campo como `data` para enviar os dados de agendamentos
            });
        } else {
            // Se não houver agendamento, trate como não encontrado
            res.status(404).json({
                status: 'fail',
                message: 'No schedule found for this customer.'
            });
        }
    } catch (err) {
        // Use o next com um erro personalizado ou retorne diretamente uma resposta de erro
        return next(new ErrorHandler(`Service fail, please try again: ${err.message}`, 'fail', 500));
    }
}


// POST /rebook
exports.rebookAppointment = async(req,res,next) => {
    const { id, eventId } = req.body;
    // console.log(id,eventId);
    
    try {   

        // delete collection by ID
        await Book.findByIdAndDelete(id);

        await calendar.events.delete({
            calendarId,
            eventId: eventId
        })

        res.status(204).json({ status: 'success' })
    }catch(err){
        return next(new ErrorHandler(`Service fail, please try again: ${err.message}`, 'fail', 500));
    }
}

// ARTIST - Bring all artis customer booked with him.
exports.allArtistCustomerCheckout = async(req,res,next) => {
    try {
        const allCustomers = await Book.find({ artist: req.user.name }).populate('customer')

        res.status(200).json({
            status: 'success',
            customers: allCustomers
        })
    }catch(err){
        return next(new ErrorHandler(`Service fail, please try again: ${err.message}`, 'fail', 500));
    }
}

exports.artistFindCustomer = async(req,res,next) => {
    const { id } = req.params;

    try {
        const customer = await Book.findOne({ customer: id }).populate('customer');

        res.status(200).json({
            status: 'success',
            customer: customer.customer
        })
    }catch(err){
        return next(new ErrorHandler(`CAN NOT find user: ${err.message}`, 'fail', 500));
    }
}

exports.checkoutArtistSendEmailCustomer = async(req,res,next) => {
    const { email, id } = req.body;
    const message = 'You are receiving this message because your payment has been successfully completed. Thank you!';

    try {
        const response = await sendMailer({
            to: email,
            subject: 'Receipt',
            message
        })

        if(response?.accepted?.length > 0){
            await Book.findByIdAndUpdate(id, {
                send_email_customer_receipt: true
            });

            res.status(200).json({
                status: 'success',
            })
        }else {
            res.status(500).json({
                status: 'fail',
                message: `Something went wrong - server 500`
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}

exports.updateScheduleCustomerAdmin = async(req,res,next) => {
    const { id } = req.params;
    const { time, store, artist, category } = req.body;


    // console.log(id)
    // console.log(time,store, artist, category)

    // console.log(req.body);

    try {
        // await Book.findByIdAndUpdate(id, {

        // })

        res.status(200).json({
            status: 'success',
            message: 'deu tudo certo'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}

exports.deleteCustomerAdminCombined = async(req,res,next) => {
    const { id } = req.params;
    
    try {
        await Customer.findByIdAndRemove(id);

        res.status(204).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}


exports.ratingsCustomerAndArtist = async(req,res,next) => {
    const { artist_rating_to_customer, customer_rating_to_artist, id } = req.body;

    // console.log(artist_rating_to_customer, id)

    try {
            const ratings = await Book.findByIdAndUpdate(id, {
                artist_rating_to_customer, 
                customer_rating_to_artist
            });

            res.status(200).json({
                status: 'success',
                ratings
            })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}

exports.finishArtistCheckout = async(req,res,next) => {
    const { artist_finish_checkout_without_link, id } = req.body;

    // console.log(artist_finish_checkout_without_link, id)

    try {
            const finish = await Book.findByIdAndUpdate(id, {
                artist_finish_checkout_without_link
            });

            res.status(200).json({
                status: 'success',
                finish
            })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}

exports.finishCustomerCheckout = async(req,res,next) => {
    const { customer_finish_and_confirm_checkout, id } = req.body;


    // console.log(id)
    // console.log(artist_finish_checkout_without_link, id)

    // console.log(customer_finish_and_confirm_checkout)

    try {
            const finish = await Book.findByIdAndUpdate(id, {
                customer_finish_and_confirm_checkout
            });

            // console.log(finish)

            res.status(200).json({
                status: 'success',
                finish
            })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong when you try to send an email: ${err.message}`, 'fail', 500));
    }
}



// exports.confirmCustomerCheckout = async(req,res,next) => {
//     try {
//         await Book.update()
//     }catch(err){

//     }
// }

// Upload image to employee
exports.uploadUpdateCustomerArtistDashboardCheckout = async(req,res,next) => {
    const { 
        id, 
        checkout_status_tattoo_artist, 
        checkout_comments_tattoo_artist
    } = req.body;

    // console.log(checkout_status_tattoo_artist,checkout_comments_tattoo_artist);
    
    const allowedExtensions = ['jpg','jpeg','webp','png','gif']

    const filesType = req.file.originalname.split('.').pop().toLowerCase()


    try {
        const uploadImageCheckout = await Book.findById({ _id: id })
        
        // Return image ID and delete direct image direct on cloudinary
        if(uploadImageCheckout?.imageUrlCheckoutProgress){
            const publicId = uploadImageCheckout?.imageUrlCheckoutProgress?.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(publicId)
        }
        // console.log(allowedExtensions.includes(filesType))

        if(allowedExtensions.includes(filesType)){
            cloudinary.uploader.upload(req.file.path, async(err,result) => {
                if(err){
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }
    
                await Book.findOneAndUpdate({ _id: id }, {
                    imageUrlCheckoutProgress: result.url,
                    checkout_status_tattoo_artist, 
                    checkout_comments_tattoo_artist
                })
        
                return res.status(200).json({
                    status: 'success',
                    result: result.url
                })
            })
        }
        
        // else {
        //     return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
        // }
    }catch(err){
        // console.log(err);
        return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
    }
}


// GOOGLE CALENDAR - ACC
// function generateAvailableTimes(date, hoursOfOperation) {
//     const dayOfWeek = moment(date).format('dddd');
//     const operationHours = hoursOfOperation.find(op => op.day === dayOfWeek);

//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//         console.error('No valid operation hours found for this day.');
//         return [];
//     }

//     // Converte os horários diretamente do banco, incluindo AM/PM
//     let startOfDay = moment.tz(
//         `${date} ${operationHours.startTime} ${operationHours.startPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );
//     let endOfDay = moment.tz(
//         `${date} ${operationHours.endTime} ${operationHours.endPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );

//     // Ajusta o horário de término para o próximo dia, se necessário
//     if (endOfDay.isBefore(startOfDay)) {
//         endOfDay.add(1, 'day');
//     }

//     const availableTimes = [];

//     // Half Day (4 horas a partir do início do dia)
//     const halfDayEnd = startOfDay.clone().add(4, 'hours');
//     availableTimes.push({
//         start: startOfDay.toISOString(),
//         end: halfDayEnd.toISOString(),
//         displayStart: startOfDay.format('hh:mm A'),
//         displayEnd: halfDayEnd.format('hh:mm A'),
//         type: 'half-day',
//     });

//     // Full Day (do início ao término configurado no banco)
//     availableTimes.push({
//         start: startOfDay.toISOString(),
//         end: endOfDay.toISOString(),
//         displayStart: startOfDay.format('hh:mm A'),
//         displayEnd: endOfDay.format('hh:mm A'),
//         type: 'full-day',
//     });

//     console.log('Generated Available Times:', availableTimes); // Log para verificação
//     return availableTimes;
// }

// function generateAvailableTimes(date, hoursOfOperation) {
//     const dayOfWeek = moment(date).format('dddd');
//     const operationHours = hoursOfOperation.find(op => op.day === dayOfWeek);

//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//         console.error('No valid operation hours found for this day.');
//         return [];
//     }

//     // Converte os horários diretamente do banco, incluindo AM/PM
//     let startOfDay = moment.tz(
//         `${date} ${operationHours.startTime} ${operationHours.startPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );
//     let endOfDay = moment.tz(
//         `${date} ${operationHours.endTime} ${operationHours.endPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );

//     // Ajusta o horário de término para o próximo dia, se necessário
//     if (endOfDay.isBefore(startOfDay)) {
//         endOfDay.add(1, 'day');
//     }

//     const availableTimes = [];

//     // Dividindo os horários em dois períodos de "half-day"
//     const halfDayMorningEnd = startOfDay.clone().add(5, 'hours'); // Primeiro "half-day" termina 5 horas após o início
//     const halfDayAfternoonStart = halfDayMorningEnd.clone(); // Segundo "half-day" começa onde o primeiro termina

//     // Adiciona "half-day" períodos
//     availableTimes.push({
//         start: startOfDay.toISOString(),
//         end: halfDayMorningEnd.toISOString(),
//         displayStart: startOfDay.format('hh:mm A'),
//         displayEnd: halfDayMorningEnd.format('hh:mm A'),
//         type: 'half-day',
//     });

//     availableTimes.push({
//         start: halfDayAfternoonStart.toISOString(),
//         end: endOfDay.toISOString(),
//         displayStart: halfDayAfternoonStart.format('hh:mm A'),
//         displayEnd: endOfDay.format('hh:mm A'),
//         type: 'half-day',
//     });

//     // Adiciona o "full-day"
//     availableTimes.push({
//         start: startOfDay.toISOString(),
//         end: endOfDay.toISOString(),
//         displayStart: startOfDay.format('hh:mm A'),
//         displayEnd: endOfDay.format('hh:mm A'),
//         type: 'full-day',
//     });

//     console.log('Generated Available Times:', availableTimes); // Log para verificação
//     return availableTimes;
// }


// function generateAvailableTimes(date, hoursOfOperation) {
//     const dayOfWeek = moment(date).format('dddd');
//     const operationHours = hoursOfOperation.find(op => op.day === dayOfWeek);

//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//         console.error('No valid operation hours found for this day.');
//         return [];
//     }

//     let startOfDay = moment.tz(
//         `${date} ${operationHours.startTime} ${operationHours.startPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );
//     let endOfDay = moment.tz(
//         `${date} ${operationHours.endTime} ${operationHours.endPeriod}`,
//         "YYYY-MM-DD hh:mm A",
//         "America/New_York"
//     );

//     if (endOfDay.isBefore(startOfDay)) {
//         endOfDay.add(1, 'day');
//     }

//     const availableTimes = [];

//     // Gera dois períodos "half-day" e um "full-day"
//     const halfDayMorningEnd = startOfDay.clone().add(5, 'hours');
//     const halfDayAfternoonStart = halfDayMorningEnd.clone();

//     // Verifica duplicatas antes de adicionar
//     if (!availableTimes.some(t => t.start === startOfDay.toISOString())) {
//         availableTimes.push({
//             start: startOfDay.toISOString(),
//             end: halfDayMorningEnd.toISOString(),
//             displayStart: startOfDay.format('hh:mm A'),
//             displayEnd: halfDayMorningEnd.format('hh:mm A'),
//             type: 'half-day',
//         });
//     }

//     if (!availableTimes.some(t => t.start === halfDayAfternoonStart.toISOString())) {
//         availableTimes.push({
//             start: halfDayAfternoonStart.toISOString(),
//             end: endOfDay.toISOString(),
//             displayStart: halfDayAfternoonStart.format('hh:mm A'),
//             displayEnd: endOfDay.format('hh:mm A'),
//             type: 'half-day',
//         });
//     }

//     if (!availableTimes.some(t => t.start === startOfDay.toISOString() && t.type === 'full-day')) {
//         availableTimes.push({
//             start: startOfDay.toISOString(),
//             end: endOfDay.toISOString(),
//             displayStart: startOfDay.format('hh:mm A'),
//             displayEnd: endOfDay.format('hh:mm A'),
//             type: 'full-day',
//         });
//     }

//     console.log('Generated Available Times:', availableTimes);
//     return availableTimes;
// }

function generateAvailableTimes(date, hoursOfOperation, serviceType) {
    const dayOfWeek = moment(date).format('dddd');
    const operationHours = hoursOfOperation.find(op => op.day === dayOfWeek);

    if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
        console.error('No valid operation hours found for this day.');
        return [];
    }


    const availableTimes = [];
    
    // Converte os horários diretamente do banco
    let startOfDay = moment.tz(
        `${date} ${operationHours.startTime} ${operationHours.startPeriod}`,
        "YYYY-MM-DD hh:mm A",
        "America/New_York"
    );
    let endOfDay = moment.tz(
        `${date} ${operationHours.endTime} ${operationHours.endPeriod}`,
        "YYYY-MM-DD hh:mm A",
        "America/New_York"
    );

    // Ajusta o horário de término para o próximo dia, se necessário
    if (endOfDay.isBefore(startOfDay)) {
        endOfDay.add(1, 'day');
    }


    console.log(serviceType.trim().toLowerCase())

    // filter only for full day
    if(serviceType.trim().toLowerCase() == 'full day tattoo' || serviceType.trim().toLowerCase() == 'full day'){
        // Horário "full-day"
        availableTimes.push({
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString(),
            displayStart: startOfDay.format('hh:mm A'),
            displayEnd: endOfDay.format('hh:mm A'),
            type: 'full-day',
        });
    }

    // Filter for only half day
    if(serviceType.trim().toLowerCase() == 'half day tattoo' || serviceType.trim().toLowerCase() == 'half day'){
        // Evitar duplicação e garantir que os horários sejam únicos
        const halfDayStart1 = startOfDay.clone();
        const halfDayEnd1 = halfDayStart1.clone().add(5, 'hours'); // Primeiro "half-day"
    
        const halfDayStart2 = halfDayEnd1.clone();
        const halfDayEnd2 = endOfDay.clone(); // Segundo "half-day"
    
        // Primeiro período "half-day"
        availableTimes.push({
            start: halfDayStart1.toISOString(),
            end: halfDayEnd1.toISOString(),
            displayStart: halfDayStart1.format('hh:mm A'),
            displayEnd: halfDayEnd1.format('hh:mm A'),
            type: 'half-day',
        });
    
        // Segundo período "half-day"
        availableTimes.push({
            start: halfDayStart2.toISOString(),
            end: halfDayEnd2.toISOString(),
            displayStart: halfDayStart2.format('hh:mm A'),
            displayEnd: halfDayEnd2.format('hh:mm A'),
            type: 'half-day',
        });

        availableTimes.push({
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString(),
            displayStart: startOfDay.format('hh:mm A'),
            displayEnd: endOfDay.format('hh:mm A'),
            type: 'full-day',
        });
    }

    if ((serviceType.trim().toLowerCase() !== 'half day tattoo' && serviceType.trim().toLowerCase() !== 'half day') &&
        (serviceType.trim().toLowerCase() !== 'full day tattoo' && serviceType.trim().toLowerCase() !== 'full day')) {
        let currentStart = startOfDay.clone();
        while (currentStart.isBefore(endOfDay)) {
            let currentEnd = currentStart.clone().add(1, 'hour');
            if (currentEnd.isAfter(endOfDay)) break;
            availableTimes.push({
                start: currentStart.toISOString(),
                end: currentEnd.toISOString(),
                displayStart: currentStart.format('hh:mm A'),
                displayEnd: currentEnd.format('hh:mm A'),
                type: 'custom',
            });
            currentStart = currentEnd.clone();
        }
    }

    // console.log('AVAILABLES ==> ', availableTimes)


    // console.log('Generated Available Times:', availableTimes);
    return availableTimes;
}







// function generateAvailableTimes(date, hoursOfOperation) {
//     const dayOfWeek = moment(date).format('dddd'); // Obter o dia da semana por extenso
  
//     // Encontrar os horários de operação para o dia específico
//     const operationHours = hoursOfOperation.find(op => op.day === dayOfWeek);
  
//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//     //   console.log('No valid operation hours found for this day.');
//       return [];
//     }
  
//     let startOfDay = moment.tz(`${date} ${operationHours.startTime} ${operationHours.startPeriod}`, "YYYY-MM-DD h:mm A", "America/New_York");
//     let endOfDay = moment.tz(`${date} ${operationHours.endTime} ${operationHours.endPeriod}`, "YYYY-MM-DD h:mm A", "America/New_York");
  
//     // Ajuste se o horário de término for antes do horário de início (indicando que passa da meia-noite)
//     if (endOfDay.isBefore(startOfDay)) {
//       endOfDay.add(1, 'day');
//     //   console.log(`Adjusted endOfDay (next day): ${endOfDay}`);
//     }
  
//     // console.log('Start of day:', startOfDay.format());
//     // console.log('End of day:', endOfDay.format());
  
//     let currentTime = startOfDay;
//     const availableTimes = [];
  
//     while (currentTime.isBefore(endOfDay) || currentTime.isSame(endOfDay, 'minute')) {
//       availableTimes.push({
//         start: currentTime.toISOString(),
//         end: currentTime.clone().add(60, 'minutes').toISOString(),
//         displayStart: currentTime.format('hh:mm A'),
//         displayEnd: currentTime.clone().add(60, 'minutes').format('hh:mm A')
//       });
//       currentTime.add(60, 'minutes');
//     }
  
//     return availableTimes;
// }




// exports.availableTimeGoogleCalendar = async (req, res) => {
//     const { date, hoursOfOperation } = req.query;

//     // Validação do parâmetro hoursOfOperation
//     if (!hoursOfOperation || typeof hoursOfOperation !== 'string') {
//         console.error('Invalid or missing hoursOfOperation parameter.');
//         return res.status(400).send('Missing or invalid hoursOfOperation parameter.');
//     }

//     // Parse de JSON com tratamento de erros
//     let parsedHoursOfOperation;
//     try {
//         parsedHoursOfOperation = JSON.parse(hoursOfOperation);
//     } catch (error) {
//         console.error('Error parsing hoursOfOperation:', error.message);
//         return res.status(400).send('Invalid hoursOfOperation JSON format.');
//     }

//     // Time range dinâmico com base em hoursOfOperation
//     const operationHours = parsedHoursOfOperation.find(op => op.day === moment(date).format('dddd'));

//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//         console.error('No valid operation hours found for this day.');
//         return res.status(400).send('Invalid hours of operation for the selected day.');
//     }

//     // Time range
//     // const timeMin = moment.tz(`${date} 09:00`, "America/New_York").toISOString();
//     // const timeMax = moment.tz(`${date} 18:00`, "America/New_York").toISOString();

//     // Conversão correta para o fuso horário de Nova York
//     const timeMin = moment.tz(`${date} ${operationHours.startTime}`, "YYYY-MM-DD hh:mm A", "America/New_York").toISOString();
//     const timeMax = moment.tz(`${date} ${operationHours.endTime}`, "YYYY-MM-DD hh:mm A", "America/New_York").toISOString();


//     console.log('TIME MIN --> ', timeMin)
//     console.log('TIME MAX --> ', timeMax)
//     try {
//         const disponibilidade = await calendar.freebusy.query({
//             requestBody: {
//                 timeMin,
//                 timeMax,
//                 items: [{ id: calendarId }],
//             },
//         });

//         const busyTimes = disponibilidade.data.calendars[calendarId]?.busy || [];

//         // Gera os horários disponíveis
//         let availableTimes = generateAvailableTimes(date, parsedHoursOfOperation);

//         // Filtra os horários disponíveis removendo os horários ocupados
//         if (busyTimes.length > 0) {
//             availableTimes = availableTimes.filter(({ start, end }) => {
//                 const startMoment = moment(start);
//                 const endMoment = moment(end);
//                 return !busyTimes.some(busy => {
//                     const busyStart = moment(busy.start);
//                     const busyEnd = moment(busy.end);
//                     return startMoment.isBefore(busyEnd) && endMoment.isAfter(busyStart);
//                 });
//             });
//         }

//         res.status(200).json(availableTimes);
//     } catch (error) {
//         console.error('Error in availability check:', error);
//         res.status(500).send('Error fetching availability.');
//     }
// };

exports.availableTimeGoogleCalendar = async (req, res) => {
    const { date, hoursOfOperation, serviceType } = req.query;

    // Validação do parâmetro hoursOfOperation
    if (!hoursOfOperation || typeof hoursOfOperation !== 'string') {
        console.error('Invalid or missing hoursOfOperation parameter.');
        return res.status(400).send('Missing or invalid hoursOfOperation parameter.');
    }


    // Parse de JSON com tratamento de erros
    let parsedHoursOfOperation;
    try {
        parsedHoursOfOperation = JSON.parse(hoursOfOperation);

        // console.log('PARSE HOURS OF OPERATIONS --> ', parsedHoursOfOperation);
    } catch (error) {
        console.error('Error parsing hoursOfOperation:', error.message);
        return res.status(400).send('Invalid hoursOfOperation JSON format.');
    }

    // Time range dinâmico com base em hoursOfOperation
    const operationHours = parsedHoursOfOperation.find(op => op.day === moment(date).format('dddd'));

    if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
        console.error('No valid operation hours found for this day.');
        return res.status(400).send('Invalid hours of operation for the selected day.');
    }

    // Conversão correta para o fuso horário de Nova York
    let timeMin = moment.tz(`${date} ${operationHours.startTime}`, "YYYY-MM-DD hh:mm A", "America/New_York");
    let timeMax = moment.tz(`${date} ${operationHours.endTime}`, "YYYY-MM-DD hh:mm A", "America/New_York");

    // Ajustar timeMax se ele for anterior ao timeMin
    if (timeMax.isBefore(timeMin)) {
        timeMax.add(1, 'day'); // Adiciona 1 dia ao horário de término
    }

    try {
        const disponibilidade = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                items: [{ id: calendarId }],
            },
        });

        const busyTimes = disponibilidade.data.calendars[calendarId]?.busy || [];

        // Gera os horários disponíveis
        let availableTimes = generateAvailableTimes(date, parsedHoursOfOperation, serviceType);


        // console.log('AVAILABLE TIMES --> ', availableTimes);

        // Filtra os horários disponíveis removendo os horários ocupados
        if (busyTimes.length > 0) {
            availableTimes = availableTimes.filter(({ start, end }) => {
                const startMoment = moment(start);
                const endMoment = moment(end);
                return !busyTimes.some(busy => {
                    const busyStart = moment(busy.start);
                    const busyEnd = moment(busy.end);
                    return startMoment.isBefore(busyEnd) && endMoment.isAfter(busyStart);
                });
            });
        }

        res.status(200).json(availableTimes);
    } catch (error) {
        console.error('Error in availability check:', error);
        res.status(500).send('Error fetching availability.');
    }
};








// exports.availableTimeGoogleCalendar = async (req, res) => {
//     const { date, hoursOfOperation } = req.query;
//     const parsedHoursOfOperation = JSON.parse(hoursOfOperation);
//     const dayOfWeek = moment(date).format('dddd'); // Obter o dia da semana por extenso
  
//     // Encontrar os horários de operação para o dia específico
//     const operationHours = parsedHoursOfOperation.find(op => op.day === dayOfWeek);
  
//     console.log('DATE TIME AVAILABLE -->', date);
//     console.log('Hours of Operation -->', parsedHoursOfOperation);
  
//     if (!operationHours || !operationHours.startTime || !operationHours.endTime) {
//       return res.status(400).send('No valid operation hours found for the specified date.');
//     }
  
//     let timeMin = moment.tz(`${date} ${operationHours.startTime} ${operationHours.startPeriod}`, "YYYY-MM-DD h:mm A", "America/New_York");
//     let timeMax = moment.tz(`${date} ${operationHours.endTime} ${operationHours.endPeriod}`, "YYYY-MM-DD h:mm A", "America/New_York");
  
//     console.log(`Raw timeMin: ${timeMin}, Raw timeMax: ${timeMax}`);
  
//     if (timeMax.isBefore(timeMin)) {
//       timeMax.add(1, 'day');
//       console.log(`Adjusted timeMax (next day): ${timeMax}`);
//     }
  
//     try {
//       const disponibilidade = await calendar.freebusy.query({
//         requestBody: {
//           timeMin: timeMin.format(),
//           timeMax: timeMax.format(),
//           items: [{ id: calendarId }],
//         },
//       });
  
//       const busyTimes = disponibilidade.data.calendars[calendarId].busy;
//       console.log('Busy times:', busyTimes);
  
//       let availableTimes = generateAvailableTimes(date, parsedHoursOfOperation);
  
//       // Filtrar horários disponíveis removendo os ocupados
//       availableTimes = availableTimes.filter(({ start, end }) => {
//         const startMoment = moment(start);
//         const endMoment = moment(end);
//         return !busyTimes.some(busy => {
//           const busyStart = moment(busy.start);
//           const busyEnd = moment(busy.end);
//           return startMoment.isBefore(busyEnd) && endMoment.isAfter(busyStart);
//         });
//       });
  
//       console.log('Filtered available times:', availableTimes);
//       res.status(200).json(availableTimes);
//     } catch (error) {
//       console.error('Erro ao obter disponibilidade:', error);
//       res.status(500).send('Erro ao obter disponibilidade.');
//     }
//   };


  
  
  
// POST/ Book a time
exports.appointmentTimesGoogleCalendar = async (req, res) => {
    const { summary, description, start, end, bookingId, userID, type } = req.body;

    try {
        const evento = await calendar.events.insert({
            calendarId,
            requestBody: {
                summary: `${summary} (${type})`, // Identifica o tipo da reserva
                description,
                start: { dateTime: start, timeZone: 'America/New_York' },
                end: { dateTime: end, timeZone: 'America/New_York' },
            },
        });

        const eventId = evento.data.id;

        await Book.findByIdAndUpdate(
            bookingId,
            { googleCalendarEventId: eventId, type },
            { new: true }
        );

        res.status(200).json(evento.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao reservar horário.');
    }
};


// exports.appointmentTimesGoogleCalendar = async(req, res) => {
//     const { summary, description, start, end, bookingId, userID } = req.body;
//     // Converte os horários para o fuso horário de referência antes da validação
//     const startTime = moment.tz(start, 'America/New_York');
//     const endTime = moment.tz(end, 'America/New_York');
  

//     // console.log('BOOKING ID FRONTEND --> ', bookingId);
//     // console.log('USER ID FRONTEND --> ', userID);

//     // Define o horário de abertura e fechamento
//     const openingTime = startTime.clone().startOf('day').add(9, 'hours'); // 9:00 AM
//     const closingTime = startTime.clone().startOf('day').add(18, 'hours'); // 6:00 PM
  
//     const date = startTime.format('YYYY-MM-DD')
//     const time = startTime.format('HH:mm')

//     // Verifica se o horário de início está dentro do horário de atendimento
//     if (!startTime.isBetween(openingTime, closingTime, null, '[]') ||
//         !endTime.isBetween(openingTime, closingTime, null, '[]')) {
//       return res.status(400).send('O horário escolhido está fora do horário de atendimento.');
//     }
  
//     try {
//         const existingBooking = await Book.findOne({customer: userID, confirm: { $exists: false }});

//         if(existingBooking){
//             await Book.updateOne({ _id: existingBooking._id },{
//                 date: date,
//                 time: time
//             }, { new: true })
//         }

//         const evento = await calendar.events.insert({
//             calendarId,
//             requestBody: {
//             summary,
//             description,
//             start: { dateTime: start, timeZone: 'America/New_York' },
//             end: { dateTime: end, timeZone: 'America/New_York' },
//             },
//         });
  
//         const eventId = evento.data.id;
        
//         // console.log('EVENT ID --> ', eventId);
//         await Book.findByIdAndUpdate(
//             bookingId,
//             { googleCalendarEventId: eventId },
//             { new: true }
//         );
//         res.status(200).json(evento.data);
//         // res.status(200).json({ status: 'success', message: 'deu certo!'});
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Erro ao reservar horário.');
//     }
// };
