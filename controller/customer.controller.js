const ErrorHandler = require('../utils/ErrorHandler');
const { sendToken } = require('../utils/sendToken');
const Customer     = require('../models/Customer');
const Health       = require('../models/Health');
const Sign         = require('../models/Sign');
const cloudinary   = require('../middlewares/cloudinary');
// const puppeteer    = require('puppeteer')
const nodemailer   = require('nodemailer')
const path         = require('path')
const os           = require('os');
const Checkin = require('../models/Checkin');
const Setting = require('../models/Setting');
const pdf = require('html-pdf');
const Book = require('../models/Book');
// const pathName = path.join(path.dirname(process.mainModule.filename),'document.pdf');




exports.getMe = async(req,res,next) => {
    const customers = await Customer.findOne(req?.user?._id);


    console.log(customers);

    res.status(200).json({
        customers
    })
}


// Update user profile 
exports.updateUserProfile = async(req,res,next) => {
    const { 
        name, 
        email, 
        phone, 
        birth, 
        nationality, 
        country, 
        zipcode, 
        address, 
        city, 
        location, 
        gender, 
        referral, 
        referral_name, 
        referral_email, 
        referral_phone, 
        document_id_profile, 
        referral_opt_email, 
        bio
    } = req.body;

    // if(!name || !email || !phone || !birth){
    //     return next(new ErrorHandler(`All fields are required!`,'fail', 400));
    // }

    const newUser = {
        name,
        email,
        phone,
        birth,
        nationality,
        country,
        zipcode,
        address,
        city,
        location, 
        gender,
        referral,
        referral_name,
        referral_email,
        referral_phone,
        document_id_profile,
        referral_opt_email,
        bio
    }

    try {
        const customer = await Customer.findByIdAndUpdate({ _id: req?.user?.id }, newUser, { new: true });
    

        // console.log('HOURS OF OPERATIONS --> ', hoursOfOperation);

        res.status(200).json({
            status: 'success',
            customer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}


// exports.updateSendNotification = async (req,res) => {
//     const { artist,  } = req.body;

//     const artistNotification = await Customer.findOne({ name: artist })

//     try {
//         if(!artistNotification.notifications){
//             artistNotification.notifications = [];
//         }

//         artistNotification.notifications.push(req.body);
//         await artistNotification.save();

//         req.io.emit('new_notification', {
//             artist, 
//             notification: req.body
//         })
        
//         res.status(200).json({
//             status: 'success'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
// }


// Update a notification artist user
exports.updateSendNotification = async (req, res, next) => {
    const { artist, book_id } = req.body;

    try {
        // Localizar o artista no banco de dados
        const artistNotification = await Customer.findOne({ name: artist });

        if (!artistNotification) {
            return next(new ErrorHandler('Artist not found', 'fail', 404));
        }

        // Verificar se a lista de notificações está inicializada
        if (!artistNotification.notifications) {
            artistNotification.notifications = [];
        }

        // Buscar os dados do agendamento associado ao `bookId`
        const book = await Book.findById(book_id);

        if (!book) {
            return next(new ErrorHandler('Book not found', 'fail', 404));
        }

        // Criar a notificação com os dados do agendamento
        const notification = {
            ...req.body 
        };

        // Adicionar a notificação à lista do artista
        artistNotification.notifications.push(notification);

        // Salvar as alterações no banco de dados
        await artistNotification.save();

        // Emitir a notificação em tempo real via socket
        req.io.emit('new_notification', {
            artist,
            notification
        });

        // Responder com sucesso
        res.status(200).json({
            status: 'success',
            notification
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};


// get all notifications to admin and owner
exports.getAllNotificationsToAdminAndOwner = async(req,res,next) => {
    try {
        const datas = await Customer.find({ "notifications.0": { $exists: true } })
      .select('notifications')
      .populate({
        path: 'notifications',
        populate: [
          { 
            path: 'customer', 
            model: 'Customer',
            select: 'name email' // selecione os campos desejados
          },
          { 
            path: 'book_id', 
            model: 'Book' // aqui, o documento completo do Book será populado, incluindo o campo artist como string
          }
        ]
      });
        console.log(datas)

        res.status(200).json({
            status: 'success',
            notifications: datas
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
}



// Confirm payment checkout just in time socket.io
exports.confirmPaymentChekoutDone = async(req,res,next) => {
    try {
        req.io.emit('customer_payment_confirm_socket', {
            customer_payment_confirm_socket: 'yes'
        })

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

exports.confirmPaymentChekoutDoneArtist = async(req,res,next) => {
    try {
        req.io.emit('artist_payment_confirm_socket', {
            artist_payment_confirm_socket: 'yes'
        })

        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}




exports.markAllNotificationsAsVisible = async(req,res,next) => {
    const { artist } = req.body;

    const artistNotification = await Customer.findOne({ name: artist })

    try {
        if(!artistNotification){
            return next(new ErrorHandler(`Bad request ${err}`, 'fail', 400));
        }

        artistNotification.notifications.forEach(notification => {
            if(!notification.visible){
                notification.visible = true
            }
        })

        await artistNotification.save()
        
        res.status(200).json({
            status: 'success'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

// exports.markAllNotificationsAsVisibleAdminToOnwer = async (req, res, next) => {
//     try {
//       // Atualiza todas as notificações de todos os clientes onde visible for false
//       const result = await Customer.updateMany(
//         { "notifications.visible": false },
//         { $set: { "notifications.$[elem].visible": true } },
//         { arrayFilters: [{ "elem.visible": false }] }
//       );
  
//       res.status(200).json({
//         status: 'success',
//         result // opcional: mostra quantos documentos foram atualizados
//       });
//     } catch (err) {
//       return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
//   };

  exports.markAllNotificationsAsVisibleAdminToOnwer = async (req, res, next) => {
    try {
      // Atualiza todas as notificações de todos os clientes (que possuem notificações)
      const result = await Customer.updateMany(
        { notifications: { $exists: true, $not: { $size: 0 } } },
        { $set: { "notifications.$[].visible": true } }
      );
  
      res.status(200).json({
        status: 'success',
        result // Retorna informações sobre a atualização (quantos documentos foram afetados, etc.)
      });
    } catch (err) {
      return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
  };
  
  


exports.getCustomersArtistCustom = async (req, res, next) => {
    try {
        const customers = await Customer.find({});

        res.status(200).json({
            status: 'success',
            customers
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};


// GET all notifications
// GET all notifications for the logged-in artist
// exports.getAllNotification = async (req, res, next) => {
//     try {
//         // Passo 1: Encontrar o cliente/artista logado
//         const loggedInArtist = await Customer.findById(req.user._id);

//         if (!loggedInArtist) {
//             return next(new ErrorHandler('Artist not found', 'fail', 404));
//         }

//         // Passo 2: Filtrar as notificações relacionadas ao artista logado
//         const notifications = loggedInArtist.notifications || [];

//         // Passo 3: Se necessário, buscar detalhes adicionais dos clientes relacionados
//         const customerIds = notifications.map(notification => notification.customer);

//         const detailedCustomers = await Customer.find({
//             _id: { $in: customerIds }
//         }).select('name email phone imageUrl');

//         // Passo 4: Mapear os dados completos de volta nas notificações
//         const notificationsWithDetails = notifications.map(notification => {
//             const customerDetails = detailedCustomers.find(
//                 detail => detail?._id?.toString() === notification?.customer?.toString()
//             );
//             return {
//                 ...notification.toObject(),
//                 customer: customerDetails // Substituir o ID pelo objeto completo do cliente
//             };
//         });

//         // Passo 5: Responder com os dados completos
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 notifications: notificationsWithDetails
//             }
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
//     }
// };

// GET all notifications for the logged-in artist
exports.getAllNotification = async (req, res, next) => {
    try {
        // Passo 1: Encontrar o cliente/artista logado
        const loggedInArtist = await Customer.findById(req.user._id);

        if (!loggedInArtist) {
            return next(new ErrorHandler('Artist not found', 'fail', 404));
        }

        // Passo 2: Filtrar as notificações relacionadas ao artista logado
        const notifications = loggedInArtist.notifications || [];

        // Passo 3: Se necessário, buscar detalhes adicionais dos clientes relacionados
        const customerIds = notifications.map(notification => notification.customer);

        const detailedCustomers = await Customer.find({
            _id: { $in: customerIds }
        }).select('name email phone imageUrl');

        // Passo 4: Mapear os dados completos de volta nas notificações
        const notificationsWithDetails = notifications.map(notification => {
            const customerDetails = detailedCustomers.find(
                detail => detail?._id?.toString() === notification?.customer?.toString()
            );
            return {
                ...notification.toObject(),
                customer: customerDetails // Substituir o ID pelo objeto completo do cliente
            };
        });

        // Ordenar notificações do mais recente para o mais antigo
        const sortedNotifications = notificationsWithDetails.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt); // Inverter a ordem
        });

        // Passo 5: Responder com os dados completos
        res.status(200).json({
            status: 'success',
            data: {
                notifications: sortedNotifications
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};


exports.getAllArtistOnly = async(req,res,next) => {
    try {
        const artists = await Customer.find({ roles: { $in: ['artist','admin','owner'] } })

        res.status(200).json({
            status: 'success',
            artists
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
}

// return all finished tattoos
exports.getAllCustomerFinishedAppointment = async(req,res,next) => {
    try {
        const allCustomers = await Book.find({ 
            customer_finish_and_confirm_checkout: true,
            continue_tattoo_closed: true,
            cancelled_appointment_customer_sorry: false
        }).populate('customer')

        res.status(200).json({
            result: allCustomers
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
}

// return all progress tattoos
exports.getAllProgressContinueTattoos = async(req,res,next) => {
    try {
        const allCustomers = await Book.find({ 
            confirm: 'Confirm', 
            // customer_finish_and_confirm_checkout: false, 
            arrival_status: false,
            checkin_artist_design_approved: 'yes',
            checkin_artist_start_tattoo: 'yes'
        }).populate('customer')

        // console.log(allCustomers)

        res.status(200).json({
            result: allCustomers
        })

    }catch(err){
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
}







// ADMIN SECTION
// Artist creation 
exports.createNewArtist = async(req,res,next) => {
    const { name, 
            email, 
            phone, 
            birth,
            role, 
            nationality, 
            country, 
            zipcode, 
            address, 
            password,
            city, 
            location, 
            gender,
            p_shop,
            p_role,
            p_w_days,
            p_w_hours,
            p_city,
            p_location        
        } = req.body;
    
    if(!name || !email || !phone || !birth || !role || !nationality || !country ||
        !zipcode || !address || !password || !city || !location || !gender || !p_shop || !p_role || 
        !p_w_days || !p_w_hours || !p_city || !p_location){
            return next(new ErrorHandler('All fields are required!','fail', 400));
    }

    const newUser = {
        name,
        email,
        phone,
        birth,
        role,
        nationality,
        country,
        zipcode,
        address,
        password,
        city,
        location, 
        gender,
        p_shop,
        p_role,
        p_w_days,
        p_w_hours,
        p_city,
        p_location
    }

    try {
        const customer = await Customer.create(newUser);
    
        res.status(200).json({
            status: 'success',
            message: 'artist create successfuly',
            customer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

// GET one health
exports.getHealth = async(req,res,next) => {
    try {
        const health = await Health.findOne({ customer: req.user.id });

        res.status(200).json({
            health
        })
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: `Something went wrong ${err}`
        })
    }
}

exports.getCustomerHealthForArtist = async(req,res,next) => {
    const { id } = req.params;
    try {
        const health = await Health.findOne({ customer: id });

        res.status(200).json({
            health
        })
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: `Something went wrong ${err}`
        })
    }
}


// Update a new Health 
exports.updateHealth = async(req,res,next) => {
    const { allergies, auto_immunity, conditions, diseases, infection_description, medication_description, medication_time } = req.body;

    try {
        const customerHealth = await Health.findOne({ customer: req.user.id });

        if(customerHealth){
            customerHealth.allergies = allergies; 
            customerHealth.auto_immunity = auto_immunity, 
            customerHealth.conditions = conditions, 
            customerHealth.diseases = diseases, 
            customerHealth.infection_description = infection_description, 
            customerHealth.medication_description = medication_description, 
            customerHealth.medication_time = medication_time,
            customerHealth.customer = req.user.id

            await customerHealth.save();

            return res.status(200).json({
                message: 'Health updated successfuly!'
            })
        }else {
            const newCustomer = new Health({
                allergies, 
                auto_immunity, 
                conditions, 
                diseases, 
                infection_description, 
                medication_description, 
                medication_time,
                customer: req.user.id
            })        

            await newCustomer.save();
    
            return res.status(200).json({
                message: 'Health updated successfuly!'
            })
        }
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: `Something went wrong ${err}`
        })
    }
}

// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto('https://www.whatismybrowser.com/');
//   await page.screenshot({ path: 'browser_version.png' });
//   await browser.close();
// })();


// Create sign should give permission to check if client already made all signatures if yes just follow and update just the 
// signature photo and follow to the next step.
exports.createSign = async (req, res, next) => {
    const { signValueSave, newSignData } = req.body; // signValueSave: Base64 da assinatura

    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return next(new ErrorHandler("Customer not found", 'fail', 404));
        }

        // Buscar o documento Sign existente associado ao customer
        let signDocument = await Sign.findOne({ customer: req.user.id });

        // Fazer upload da nova assinatura no Cloudinary
        cloudinary.uploader.upload(signValueSave, async (err, result) => {
            if (err) {
                return next(new ErrorHandler(`Upload fail: ${err.message}`, 'fail', 400));
            }

            if (!signDocument) {
                // Criar o documento caso ele não exista
                signDocument = await Sign.create({
                    signEntries: newSignData,
                    signValueSave: result.secure_url,
                    customer: req.user.id
                });
            } else {
                // Atualizar apenas os campos não existentes
                newSignData.forEach((newEntry, index) => {
                    if (!signDocument.signEntries[index]) {
                        // Se o índice não existe, cria a entrada
                        signDocument.signEntries[index] = newEntry;
                    } else {
                        // Atualiza apenas os campos que não existem
                        for (let key in newEntry) {
                            if (!signDocument.signEntries[index][key]) {
                                signDocument.signEntries[index][key] = newEntry[key];
                            }
                        }
                    }
                });

                // Atualizar a URL da nova imagem
                signDocument.signValueSave = result.secure_url;

                // Salvar o documento atualizado
                await signDocument.save();
            }

            // HTML do PDF (usando os novos dados atualizados)
            const html = generateHtml(signDocument.signEntries, result.secure_url);

            // Gerar o PDF
            pdf.create(html, { format: 'A4' }).toFile('document.pdf', async (err, resFile) => {
                if (err) {
                    return next(new ErrorHandler(`Error generating PDF: ${err.message}`, 'fail', 500));
                }

                // Enviar o e-mail
                const emails = [`${customer.email}`, 'rafaelmacedosilva88@hotmail.com'];
                const transport = nodemailer.createTransport({
                    host: 'smtp-relay.sendinblue.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'rafael@tektrio.com',
                        pass: '4tCmrApkEKIbN1vO'
                    }
                });

                try {
                    const response = await transport.sendMail({
                        from: 'Contato - <generate.bot.pdf@tektrio.com>',
                        to: emails,
                        subject: 'Sign Customer - Selden Ink',
                        text: 'You receive an email from Sign Customer - SeldenInk.',
                        attachments: [
                            { filename: 'sign-document.pdf', path: resFile.filename }
                        ]
                    });

                    res.status(200).json({
                        status: 'success',
                        data: signDocument,
                        response: response
                    });
                } catch (emailError) {
                    return next(new ErrorHandler(`Error sending email: ${emailError.message}`, 'fail', 500));
                }
            });
        });
    } catch (err) {
        return next(new ErrorHandler(`Error: ${err.message}`, 'fail', 400));
    }
};

exports.getArtistProfileById = async(req,res,next) => {
    const { id } = req.params;

    try {
        const artist = await Customer.findById({ _id: id });

        // console.log(artist)
        res.status(200).json({
            status: 'success',
            artist
        })
    }catch(err){
        return next(new ErrorHandler(`Error: ${err.message}`, 'fail', 500))
    }
}
 
// Função auxiliar para gerar HTML com base nos dados
// function generateHtml(signEntries, imageUrl) {
//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <title>Client Health Contract and Signature</title>
//     </head>
//     <body>
//         <h1>Client Health Contract and Signature - SeldenInk</h1>
//         <ol>
//             ${signEntries.map((entry, i) => `
//                 <li>Cláusula ${i + 1}: ${entry[`sign${i + 1}`] || ''}</li>
//             `).join('')}
//         </ol>
//         <div>
//             <p>Signature:</p>
//             <img src="${imageUrl}" alt="Customer Signature" style="width:200px;"/>
//         </div>
//     </body>
//     </html>`;
// }


function generateHtml(signEntries, imageUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Client Health Contract and Signature</title>
        <style>
            .main-pdf {
                background-color: #CACACA;
                padding: 40px;
            }
            .main-pdf .main-pdf__container {
                margin: auto;
                width: 80%;
            }
            .main-pdf .main-pdf__container ol li {
                color: #101820;
                font-family: 'Effra', Arial, Helvetica, sans-serif;
                font-size: 14px;
                font-weight: 400;
                line-height: 125%;
                letter-spacing: 0.84px;
                margin-bottom: 15px;
            }
            .main-pdf .main-pdf__container ol p {
                color: rgba(16, 24, 32, 0.40);
                font-family: 'Effra', Arial, Helvetica, sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 150%;
                letter-spacing: 0.78px;
            }
            .main-pdf-title h1 {
                font-size: 34px;
                font-weight: 600;
                font-family: 'Effra', Arial, Helvetica, sans-serif;
                color: #1e1e1e;
                font-style: italic;
                margin-bottom: 42px;
            }
            .sign {
                margin-top: 45px;
            }
        </style>
    </head>
    <body>
        <section class="main-pdf">
            <div class="main-pdf__container">
                <div class="main-pdf-title">
                    <h1>Client Health Contract and Signature - SeldenInk</h1>
                </div>
                <ol>
                    <li>I have truthfully represented to Selden.Ink Tattoo Studio that I am over eighteen (18) years of age.</li>
                    <p>${signEntries[0]?.sign1 || ''}</p>
                    <li>I acknowledge that it is not reasonably possible for the representatives and employees of Selden.Ink Tattoo Studio to determine whether I might have an allergic reaction to the dyes, pigments or processes used in my tattoo, and I agree to accept the risk that such a reaction is possible.</li>
                    <p>${signEntries[0]?.sign2 || ''}</p>
                    <li>I acknowledge that I have advised my tattoo artist of any condition that might affect the healing of this tattoo. I do not have medical or skin conditions such as but not limited to: acne, scarring (Keloid), eczema, psoriasis, freckles, moles, or sunburn in the area to be tattooed that may interfere with said tattoo.</li>
                    <p>${signEntries[0]?.sign3 || ''}</p>
                    <li>I am not pregnant or nursing.</li>
                    <p>${signEntries[0]?.sign4 || ''}</p>
                    <li>I am not under the influence of alcohol or drugs.</li>
                    <p>${signEntries[0]?.sign5 || ''}</p>
                    <li>I acknowledge that infection is always possible as a result of obtaining a tattoo, particularly in the event that I do not take proper care of my tattoo.</li>
                    <p>${signEntries[0]?.sign6 || ''}</p>
                    <li>I acknowledge that a tattoo is a permanent change to my appearance and that no representations have been made to me as to the ability to later change or remove my tattoo.</li>
                    <p>${signEntries[0]?.sign7 || ''}</p>
                    <li>If my tattoo is a symbol or something written in a language other than English, the tattoo artist and owner of this business are not responsible for what it may mean.</li>
                    <p>${signEntries[0]?.sign8 || ''}</p>
                    <li>I am responsible for the correct spelling, grammar, and punctuation of the text in my tattoo.</li>
                    <p>${signEntries[0]?.sign9 || ''}</p>
                    <li>I acknowledge that variations in color and design may exist between the selected tattoo and the final result.</li>
                    <p>${signEntries[0]?.sign10 || ''}</p>
                    <li>The decision to obtain a tattoo is my own free will and choice.</li>
                    <p>${signEntries[0]?.sign11 || ''}</p>
                    <li>I agree to follow instructions provided to me regarding the maintenance of a sanitary environment during the tattoo process.</li>
                    <p>${signEntries[0]?.sign12 || ''}</p>
                    <li>I agree that the tattoo design is correctly drawn to my specifications and that artist interpretation may occur.</li>
                    <p>${signEntries[0]?.sign13 || ''}</p>
                    <li>I will notify the artist immediately if I feel lightheaded, dizzy, or faint before, during, or after the procedure.</li>
                    <p>${signEntries[0]?.sign14 || ''}</p>
                </ol>
                <div class="sign">
                    <address>Your sign</address>
                    <img src="${imageUrl}" alt="Customer Signature" style="width:200px;"/>
                </div>
            </div>
        </section>
    </body>
    </html>
    `;
}




// exports.createSign = async (req, res, next) => {
//     const { signValueSave, newSignData } = req.body; // signValueSave é a string base64
    
//     try {
//         const customer = await Customer.findById(req.user.id);

//         // Se a imagem antiga existir, deletar do Cloudinary
//         if (customer.imageUrl) {
//             const publicId = customer.imageUrl.split('/').pop().split('.')[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         // Fazer upload da nova assinatura no Cloudinary
//         cloudinary.uploader.upload(signValueSave, async (err, result) => {
//             if (err) {
//                 return next(new ErrorHandler(`Upload fail: ${err.message}`, 'fail', 400));
//             }

//             // Criar o novo registro de assinatura no banco de dados
//             const data = await Sign.create({
//                 signEntries: newSignData,
//                 signValueSave: result.secure_url,
//                 customer: req.user.id
//             });

//             // HTML do documento, incluindo as 14 cláusulas
//             const html = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Client Health Contract and Signature</title>
//                 <style>
//                     .main-pdf {
//                         background-color: #CACACA;
//                         padding: 40px;
//                     }
            
//                     .main-pdf .main-pdf__container {
//                         margin: auto;
//                         width: 80%;
//                     }
            
//                     .main-pdf .main-pdf__container ol li {
//                         color: #101820;
//                         font-family: 'Effra',Arial, Helvetica, sans-serif;
//                         font-size: 14px;
//                         font-weight: 400;
//                         line-height: 125%;
//                         letter-spacing: 0.84px;
//                         margin-bottom: 15px;
//                     }
            
//                     .main-pdf .main-pdf__container ol p {
//                         color: rgba(16, 24, 32, 0.40);
//                         font-family: 'Effra',Arial, Helvetica, sans-serif;
//                         font-size: 13px;
//                         font-weight: 400;
//                         line-height: 150%; 
//                         letter-spacing: 0.78px;
//                     }
//                     .main-pdf-title h1 {
//                         font-size: 34px;
//                         font-weight: 600;
//                         font-family: 'Effra', Arial, Helvetica, sans-serif;
//                         color: #1e1e1e;
//                         font-style: italic;
//                         margin-bottom: 42px;
//                     }
            
//                     .sign {
//                         margin-top: 45px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <section class="main-pdf">
//                     <div class="main-pdf__container">
//                         <div class="main-pdf-title"><h1>Client Health Contract and Signature - SeldenInk</h1></div>
//                         <ol>
//                             <li>I have truthfully represented to Selden.Ink Tattoo Studio that I am over eighteen (18) years of age.</li>
//                             <p>${newSignData[0].sign1}</p>
//                             <li>I acknowledge that it is not reasonably possible for the representatives and employees of Selden.Ink Tattoo Studio to determine whether I might have an allergic reaction to the dyes, pigments or processes used in my tattoo, and I agree to accept the risk that such a reaction is possible.</li>
//                             <p>${newSignData[0].sign2}</p>
//                             <li>I acknowledge that I have advised my tattoo artist of any condition that might affect the healing of this tattoo. I do not have medical or skin conditions such as but not limited to: acne, scarring (Keloid), eczema, psoriasis, freckles, moles, or sunburn in the area to be tattooed that may interfere with said tattoo.</li>
//                             <p>${newSignData[0].sign3}</p>
//                             <li>I am not pregnant or nursing.</li>
//                             <p>${newSignData[0].sign4}</p>
//                             <li>I am not under the influence of alcohol or drugs.</li>
//                             <p>${newSignData[0].sign5}</p>
//                             <li>I acknowledge that infection is always possible as a result of obtaining a tattoo, particularly in the event that I do not take proper care of my tattoo.</li>
//                             <p>${newSignData[0].sign6}</p>
//                             <li>I acknowledge that a tattoo is a permanent change to my appearance and that no representations have been made to me as to the ability to later change or remove my tattoo.</li>
//                             <p>${newSignData[0].sign7}</p>
//                             <li>If my tattoo is a symbol or something written in a language other than English, the tattoo artist and owner of this business are not responsible for what it may mean.</li>
//                             <p>${newSignData[0].sign8}</p>
//                             <li>I am responsible for the correct spelling, grammar, and punctuation of the text in my tattoo.</li>
//                             <p>${newSignData[0].sign9}</p>
//                             <li>I acknowledge that variations in color and design may exist between the selected tattoo and the final result.</li>
//                             <p>${newSignData[0].sign10}</p>
//                             <li>The decision to obtain a tattoo is my own free will and choice.</li>
//                             <p>${newSignData[0].sign11}</p>
//                             <li>I agree to follow instructions provided to me regarding the maintenance of a sanitary environment during the tattoo process.</li>
//                             <p>${newSignData[0].sign12}</p>
//                             <li>I agree that the tattoo design is correctly drawn to my specifications and that artist interpretation may occur.</li>
//                             <p>${newSignData[0].sign13}</p>
//                             <li>I will notify the artist immediately if I feel lightheaded, dizzy, or faint before, during, or after the procedure.</li>
//                             <p>${newSignData[0].sign14}</p>
//                         </ol>
//                         <div class="sign">
//                             <address>Your sign</address>
//                             <img src="${result.secure_url}" alt="sign customer" style="width:200px;"/>
//                         </div>
//                     </div>
//                 </section>
//             </body>
//             </html>
//             `;

//             // Gerar o PDF usando html-pdf
//             pdf.create(html, { format: 'A4' }).toFile('document.pdf', async (err, resFile) => {
//                 if (err) {
//                     return next(new ErrorHandler(`Error generating PDF: ${err.message}`, 'fail', 500));
//                 }

//                 const pdfPath = path.join(__dirname, 'document.pdf');

//                 // Configuração de envio de e-mail
//                 const emails = [`${customer.email}`, 'rafaelmacedosilva88@hotmail.com'];

//                 const transport = nodemailer.createTransport({
//                     host: 'smtp-relay.sendinblue.com',
//                     port: 587,
//                     secure: false,
//                     auth: {
//                         user: 'rafael@tektrio.com',
//                         pass: '4tCmrApkEKIbN1vO'
//                     }
//                 });

//                 // Enviar e-mail com o PDF em anexo
//                 try {
//                     const response = await transport.sendMail({
//                         from: 'Contato - <generate.bot.pdf@tektrio.com>',
//                         to: emails,
//                         subject: 'Sign Customer - Selden Ink',
//                         text: 'You receive an email from Sign Customer - SeldenInk.',
//                         attachments: [
//                             {
//                                 filename: 'sign-document.pdf',
//                                 path: resFile.filename, // Caminho para o PDF gerado
//                             }
//                         ]
//                     });

//                     res.status(200).json({
//                         status: 'success',
//                         data: data,
//                         response: response
//                     });
//                 } catch (emailError) {
//                     return next(new ErrorHandler(`Error sending email: ${emailError.message}`, 'fail', 500));
//                 }
//             });
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Error: ${err.message}`, 'fail', 400));
//     }
// };






// exports.createSign = async (req, res, next) => {
//     const { sign, signValueSave, newSignData } = req.body; // signValueSave é a string base64
    
//     console.log('BODYYYYY --> ', req.body);

//     try {
//         const customer = await Customer.findById({ _id: req.user.id });

//         // Se a imagem antiga existir, deletar do Cloudinary
//         if (customer.imageUrl) {
//             const publicId = customer.imageUrl.split('/').pop().split('.')[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         // Fazer upload para o Cloudinary
//         const dataURI = signValueSave; // Ajuste o tipo MIME (image/webp) conforme necessário
//         cloudinary.uploader.upload(dataURI, async (err, result) => {
//             if (err) {
//                 return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//             }

//             // Criar o novo registro de assinatura no banco de dados
//             const data = await Sign.create({
//                 signEntries: newSignData, // newSignData deve ser um array de objetos conforme definido em newSignArrayData
//                 signValueSave: result.secure_url, // Salvar a URL do Cloudinary, não a string base64
//                 customer: req.user.id
//             });

//             // Conteúdo HTML para o PDF
//             const htmlContent = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Template</title>
//                 <style>
//                     .main-pdf {
//                         background-color: #CACACA;
//                     }
            
//                     .main-pdf .main-pdf__container {
//                         margin: auto;
//                         padding: 40px;
//                         width: 80%;
//                     }
            
//                     .main-pdf .main-pdf__container ol li {
//                         color: #101820;
//                         font-family: 'Effra',Arial, Helvetica, sans-serif;
//                         font-size: 14px;
//                         font-weight: 400;
//                         line-height: 125%;
//                         letter-spacing: 0.84px;
//                     }
            
//                     .main-pdf .main-pdf__container ol p {
//                         color: rgba(16, 24, 32, 0.40);
//                         font-family: 'Effra',Arial, Helvetica, sans-serif;
//                         font-size: 13px;
//                         font-weight: 400;
//                         line-height: 150%; 
//                         letter-spacing: 0.78px;
//                     }
//                     .main-pdf-title h1 {
//                         font-size: 34px;
//                         font-weight: 600;
//                         font-family: 'Effra', Arial, Helvetica, sans-serif;
//                         color: #1e1e1e;
//                         font-style: italic;
//                         margin-bottom: 42px;
//                     }
            
//                     .sign {
//                         margin-top: 45px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <section class="main-pdf">
//                     <div class="main-pdf__container">
//                         <div class="main-pdf-title"><h1>Client Health Contract and Signature - SeldenInk</h1></div>
//                         <ol>
//                             <li>I have truthfully represented to Selden.Ink Tattoo Studio that I am over eighteen (18) years of age.</li>
//                             <p>${newSignData[0].sign1}</p>
//                             <li>I acknowledge that it is not reasonably possible for the representatives and employees of Selden.Ink Tattoo Studio to determine whether I might have an allergic reaction to the dyes, pigments or processes used in my tattoo, and I agree to accept the risk that such a reaction is possible.</li>
//                             <p>${newSignData[0].sign2}</p>
//                             <!-- Adicione as outras entradas aqui -->
//                         </ol>       
//                         <div class="sign">
//                             <address>
//                                 Your sign 
//                             </address>
//                             <img src="${result.secure_url}" alt="sign customer" />
//                         </div>
//                     </div>
//                 </section>
//             </body>
//             </html>
//             `;

//             // Opções de configuração do PDF
//             const options = { format: 'A4' };

//             // Gerar o PDF
//             pdf.create(htmlContent, options).toFile('document.pdf', async (err, resFile) => {
//                 if (err) return next(new ErrorHandler(`Error generating PDF: ${err.message}`, 'fail', 500));

//                 // Caminho para o PDF gerado
//                 const pdfPath = path.join(__dirname, '..', 'document.pdf');

//                 // E-mails para enviar
//                 const emails = [`${customer.email}`, 'rafaelmacedosilva88@hotmail.com'];

//                 // Configuração do transporte de e-mail com nodemailer
//                 const transport = nodemailer.createTransport({
//                     host: 'smtp-relay.sendinblue.com',
//                     port: 587,
//                     secure: false,
//                     auth: {
//                         user: 'rafael@tektrio.com',
//                         pass: '4tCmrApkEKIbN1vO'
//                     }
//                 });

//                 // Enviar o e-mail com o PDF anexado
//                 try {
//                     const response = await transport.sendMail({
//                         from: 'Contato - <generate.bot.pdf@tektrio.com>',
//                         to: emails,
//                         subject: 'Sign Customer - Selden Ink',
//                         text: 'You receive an email from Sign Customer - SeldenInk.',
//                         attachments: [
//                             {
//                                 filename: 'sign-document.pdf',
//                                 path: resFile.filename, // Caminho para o PDF gerado
//                             }
//                         ]
//                     });

//                     // Retornar sucesso na resposta da API
//                     res.status(200).json({
//                         status: 'success',
//                         data: data,
//                         response: response
//                     });
//                 } catch (emailError) {
//                     return next(new ErrorHandler(`Error sending email: ${emailError.message}`, 'fail', 500));
//                 }
//             });
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Error: ${err.message}`, 'fail', 400));
//     }
// };



// exports.createSign = async(req,res,next) => {
//     const { sign, signValueSave, newSignData } = req.body;

//     // const signCustomer = await Sign.create({
//     //     sign: sign,
//     //     customer: req.user._id
//     // });

//     // signValueSave: retorna um base64

//     try {
//         const customer = await Customer.findById({ _id: req.user.id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(customer.imageUrl){
//             const publicId = customer.imageUrl.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         cloudinary.uploader.upload(req.file.path, async(err,result) => {
//             if(err){
//                 return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//             }

//             await Sign.create({
//                 sign,
//                 signValueSave, 
//                 newSignData
//             })
    
//             res.status(200).json({
//                 status: 'success',
//                 result: result.url
//             })
//         })
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }

// GET Sign
exports.getSign = async(req,res,next) => {
    try {
        const signCustomer = await Sign.findOne({ customer: req.user._id });
    
        res.status(200).json({
            status: 'success',
            signCustomer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}

exports.getCustomerArtistSign = async(req,res,next) => {
    const { id } = req.params;

    try {
        const signCustomer = await Sign.findOne({ customer: id });
    
        res.status(200).json({
            status: 'success',
            signCustomer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}


// GET Customer sign - ADMIN PAGE
exports.getOneCustomerSignAdmin = async(req,res,next) => {
    const { id } = req.params;

    try {
        const signCustomer = await Sign.findOne({ customer: id });
    
        res.status(200).json({
            status: 'success',
            signCustomer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}


exports.getAllSign = async(req,res,next) => {
    try {
        const signCustomer = await Sign.findOne({});
    
        res.status(200).json({
            status: 'success',
            signCustomer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
}


exports.uploadProfilePhoto = async(req,res,next) => {

    const allowedExtensions = ['jpg','jpeg','webp','png','gif']

    const filesType = req.file.originalname.split('.').pop().toLowerCase()

    try {
        const customer = await Customer.findById({ _id: req.user.id })

        // Return image ID and delete direct image direct on cloudinary
        if(customer.imageUrl){
            const publicId = customer.imageUrl.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(publicId)
        }

        if(allowedExtensions.includes(filesType)){
            cloudinary.uploader.upload(req.file.path, async(err,result) => {
                if(err){
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }
    
                await Customer.findOneAndUpdate({ _id: req.user.id }, {
                    imageUrl: result.url
                })
        
                res.status(200).json({
                    status: 'success',
                    result: result.url
                })
            })
        }else {
            return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
        }
    }catch(err){
        return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
    }
}


exports.uploadProfilePhotoDocument = async(req,res,next) => {

    const allowedExtensions = ['jpg','jpeg','webp','png','gif']

    const filesType = req.file.originalname.split('.').pop().toLowerCase()


    // console.log(req.file);
    try {
        const customer = await Customer.findById({ _id: req.user.id })

        // Return image ID and delete direct image direct on cloudinary
        if(customer.imageUrlDocument){
            const publicId = customer.imageUrlDocument.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(publicId)
        }

        if(allowedExtensions.includes(filesType)){
            cloudinary.uploader.upload(req.file.path, async(err,result) => {
                if(err){
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }
    
                await Customer.findOneAndUpdate({ _id: req.user.id }, {
                    imageUrlDocument: result.url
                })
        
                res.status(200).json({
                    status: 'success',
                    result: result.url
                })
            })
        }else {
            return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
        }
    }catch(err){
        return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
    }
}


// POST /create - checkin
exports.checkin = async (req,res,next) => {
    const {
        read_before, 
        document_photo, 
        bio,
        health,
        legal,
        social, 
        guidelines_preparation, 
        sterilization_safety,
        confirm
    } = req.body;

    try {
        const checkinExist = await Checkin.findOne({ customer: req.user._id })
    
        if(checkinExist){
            const updatedCheckin = await Checkin.findByIdAndUpdate(checkinExist._id, {
                read_before, 
                document_photo, 
                bio,
                health,
                legal,
                social, 
                guidelines_preparation, 
                sterilization_safety,
                confirm
            })
            
            res.status(200).json({
                status: 'success',
                message: 'updated successfuly',
                updatedCheckin
            })
        }else {
            const checkinData = await Checkin.create({
                read_before, 
                document_photo, 
                bio,
                health,
                legal,
                social, 
                guidelines_preparation, 
                sterilization_safety,
                confirm,
                customer: req.user
            });

            res.status(200).json({
                status: 'success',
                checkinData
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`, 500));
    }
}

// GET /all checkin
exports.getCheckin = async(req,res,next) => {
    try {
        const checkin_data = await Checkin.find({ customer: req.user._id });

        res.status(200).json({
            status: 'success',
            checkin_data
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`, 500));
    }
}

// .populate( 'customer','id' )

exports.settings = async(req,res,next) => {
    const {
        sms,
        notification,
        email_newsletter,
        announcement,
        share_browser,
        accept_support,
        appointment_reminder,
        hipaa_compliant_notification,
        includes_message_emails,
        welcome_email,
        business_notification,
        notification_employee,
        email_notification,
        text_notification,
        push_notification,
        low_inventory_notification,
        marketing_email_business,
        tektrio_emails,
        tektrio_text_notification,
        new_customer_appointments, 
        old_customer_appointments,
        customer_with_no_shows_or_cancellations,
        block_new_customer_online_booking, 
        limit_how_far_in_advance_customer_can_book,
        limit_how_far_in_advance_customer_can_class,
        admin_status,
        admin_online_booking,
        admin_share_calendar,
        admin_display_on_team_page
    }= req.body;

    try {
        const setting = await Setting.findOne({ customer: req.user._id });

        if(setting){
            const settingData = await Setting.findOneAndUpdate(setting._id, {
                sms,
                notification,
                email_newsletter,
                announcement,
                share_browser,
                accept_support,
                appointment_reminder,
                hipaa_compliant_notification,
                includes_message_emails,
                welcome_email,
                business_notification,
                notification_employee,
                email_notification,
                text_notification,
                push_notification,
                low_inventory_notification,
                marketing_email_business,
                tektrio_emails,
                tektrio_text_notification,
                new_customer_appointments, 
                old_customer_appointments,
                customer_with_no_shows_or_cancellations,
                block_new_customer_online_booking, 
                limit_how_far_in_advance_customer_can_book,
                limit_how_far_in_advance_customer_can_class,
                admin_status,
                admin_online_booking,
                admin_share_calendar,
                admin_display_on_team_page
            })

            res.status(200).json({
                status: 'success',
                message: 'Setting Updated successfuly!',
                settingData
            })
        }else {
            const settingData = await Setting.create({
                sms,
                notification,
                email_newsletter,
                announcement,
                share_browser,
                accept_support,
                appointment_reminder,
                hipaa_compliant_notification,
                includes_message_emails,
                welcome_email,
                business_notification,
                notification_employee,
                email_notification,
                text_notification,
                push_notification,
                low_inventory_notification,
                marketing_email_business,
                tektrio_emails,
                tektrio_text_notification,
                new_customer_appointments, 
                old_customer_appointments,
                customer_with_no_shows_or_cancellations,
                block_new_customer_online_booking, 
                limit_how_far_in_advance_customer_can_book,
                limit_how_far_in_advance_customer_can_class,
                admin_status,
                admin_online_booking,
                admin_share_calendar,
                admin_display_on_team_page,
                customer: req.user
            })

            res.status(200).json({
                status: 'success',
                settingData
            })
        }
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`, 500));
    }
}

exports.getAllSettings = async(req,res,next) => {
    try {
        const settings = await Setting.findOne({ customer: req.user._id });

        res.status(200).json({
            status: 'success',
            settings
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`, 500));
    }
}

// GET specific Setting by ID  
exports.getSpecificSettingInfo = async(req,res,next) => {
    const { id } = req.params;

    try {
        const settings = await Setting.findOne({ customer: id });

        res.status(200).json({
            status: 'success',
            settings
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`, 500));
    }
}



// DELETE ACCOUNT 
exports.deleteAccount = async(req,res,next) => {
    try {
        // Remove customer and their checkin, settings infos
        await Customer.findByIdAndDelete({ _id: req.user.id });
        // await Checkin.findOneAndDelete({ customer: req.user._id });
        await Setting.findOneAndDelete({ customer: req.user._id });

        return res.status(204).json({
            status: 'success',
            message: 'deleted successfuly!'
        })
    }catch(err){
        return next(new ErrorHandler(`You DO NOT have perssion to proceed on this action ${err.message}`, 403));
    }
}