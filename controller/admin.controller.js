// const Customer     = require('../models/Customer');
// const Health       = require('../models/Health');
// const Store        = require('../models/Store');
// const ErrorHandler = require('../utils/ErrorHandler');
// const Service = require('../models/Service');
// const cloudinary   = require('../middlewares/cloudinary');  
// const Category     = require('../models/Category');
// const Book         = require('../models/Book');


// // GET - all customers
// exports.getCustomers = async (req, res, next) => {
//     try {
//         const customers = await Customer.find({ roles: 'user' });

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 customers
//             }
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
// };


// // GET - customer profile
// exports.getCustomer = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         const customer = await Customer.find({ _id: id });

//         if(!customer){
//             return next(new ErrorHandler(`User not found, something went wrong when you try to access user info.`,'fail',404));
//         }

//         res.status(200).json({
//             customer
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // GET - one health customer
// exports.getHealthCustomer = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         const health = await Health.find({ customer: id });

//         if(!health){
//             return next(new ErrorHandler(`User not found, something went wrong when you try to access user info.`,'fail',404));
//         }

//         res.status(200).json({
//             health
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // PUT - update one customer
// exports.updateCustomer = async(req,res,next) => {
//     const { id } = req.params;
//     const {
//         name,
//         email,
//         phone,
//         birth,
//         role,
//         address,
//         city,
//         password,
//         confirm_password,
//         country,
//         location,
//         nationality,
//         zipcode,
//         gender,
//         document_id_profile,
//         referral,
//         referral_email,
//         referral_name,
//         referral_phone,
//         imageUrlDocument
//     } = req.body;

//     console.log(imageUrlDocument)

//     if(password && (password !== confirm_password)){
//         return next(new ErrorHandler(`both password must to be equal, please type correct ${password} and ${confirm_password}`,'fail',400));
//     }

//     try {
//         const customerUpdated = await Customer.findOne({_id: id}).select('password');

//         customerUpdated.name = name;
//         customerUpdated.email = email;
//         customerUpdated.phone = phone;
//         customerUpdated.birth = birth;
//         customerUpdated.role = role;
//         customerUpdated.address = address;
//         customerUpdated.city = city;
//         customerUpdated.password = password ? password : customerUpdated.password;
//         customerUpdated.country = country;
//         customerUpdated.location = location;
//         customerUpdated.nationality = nationality;
//         customerUpdated.zipcode = zipcode;
//         customerUpdated.gender = gender
//         customerUpdated.document_id_profile = document_id_profile;
//         customerUpdated.referral = referral;
//         customerUpdated.referral_email = referral_email;
//         customerUpdated.referral_name = referral_name;
//         customerUpdated.referral_phone = referral_phone;
//         customerUpdated.imageUrlDocument = imageUrlDocument;
        
//         await customerUpdated.save();
        
//         res.status(200).json({
//             status: 'success',
//             message: 'Customer updated successfuly!'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }




// // POST - Create new Customer
// exports.createNewCustomerAdminDashboard = async(req,res,next) => {
//     const {
//         name,
//         email,
//         phone,
//         birth,
//         address,
//         city,
//         country,
//         location,
//         nationality,
//         zipcode,
//         gender,
//         document_id_profile,
//         referral,
//         referral_email,
//         referral_name,
//         referral_phone,
//         password,
//         confirm_password,
//         imageUrlDocument
//     } = req.body;

//     if(!password || !confirm_password){
//         return next(new ErrorHandler(`"password" and "confirm password" must be equal.`,400));
//     }

//     if(!name || !email || !phone || !birth || !gender){
//         return next(new ErrorHandler(`all fields are required: Nome, E-mail, Phone, Birth, Gender`,'fail',400));
//     }

//     try {    
//         const customer = await Customer.create({
//             name,
//             email,
//             phone,
//             birth,
//             address,
//             city,
//             country,
//             location,
//             nationality,
//             zipcode,
//             gender,
//             document_id_profile,
//             referral,
//             referral_email,
//             referral_name,
//             referral_phone,
//             password,
//             imageUrlDocument
//         });
        
//         res.status(200).json({
//             status: 'success',
//             customer
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }


// // POST/ Upload - new - admin - dashboard - customer 
// exports.uploadNewCustomerAdminDashboardCustomer = async(req,res,next) => {
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         if(allowedExtensions.includes(filesType)){
//             console.log('deu certo')
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }

// // Upload image to employee
// exports.uploadUpdateCustomerAdminDashboardCustomer = async(req,res,next) => {
//     const id = req.params.id;
    
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     // console.log(filesType)
//     try {
//         const customer = await Customer.findById({ _id: id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(customer.imageUrlDocument){
//             const publicId = customer.imageUrlDocument.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 await Customer.findOneAndUpdate({ _id: id }, {
//                     imageUrlDocument: result.url
//                 })
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }







// // GET - all employees 
// exports.getAllEmployees = async(req,res,next) => {
//     try {
//         const employees = await Customer.find();

//         res.status(200).json({
//             employees
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }


// // GET - employee profile detail
// exports.getEmployee = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         const employee = await Customer.find({ _id: id });

//         if(!employee){
//             return res.status(404).json({
//                 status: 'fail',
//                 message: `User not found, something went wrong when you try to access user info.`
//             })
//         }

//         res.status(200).json({
//             employee
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // POST - employee create 
// // POST - employee create 
// exports.addNewEmployee = async (req, res, next) => {
//     const {
//         name,
//         roles,
//         email,
//         phone,
//         password,
//         confirm_password,
//         birth,
//         gender,
//         nationality,
//         country,
//         zipcode,
//         address,
//         city,
//         location,
//         p_shop,
//         p_w_days,
//         p_w_hours,
//         bio,
//         status,
//         online_booking,
//         share_calendar,
//         document_id_profile,
//         imageUrlDocument,
//         display_on_staff_page,
//         imageUrl
//     } = req.body;

//     if (!name || !roles || !email || !phone || !password || !confirm_password || !birth || !gender) {
//         return next(new ErrorHandler(`${name} - ${roles} - ${email} - ${phone} - ${password} - ${confirm_password} - ${birth} - ${gender} all these fields are required.`, 'fail', 400));
//     }

//     if (password && (password !== confirm_password)) {
//         return next(new ErrorHandler(`Both passwords must be equal, please type correct ${password} and ${confirm_password}`, 'fail', 400));
//     }

//     try {
//         const employee = await Customer.findOne({ email });

//         if (employee) {
//             return res.status(409).json({
//                 status: 'fail',
//                 message: `This email: ${email} already exists. Please try using another email.`
//             });
//         }

//         const profileEmployee = await Customer.create(req.body);

//         res.status(200).json({
//             status: 'success',
//             message: 'Employee created successfully!',
//             profileEmployee
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
//     }
// };





// // exports.addNewEmployee = async(req,res,next) => {
// //     const {
// //         name,
// //         role,
// //         email,
// //         phone,
// //         password,
// //         confirm_password,
// //         birth,
// //         gender,
// //         nationality,
// //         country,
// //         zipcode,
// //         address,
// //         city,
// //         location,
// //         p_shop,
// //         p_w_days,
// //         p_w_hours,
// //         bio,
// //         status,
// //         online_booking,
// //         share_calendar,
// //         document_id_profile,
// //         imageUrlDocument,
// //         display_on_staff_page,
// //         imageUrl
// //     } = req.body;



// //     console.log(imageUrlDocument);
// //     console.log(imageUrl)

// //     if(!name || !role || !email || !phone || !password || !confirm_password || !birth || !gender){
// //         return next(new ErrorHandler(`${name} - ${role} - ${email} - ${phone} - ${password} - ${confirm_password} - ${birth} - ${gender} all these fields are required.`,'fail',400));
// //     }

// //     if(password && (password !== confirm_password)){
// //         return next(new ErrorHandler(`both password must to be equal, please type correct ${password} and ${confirm_password}`,'fail',400));
// //     }

// //     try {
// //         const employee = await Customer.findOne({ email });

// //         if(employee){
// //             return res.status(409).json({
// //                 status: 'fail',
// //                 message: `This email: ${email} already exists. Please try using another e-mail.`
// //             })
// //         }

// //         const profileEmployee = await Customer.create(req.body);
// //         // name,
// //         // role,
// //         // email,
// //         // phone,
// //         // password,
// //         // confirm_password,
// //         // birth,
// //         // gender,
// //         // nationality,
// //         // country,
// //         // zipcode,
// //         // address,
// //         // city,
// //         // location,
// //         // p_shop,
// //         // p_w_days,
// //         // p_w_hours,
// //         // bio,
// //         // status,
// //         // online_booking,
// //         // share_calendar,
// //         // document_id_profile,
// //         // imageUrlDocument,
// //         // display_on_staff_page,
// //         // imageUrl

// //         // console.log(display_on_staff_page)
        

// //         res.status(200).json({
// //             status: 'success',
// //             message: 'Employee updated successfuly!',
// //             profileEmployee
// //         })
// //     }catch(err){
// //         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
// //     }
// // }


// // PUT - employee update 
// exports.updateEmployee = async(req,res,next) => {
//     const { id } = req.params;
//     const {
//         name,
//         role,
//         email,
//         phone,
//         password,
//         confirm_password,
//         birth,
//         gender,
//         nationality,
//         country,
//         zipcode,
//         address,
//         city,
//         location,
//         p_shop,
//         p_w_role,
//         p_w_days,
//         p_w_hours,
//         bio,
//         status,
//         online_booking,
//         share_calendar,
//         document_id_profile
//     } = req.body;

//     if(password && (password !== confirm_password)){
//         return next(new ErrorHandler(`both password must to be equal, please type correct ${password} and ${confirm_password}`,'fail',400));
//     }

//     try {
//         const employeeUpdated = await Customer.findOne({_id: id}).select('password');

//         employeeUpdated.name = name;
//         employeeUpdated.email = email;
//         employeeUpdated.phone = phone;
//         employeeUpdated.birth = birth;
//         employeeUpdated.role = role;
//         employeeUpdated.address = address;
//         employeeUpdated.city = city;
//         employeeUpdated.password = password ? password : employeeUpdated.password;
//         employeeUpdated.country = country;
//         employeeUpdated.location = location;
//         employeeUpdated.nationality = nationality;
//         employeeUpdated.zipcode = zipcode;
//         employeeUpdated.gender = gender; 
//         employeeUpdated.p_shop = p_shop;
//         employeeUpdated.p_w_role = p_w_role;
//         employeeUpdated.p_w_days = p_w_days;
//         employeeUpdated.p_w_hours = p_w_hours
//         employeeUpdated.bio = bio;
//         employeeUpdated.status = status;
//         employeeUpdated.online_booking = online_booking;
//         employeeUpdated.share_calendar = share_calendar;
//         employeeUpdated.document_id_profile = document_id_profile;
        
//         await employeeUpdated.save();

//         res.status(200).json({
//             status: 'success',
//             message: 'Employee updated successfuly!'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }


// exports.deleteEmployee = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         await Customer.findByIdAndDelete(id);    

//         res.status(204).json({
//             status: 'success',
//             message: 'No content to return'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }


// // Upload image to employee
// exports.uploadEmployeePhoto = async(req,res,next) => {
//     const id = req.params.id;
    
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     // console.log(filesType)
//     try {
//         const customer = await Customer.findById({ _id: id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(customer.imageUrl){
//             const publicId = customer.imageUrl.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 await Customer.findOneAndUpdate({ _id: id }, {
//                     imageUrl: result.url
//                 })
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }


// // Upload new image to employee
// exports.uploadNewEmployeePhoto = async(req,res,next) => {

//     const id_params = req.params;

//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     console.log(allowedExtensions.includes(filesType));

//     try {

//         // if(id_params){
//         //     const customer = await Customer.findById({ _id: id_params })
    
//         //     // Return image ID and delete direct image direct on cloudinary
//         //     if(customer.imageUrl){
//         //         const publicId = customer.imageUrl.split('/').pop().split('.')[0]
//         //         await cloudinary.uploader.destroy(publicId)
//         //     }
//         // }

//         if(allowedExtensions.includes(filesType)){
//             console.log('deu certo')
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }






// // STORES
// // GET - All stores
// exports.getAllStores = async(req,res,next) => {
//     try {
//         const stores = await Store.find({});

//         res.status(200).json({
//             status: 'success',
//             stores
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // GET - One store only
// exports.getStoreDetail = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         const stores = await Store.find({_id: id});

//         res.status(200).json({
//             status: 'success',
//             stores
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // POST - Create new store 
// exports.createNewStore = async(req,res,next) => {
//     const {
//         address,
//         city,
//         comments,
//         country,
//         days_open,
//         email,
//         name,
//         phone,
//         state,
//         whatsapp,
//         zipcode,
//         imageUrl,
//     } = req.body;

//     if(!address || !city || !comments || !country || !days_open || !email || !name || !phone || !state || !zipcode){
//         return next(new ErrorHandler(`All fields are required`,'fail',400));
//     }

//     try {
//         const email_exists = await Store.findOne({ email })

//         if(email_exists){
//             return next(new ErrorHandler('This e-mail already exists on our system, plese try register with another one.','fail',409))
//         }

//         const store = await Store.create({
//             address,
//             city,
//             comments,
//             country,
//             days_open,
//             email,
//             name,
//             phone,
//             state,
//             whatsapp,
//             zipcode,
//             imageUrl
//         });

//         res.status(200).json({
//             status: 'success',
//             store
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }

// }

// exports.deleteOneStore = async(req,res,next) => {
//     const { id } = req.body;

//     try {
//         await Store.findByIdAndDelete(id);
    
//         return res.status(200).json({
//             status: 'success'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500)); 
//     }
// }


// // UPDATE - Update a specific store 
// exports.updateStore = async(req,res,next) => {
//     const { id } = req.params;
//     const {
//         address,
//         city,
//         comments,
//         country,
//         days_open,
//         email,
//         name,
//         phone,
//         state,
//         whatsapp,
//         zipcode
//     } = req.body;

//     // if(!address || !city || !comments || !country || !days_open || !email || !name || !phone || !state || !whatsapp || !zipcode){
//     //     return next(new ErrorHandler(`All fields are required`,'fail',400));
//     // }

//     try {
//         // const store = await
//         const store = await Store.findOneAndUpdate({_id: id}, {
//             address,
//             city,
//             comments,
//             country,
//             days_open,
//             email,
//             name,
//             phone,
//             state,
//             whatsapp,
//             zipcode
//         }, { new: true })

//         res.status(200).json({
//             status: 'success',
//             message: 'Store updated successfuly!',
//             store
//         })
//     }catch(err){
//         let errorMessage = err.message;

//         const match = errorMessage.match('E11000 duplicate key error collection')

//         const duplicateKeyError = match ? match[0] : errorMessage;    
        
//         return next(new ErrorHandler(`${duplicateKeyError}`,'fail',500));
//     }
    
// }


// // Upload image to store 
// exports.uploadStorePhoto = async(req,res,next) => {
//     const id = req.params.id;
    
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()


//     // console.log(filesType)
//     try {
//         const store = await Store.findById({ _id: id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(store.imageUrl){
//             const publicId = store.imageUrl.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 await Store.findOneAndUpdate({ _id: id }, {
//                     imageUrl: result.url
//                 })
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }

// // New upload store file - This just create and upload a file to the store. 
// exports.uploadStoreNewPhotoCustom = async(req,res,next) => {
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }


// // let errorMessage = err.message;

// // const match = errorMessage.match('E11000 duplicate key error collection');

// // const duplicateKeyError = match ? match[0] : errorMessage;


// // SERVICES
// // GET - all 
// exports.getAllServices = async(req,res,next) => {
//     try {
//         const services = await Service.find({})

//         res.status(200).json({
//             status: 'success',
//             services
//         })
//     }catch(err){
//         return next(new ErrorHandler(`${err}`,'fail',500))
//     }
// }

// exports.getServiceDetail = async(req,res,next) => {
//     const { id } = req.params;

//     try {
//         const service = await Service.findOne({ _id: id })

//         if(!service){
//             return next(new ErrorHandler('Service not found','fail',404))
//         }

//         res.status(200).json({
//             status: 'success',
//             service
//         })
//     }catch(err){
//         return next(new ErrorHandler(`${err}`,'fail',500))
//     }
// }

// // POST - Create new Service 
// exports.createNewService = async(req,res,next) => {
//     const {
//         name,
//         category,
//         description,
//         resources,
//         b_cost,
//         tax,
//         serviceInfo
//     } = req.body;

//     // console.log(tax,serviceInfo)

//     if( !name || !category){
//         return next(new ErrorHandler(`All fields are required`,'fail',400));
//     }

//     try {
//         const servicesExists = await Service.findOne({ name }) 

//         // if(servicesExists){
//         //     return next(new ErrorHandler('This service already exists, please create a new one with another name.','fail',409))
//         // }

//         const service = await Service.create({
//             name,
//             category,
//             description,
//             resources,
//             b_cost,
//             tax,
//             serviceInfo
//         });

//         res.status(200).json({
//             status: 'success',
//             // services
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // UPDATE - Update a specific service 
// exports.updateService = async(req,res,next) => {
//     const { id } = req.params;
//     const {
//         name,
//         category,
//         description,
//         resources,
//         b_cost,
//         tax,
//         serviceInfo
//     } = req.body;

//     // console.log(req.body)

//     // if( !name || !category){
//     //     return next(new ErrorHandler(`All fields are required`,'fail',400));
//     // }

//     try {
        
//         await Service.findByIdAndUpdate({ _id: id }, {
//             name,
//             category,
//             description,
//             resources,
//             b_cost,
//             tax,
//             serviceInfo
//         }) 

//         res.status(200).json({
//             status: 'success',
//             message: 'Service updted successfuly!'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
//     }
// }

// // Upload image to service 
// exports.uploadServicePhoto = async(req,res,next) => {
//     const id = req.params.id;
    
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     // console.log(filesType)
//     try {
//         const service = await Service.findById({ _id: id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(service.imageUrl){
//             const publicId = service.imageUrl.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 await Service.findOneAndUpdate({ _id: id }, {
//                     imageUrl: result.url
//                 })
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }


// // Service - Category 
// exports.serviceCategoryNew = async(req,res,next) => {
//     const { name, description, categoryOption } = req.body;
    
//     try {
//         const service_category = await Category.create({
//             name,
//             description, 
//             categoryOption
//         })

//         res.status(200).json({
//             status: 'success',
//             service_category
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err.message}`, 'fail', 500));
//     }
// }

// // Delete complete category service 
// exports.deleteServiceCategory = async(req,res,next) => {
//     const { id } = req.params;

//     if(!id){
//         return next(new ErrorHandler(`This action could not be carried out. ${err.message}`, 'fail', 500));   
//     }

//     try {
//         await Category.findByIdAndDelete({ _id: id });

//         res.status(204).json({
//             status: 'success'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err.message}`, 'fail', 500));
//     }
// }

// // Delete category Option chunk item.
// exports.deleteCategoryOptionChunkItem = async(req,res,next) => {
//     const { id_category_option } = req.params;
//     const position = req.body.index;
//     const categoryId = req.body.id;

//     try {
//         const updateResult = await Category.updateOne({ _id: categoryId }, { $unset: {[`categoryOption.${position}`]: 1}})
        
//         // Para remover o elemento null resultante, use $pull com null
//         await Category.updateOne({ _id: categoryId }, { $pull: { categoryOption: null }})

//         if(updateResult.modifiedCount === 0){
//             return next(new ErrorHandler('No item found to delete', 'fail', 404));
//         }

//         res.status(200).json({
//             status: 'success'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err.message}`, 'fail', 500));
//     }
// }


// // Update admin - schedule dashboard
// exports.updateAdminScheduleDashboard = async (req, res, next) => {
//     const { id } = req.params;
//     const { store, artist } = req.body;
    
//     try {
//         const bookUpdateSchedule = await Book.findOne({
//             _id: id
//         })

//         if(bookUpdateSchedule){
//             bookUpdateSchedule.store = store;
//             bookUpdateSchedule.artist = artist;
//         }
    
//         await bookUpdateSchedule.save();
    
//         return res.status(200).json({
//             status: 'success',
//             message: 'updated successfuly!'
//         })
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err.message}`, 'fail', 500));
//     }
// };


// exports.getAllServicesCategories = async(req,res,next) => {
//     try {
//         const categories = await Category.find({})

//         if(categories){
//             res.status(200).json({
//                 status: 'success',
//                 categories
//             })
//         }else {
//             return next(new ErrorHandler(`No category ${err.message}`, 'fail', 500));   
//         }
//     }catch(err){
//         return next(new ErrorHandler(`Something went wrong ${err.message}`, 'fail', 500));
//     }
// }


// // Upload a new photo on new category 
// exports.uploadNewCategoryPhoto = async (req, res, next) => {
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 // await Service.findOneAndUpdate({ _id: id }, {
//                 //     imageUrl: result.url
//                 // })

//                 // console.log('RESULT URL >> ', result.url);
        
//                 res.status(200).json({
//                     status: 'success',
//                     imageUrl: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
//     // Retorna a URL da imagem hospedada no Cloudinary
//     // res.json({ imageUrl: req.file.path });
// };


// // Update Existing image file to Admin - service - Category
// exports.uploadImageUpdateCategory = async (req, res, next) => {
//     if (!req.file) {
//       return res.status(400).send('No image uploaded.');
//     }

//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         const category = await Category.findById(req.body.id);
//         const categoryPosition = category?.categoryOption[req.body.position];

//         // Obtendo a URL antiga
//         const oldImageCategoryOptionUrl = categoryPosition?.optionImage;

//         // // Return image ID and delete direct image direct on cloudinary
//         if(oldImageCategoryOptionUrl){
//             const publicId = oldImageCategoryOptionUrl.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 // await Service.findOneAndUpdate({ _id: id }, {
//                 //     imageUrl: result.url
//                 // })

//                 // console.log('RESULT URL >> ', result.url);
        
//                 res.status(200).json({
//                     status: 'success',
//                     imageUrl: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
//     // Retorna a URL da imagem hospedada no Cloudinary
//     // res.json({ imageUrl: req.file.path });
// };


// // EMPLOYEE -----

// // Update artist ID DOCUMENT /admin manager 
// exports.uploadAdminArtistDocumentPhoto = async(req,res,next) => {
//     const { id } = req.params; 

//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         const customer = await Customer.findById({ _id: id })

//         // Return image ID and delete direct image direct on cloudinary
//         if(customer.imageUrlDocument){
//             const publicId = customer.imageUrlDocument.split('/').pop().split('.')[0]
//             await cloudinary.uploader.destroy(publicId)
//         }

//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 await Customer.findOneAndUpdate({ _id: id }, {
//                     imageUrlDocument: result.url
//                 })
        
//                 res.status(200).json({
//                     status: 'success',
//                     result: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
// }


// // Upload a new photo on new category 
// exports.uploadNewEmployeePhotoCreate = async (req, res, next) => {
//     const allowedExtensions = ['jpg','jpeg','webp','png','gif']

//     const filesType = req.file.originalname.split('.').pop().toLowerCase()

//     try {
//         if(allowedExtensions.includes(filesType)){
//             cloudinary.uploader.upload(req.file.path, async(err,result) => {
//                 if(err){
//                     return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
//                 }
    
//                 // await Service.findOneAndUpdate({ _id: id }, {
//                 //     imageUrl: result.url
//                 // })

//                 // console.log('RESULT URL >> ', result.url);
        
//                 res.status(200).json({
//                     status: 'success',
//                     imageUrl: result.url
//                 })
//             })
//         }else {
//             return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//         }
//     }catch(err){
//         return next(new ErrorHandler(`We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed`, 'fail', 400));
//     }
//     // Retorna a URL da imagem hospedada no Cloudinary
//     // res.json({ imageUrl: req.file.path });
// };





























const Customer = require('../models/Customer');
const Health = require('../models/Health');
const Store = require('../models/Store');
const ErrorHandler = require('../utils/ErrorHandler');
const Service = require('../models/Service');
const cloudinary = require('../middlewares/cloudinary');
const Category = require('../models/Category');
const Book = require('../models/Book');

const fs = require('fs');

// GET - all customers
exports.getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find({ roles: 'user' });

        res.status(200).json({
            status: 'success',
            data: {
                customers
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// GET - customer profile
exports.getCustomer = async (req, res, next) => {
    const { id } = req.params;

    try {
        const customer = await Customer.findById(id);

        if (!customer) {
            return next(new ErrorHandler('User not found, something went wrong when you try to access user info.', 'fail', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                customer
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// GET - one health customer
exports.getHealthCustomer = async (req, res, next) => {
    const { id } = req.params;

    try {
        const health = await Health.findOne({ customer: id });

        if (!health) {
            return next(new ErrorHandler('User not found, something went wrong when you try to access user info.', 'fail', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                health
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// PUT - update one customer
exports.updateCustomer = async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        email,
        phone,
        birth,
        roles,
        address,
        city,
        password,
        confirm_password,
        country,
        location,
        nationality,
        zipcode,
        gender,
        document_id_profile,
        referral,
        referral_email,
        referral_name,
        referral_phone,
        imageUrlDocument
    } = req.body;

    if (password && (password !== confirm_password)) {
        return next(new ErrorHandler('Both passwords must be equal, please type correct passwords.', 'fail', 400));
    }

    try {
        const customerUpdated = await Customer.findById(id).select('password');

        customerUpdated.name = name;
        customerUpdated.email = email;
        customerUpdated.phone = phone;
        customerUpdated.birth = birth;
        customerUpdated.roles = roles;
        customerUpdated.address = address;
        customerUpdated.city = city;
        customerUpdated.password = password ? password : customerUpdated.password;
        customerUpdated.country = country;
        customerUpdated.location = location;
        customerUpdated.nationality = nationality;
        customerUpdated.zipcode = zipcode;
        customerUpdated.gender = gender;
        customerUpdated.document_id_profile = document_id_profile;
        customerUpdated.referral = referral;
        customerUpdated.referral_email = referral_email;
        customerUpdated.referral_name = referral_name;
        customerUpdated.referral_phone = referral_phone;
        customerUpdated.imageUrlDocument = imageUrlDocument;

        await customerUpdated.save();

        res.status(200).json({
            status: 'success',
            message: 'Customer updated successfully!'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// POST - Create new Customer
exports.createNewCustomerAdminDashboard = async (req, res, next) => {
    const {
        name,
        email,
        phone,
        birth,
        address,
        city,
        country,
        location,
        nationality,
        zipcode,
        gender,
        document_id_profile,
        referral,
        referral_email,
        referral_name,
        referral_phone,
        password,
        confirm_password,
        imageUrlDocument
    } = req.body;

    if (!password || !confirm_password) {
        return next(new ErrorHandler('"Password" and "confirm password" must be equal.', 400));
    }

    if (!name || !email || !phone || !birth || !gender) {
        return next(new ErrorHandler('All fields are required: Name, Email, Phone, Birth, Gender', 'fail', 400));
    }

    try {
        const customer = await Customer.create({
            name,
            email,
            phone,
            birth,
            address,
            city,
            country,
            location,
            nationality,
            zipcode,
            gender,
            document_id_profile,
            referral,
            referral_email,
            referral_name,
            referral_phone,
            password,
            imageUrlDocument
        });

        res.status(200).json({
            status: 'success',
            data: {
                customer
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// POST/Upload - new admin dashboard customer
exports.uploadNewCustomerAdminDashboardCustomer = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// Upload image to customer
exports.uploadUpdateCustomerAdminDashboardCustomer = async (req, res, next) => {
    const id = req.params.id;
    
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const customer = await Customer.findById(id);

        // Return image ID and delete direct image direct on cloudinary
        if (customer.imageUrlDocument) {
            const publicId = customer.imageUrlDocument.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                await Customer.findOneAndUpdate({ _id: id }, {
                    imageUrlDocument: result.url
                });

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// GET - all employees
// exports.getAllEmployees = async (req, res, next) => {
//     try {
//         const employees = await Customer.find({ roles: { $in: ['admin', 'artist', 'owner'] } });


//         console.log(employees)
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 employees
//             }
//         });
//     } catch (err) {
//         return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
//     }
// };

exports.getAllEmployees = async (req, res, next) => {
    try {
        const employees = await Customer.find({
            roles: { $in: ['admin', 'artist', 'owner'] }
        }).lean(); // Adiciona `.lean()` para garantir que os dados venham sem formatações adicionais do Mongoose


        console.log('EMPLOYEES ==>>> ', employees)

        // console.log(employees)
        res.status(200).json({
            status: 'success',
            data: {
                employees: employees.map(emp => ({
                    ...emp,
                    roles: Array.isArray(emp.roles) ? emp.roles : [emp.roles] // Garante que roles seja sempre um array
                }))
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};


// GET - employee profile detail
exports.getEmployee = async (req, res, next) => {
    const { id } = req.params;

    try {
        const employee = await Customer.findById(id);

        if (!employee) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found, something went wrong when you try to access user info.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                employee
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// POST - employee create
exports.addNewEmployee = async (req, res, next) => {
    const {
        name,
        roles,
        email,
        phone,
        password,
        confirm_password,
        birth,
        gender,
        nationality,
        country,
        zipcode,
        address,
        city,
        location,
        p_shop,
        p_w_days,
        p_w_hours,
        bio,
        status,
        online_booking,
        share_calendar,
        document_id_profile,
        imageUrlDocument,
        display_on_staff_page,
        imageUrl
    } = req.body;

    if (!name || !roles || !email || !phone || !password || !confirm_password || !birth || !gender) {
        return next(new ErrorHandler('All fields are required.', 'fail', 400));
    }

    if (password && (password !== confirm_password)) {
        return next(new ErrorHandler('Both passwords must be equal, please type correct passwords.', 'fail', 400));
    }

    try {
        const employee = await Customer.findOne({ email });

        if (employee) {
            return res.status(409).json({
                status: 'fail',
                message: `This email: ${email} already exists. Please try using another email.`
            });
        }

        const profileEmployee = await Customer.create(req.body);

        res.status(200).json({
            status: 'success',
            message: 'Employee created successfully!',
            profileEmployee
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err}`, 'fail', 500));
    }
};

// PUT - employee update
exports.updateEmployee = async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        roles,
        email,
        phone,
        password,
        confirm_password,
        birth,
        gender,
        nationality,
        country,
        zipcode,
        address,
        city,
        location,
        p_shop,
        p_w_role,
        p_w_days,
        p_w_hours,
        bio,
        status,
        online_booking,
        share_calendar,
        document_id_profile,
        hoursOfOperation
    } = req.body;

    // console.log('HOURS OF OPERATION', hoursOfOperation);

    if (password && (password !== confirm_password)) {
        return next(new ErrorHandler('Both passwords must be equal, please type correct passwords.', 'fail', 400));
    }

    try {
        const employeeUpdated = await Customer.findById(id).select('password');

        employeeUpdated.name = name;
        employeeUpdated.email = email;
        employeeUpdated.phone = phone;
        employeeUpdated.birth = birth;
        employeeUpdated.roles = roles;
        employeeUpdated.address = address;
        employeeUpdated.city = city;
        employeeUpdated.password = password ? password : employeeUpdated.password;
        employeeUpdated.country = country;
        employeeUpdated.location = location;
        employeeUpdated.nationality = nationality;
        employeeUpdated.zipcode = zipcode;
        employeeUpdated.gender = gender;
        employeeUpdated.p_shop = p_shop;
        employeeUpdated.p_w_role = p_w_role;
        employeeUpdated.p_w_days = p_w_days;
        employeeUpdated.p_w_hours = p_w_hours;
        employeeUpdated.bio = bio;
        employeeUpdated.status = status;
        employeeUpdated.online_booking = online_booking;
        employeeUpdated.share_calendar = share_calendar;
        employeeUpdated.document_id_profile = document_id_profile;
        employeeUpdated.hoursOfOperation = hoursOfOperation;

        await employeeUpdated.save();

        res.status(200).json({
            status: 'success',
            message: 'Employee updated successfully!'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// DELETE - employee
exports.deleteEmployee = async (req, res, next) => {
    const { id } = req.params;

    try {
        await Customer.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success',
            message: 'No content to return'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// Upload image to employee
exports.uploadEmployeePhoto = async (req, res, next) => {
    const id = req.params.id;

    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const customer = await Customer.findById(id);

        // Return image ID and delete direct image direct on cloudinary
        if (customer.imageUrl) {
            const publicId = customer.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                await Customer.findOneAndUpdate({ _id: id }, {
                    imageUrl: result.url
                });

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// Upload new image to employee
exports.uploadNewEmployeePhoto = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// STORES
// GET - all stores
exports.getAllStores = async (req, res, next) => {
    try {
        const stores = await Store.find({});

        // console.log(stores);

        res.status(200).json({
            status: 'success',
            data: {
                stores
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// GET - one store
exports.getStoreDetail = async (req, res, next) => {
    const { id } = req.params;

    try {
        const store = await Store.findById(id);

        if (!store) {
            return next(new ErrorHandler('Store not found', 'fail', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                store
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// POST - create new store
exports.createNewStore = async (req, res, next) => {
    const {
        address,
        city,
        comments,
        country,
        days_open,
        email,
        name,
        phone,
        state,
        whatsapp,
        zipcode,
        imageUrl
    } = req.body;

    if (!address || !city || !comments || !country || !days_open || !email || !name || !phone || !state || !zipcode) {
        return next(new ErrorHandler('All fields are required', 'fail', 400));
    }

    try {
        const emailExists = await Store.findOne({ email });

        if (emailExists) {
            return next(new ErrorHandler('This email already exists on our system, please try registering with another one.', 'fail', 409));
        }

        const store = await Store.create({
            address,
            city,
            comments,
            country,
            days_open,
            email,
            name,
            phone,
            state,
            whatsapp,
            zipcode,
            imageUrl
        });

        res.status(200).json({
            status: 'success',
            data: {
                store
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// DELETE - one store
exports.deleteOneStore = async (req, res, next) => {
    const { id } = req.body;

    try {
        await Store.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// UPDATE - update a specific store
exports.updateStore = async (req, res, next) => {
    const { id } = req.params;
    const {
        address,
        city,
        comments,
        country,
        days_open,
        email,
        name,
        phone,
        state,
        whatsapp,
        zipcode
    } = req.body;

    try {
        const store = await Store.findByIdAndUpdate(id, {
            address,
            city,
            comments,
            country,
            days_open,
            email,
            name,
            phone,
            state,
            whatsapp,
            zipcode
        }, { new: true });

        res.status(200).json({
            status: 'success',
            data: {
                store
            }
        });
    } catch (err) {
        let errorMessage = err.message;

        const match = errorMessage.match('E11000 duplicate key error collection');

        const duplicateKeyError = match ? match[0] : errorMessage;

        return next(new ErrorHandler(`${duplicateKeyError}`, 'fail', 500));
    }
};

// Upload image to store
exports.uploadStorePhoto = async (req, res, next) => {
    const id = req.params.id;

    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const store = await Store.findById(id);

        // Return image ID and delete direct image direct on cloudinary
        if (store.imageUrl) {
            const publicId = store.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                await Store.findByIdAndUpdate(id, {
                    imageUrl: result.url
                });

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// New upload store file - This just creates and uploads a file to the store
exports.uploadStoreNewPhotoCustom = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// SERVICES
// GET - all services
exports.getAllServices = async (req, res, next) => {
    try {
        const services = await Service.find({});

        res.status(200).json({
            status: 'success',
            data: {
                services
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`${err}`, 'fail', 500));
    }
};

// GET - service detail
exports.getServiceDetail = async (req, res, next) => {
    const { id } = req.params;

    try {
        const service = await Service.findById(id);

        if (!service) {
            return next(new ErrorHandler('Service not found', 'fail', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                service
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`${err}`, 'fail', 500));
    }
};

// POST - create new service
exports.createNewService = async (req, res, next) => {
    const {
        name,
        category,
        description,
        resources,
        b_cost,
        tax,
        serviceInfo
    } = req.body;

    if (!name || !category) {
        return next(new ErrorHandler('All fields are required', 'fail', 400));
    }

    try {
        const serviceExists = await Service.findOne({ name });

        if (serviceExists) {
            return next(new ErrorHandler('This service already exists, please create a new one with another name.', 'fail', 409));
        }

        const service = await Service.create({
            name,
            category,
            description,
            resources,
            b_cost,
            tax,
            serviceInfo
        });

        res.status(200).json({
            status: 'success',
            data: {
                service
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// UPDATE - update a specific service
exports.updateService = async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        category,
        description,
        resources,
        b_cost,
        tax,
        serviceInfo
    } = req.body;

    try {
        const service = await Service.findByIdAndUpdate(id, {
            name,
            category,
            description,
            resources,
            b_cost,
            tax,
            serviceInfo
        }, { new: true });

        res.status(200).json({
            status: 'success',
            message: 'Service updated successfully!',
            data: {
                service
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// Upload image to service
exports.uploadServicePhoto = async (req, res, next) => {
    const id = req.params.id;

    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const service = await Service.findById(id);

        // Return image ID and delete direct image direct on cloudinary
        if (service.imageUrl) {
            const publicId = service.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                await Service.findByIdAndUpdate(id, {
                    imageUrl: result.url
                });

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// SERVICE - CATEGORY
// POST - create new service category
exports.serviceCategoryNew = async (req, res, next) => {
    const { name, description, categoryOption } = req.body;

    try {
        const serviceCategory = await Category.create({
            name,
            description,
            categoryOption
        });

        res.status(200).json({
            status: 'success',
            data: {
                serviceCategory
            }
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// DELETE - delete complete service category
exports.deleteServiceCategory = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorHandler('This action could not be carried out.', 'fail', 500));
    }

    try {
        await Category.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// DELETE - delete category option chunk item
exports.deleteCategoryOptionChunkItem = async (req, res, next) => {
    const { id_category_option } = req.params;
    const position = req.body.index;
    const categoryId = req.body.id;

    try {
        const updateResult = await Category.updateOne({ _id: categoryId }, { $unset: { [`categoryOption.${position}`]: 1 } });

        // Para remover o elemento null resultante, use $pull com null
        await Category.updateOne({ _id: categoryId }, { $pull: { categoryOption: null } });

        if (updateResult.modifiedCount === 0) {
            return next(new ErrorHandler('No item found to delete', 'fail', 404));
        }

        res.status(200).json({
            status: 'success'
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// UPDATE - admin schedule dashboard
exports.updateAdminScheduleDashboard = async (req, res, next) => {
    const { id } = req.params;
    const { store, artist, categories } = req.body;

    console.log(categories);

    try {
        // const updateFields = { store, artist };

        // if (categories && Array.isArray(categories)) {
        //     updateFields.categories = categories.map(category => {
        //         const key = Object.keys(category)[0]; 
        //         const value = category[key]; 
        //         return { [key]: value }; 
        //     });
        // }

        const bookUpdateSchedule = await Book.findOneAndUpdate(
            { _id: id },
            { 
                store: store,  
                artist: artist,
                categories: [categories]
            },
            { new: true }
        );

        // console.log('STORE ==> ', store);
        // console.log('ARTIST ==> ', artist);
        // console.log('CATEGORIES ==> ', updateFields.categories);
        // console.log(bookUpdateSchedule);

        return res.status(200).json({
            status: 'success',
            message: 'Updated successfully!',
            updatedData: bookUpdateSchedule
        });
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

exports.getOneStyleCategory = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Busca todas as categorias
        const categories = await Category.find();

        // Varre cada categoria para encontrar o `categoryOption` que tem o ID correspondente
        let foundOption = null;
        let foundCategory = null;

        for (const category of categories) {
            const option = category.categoryOption.find(opt => opt._id.toString() === id);
            if (option) {
                foundOption = option;
                foundCategory = category;
                break; // Para o loop assim que encontrar
            }
        }

        if (!foundOption) {
            return res.status(404).json({ status: 'fail', message: 'Estilo não encontrado' });
        }

        res.status(200).json({
            status: 'success',
            category: foundCategory.name, // Retorna também a categoria onde foi encontrado
            option: foundOption
        });

    } catch (err) {
        return next(new ErrorHandler(`Something went wrong: ${err.message}`, 'fail', 500));
    }
};



// Atualiza um estilo dentro de `categoryOption`
exports.updateStyleCategory = async (req, res, next) => {
    const { optionTitle, id } = req.body;

    try {
        // Busca todas as categorias
        const categories = await Category.find();

        console.log(optionTitle);
        console.log(id);

        let foundCategory = null;
        let foundOptionIndex = -1;

        // Percorre cada categoria para encontrar o `categoryOption` correto
        for (const category of categories) {
            const index = category.categoryOption.findIndex(opt => opt._id.toString() === id);
            if (index !== -1) {
                foundCategory = category;
                foundOptionIndex = index;
                break; // Para o loop assim que encontrar
            }
        }

        // Se não encontrou, retorna erro
        if (!foundCategory) {
            return res.status(404).json({ status: 'fail', message: 'Estilo não encontrado' });
        }

        const foundOption = foundCategory.categoryOption[foundOptionIndex];

        // Atualiza o título se foi enviado
        if (optionTitle) {
            foundOption.optionTitle = optionTitle;
        }

        // Se não houver imagem nova, salva apenas o título atualizado
        await foundCategory.save();

        res.status(200).json({
            status: 'success',
            message: 'Estilo atualizado com sucesso!',
            option: foundOption
        });
    } catch (err) {
        return next(new ErrorHandler(`Erro ao atualizar estilo: ${err.message}`, 'fail', 500));
    }
};


// update style photo and field 
exports.updateStyleImage = async (req, res, next) => {
    const { id } = req.body; // Pegamos o ID do estilo

    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'Nenhuma imagem enviada' });
    }

    try {
        // Encontrar a categoria e a opção correta
        const categories = await Category.find();
        let foundCategory = null;
        let foundOptionIndex = -1;

        for (const category of categories) {
            const index = category.categoryOption.findIndex(opt => opt._id.toString() === id);
            if (index !== -1) {
                foundCategory = category;
                foundOptionIndex = index;
                break;
            }
        }

        if (!foundCategory) {
            return res.status(404).json({ status: 'fail', message: 'Estilo não encontrado' });
        }

        const foundOption = foundCategory.categoryOption[foundOptionIndex];

        // Excluir a imagem anterior do Cloudinary (se existir)
        if (foundOption.optionImage) {
            const publicId = foundOption.optionImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // **UPLOAD PARA O CLOUDINARY**
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "styles_category", // Opcional: colocar as imagens dentro de uma pasta no Cloudinary
            use_filename: true,
            unique_filename: false,
        });

        // Atualiza a URL da imagem no banco de dados
        foundOption.optionImage = result.secure_url;
        await foundCategory.save();

        // **Remover o arquivo temporário**
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            status: 'success',
            message: 'Imagem atualizada com sucesso!',
            option: foundOption
        });

    } catch (err) {
        return next(new ErrorHandler(`Erro ao atualizar imagem: ${err.message}`, 'fail', 500));
    }
};





// GET - all services categories
exports.getAllServicesCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});

        if (categories) {
            res.status(200).json({
                status: 'success',
                data: {
                    categories
                }
            });
        } else {
            return next(new ErrorHandler('No category found.', 'fail', 500));
        }
    } catch (err) {
        return next(new ErrorHandler(`Something went wrong ${err}`, 'fail', 500));
    }
};

// Upload a new photo on new category
exports.uploadNewCategoryPhoto = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    imageUrl: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, e .webp. Todos os outros tipos de arquivo não são permitidos.', 'fail', 400));
    }
};

// Update existing image file to admin - service - category
exports.uploadImageUpdateCategory = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded.');
    }

    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const category = await Category.findById(req.body.id);
        const categoryPosition = category?.categoryOption[req.body.position];

        // Obtendo a URL antiga
        const oldImageCategoryOptionUrl = categoryPosition?.optionImage;

        // Return image ID and delete direct image direct on cloudinary
        if (oldImageCategoryOptionUrl) {
            const publicId = oldImageCategoryOptionUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    imageUrl: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// Update artist ID DOCUMENT /admin manager
exports.uploadAdminArtistDocumentPhoto = async (req, res, next) => {
    const { id } = req.params;

    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        const customer = await Customer.findById(id);

        // Return image ID and delete direct image direct on cloudinary
        if (customer.imageUrlDocument) {
            const publicId = customer.imageUrlDocument.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                await Customer.findByIdAndUpdate(id, {
                    imageUrlDocument: result.url
                });

                res.status(200).json({
                    status: 'success',
                    result: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};

// Upload a new photo on new category
exports.uploadNewEmployeePhotoCreate = async (req, res, next) => {
    const allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'gif'];

    const filesType = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (allowedExtensions.includes(filesType)) {
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    return next(new ErrorHandler(`Upload fail ${err.message}`, 'fail', 400));
                }

                res.status(200).json({
                    status: 'success',
                    imageUrl: result.url
                });
            });
        } else {
            return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
        }
    } catch (err) {
        return next(new ErrorHandler('We only accept the following file types: .jpg, .png, .jpeg, .gif, and .webp. All other file types are not allowed', 'fail', 400));
    }
};
