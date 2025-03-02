const express            = require('express');
const router             = express.Router();
const bookNowController  = require('../controller/book.now.controller');
const authMiddleware     = require('../middlewares/auth');
const upload             = require('../middlewares/multer');

// List all Google Calendar
router.post('/book-now/google/calendar', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','owner'), bookNowController.getGoogleCalendar);

// Create filters and category
router.post('/book-now/admin/dashboard/filters', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.postFilter);
router.post('/book-now/admin/dashboard/filters/category', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.postCategory);

// Edit filter and category
router.patch('/book-now/admin/dashboard/filters/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.updateFilter);
router.put('/book-now/admin/dashboard/filters/category/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.updateCategory);

// GET filters and categories
router.get('/book-now/admin/dashboard/filters', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), bookNowController.getFilter);
router.get('/book-now/admin/dashboard/filters/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), bookNowController.getFilterDetail);
router.get('/book-now/admin/dashboard/filters/category', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), bookNowController.getCategory);
router.get('/book-now/admin/dashboard/filters/category/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), bookNowController.getCategoryDetail);

// DELETE filter 
router.delete('/book-now/admin/dashboard/filters/delete/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.deleteFilterItem);


// CUSTOMER BOOK NOW 


// authMiddleware.isAuthenticated, authMiddleware.permission('admin')

// POST/ Create 
router.post('/book-now/customer/dashboard/create',authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.bookCreate);

// GET/ All and one 
router.get('/book-now/customer/dashboard/all/books',authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','owner','artist'), bookNowController.getAllBooks);
router.get('/book-now/customer/dashboard/one/book',authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getOneBook);

router.get('/book-now/customer/dashboard/one/book/schedule/checkin/:id',authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.getOneBookSchedule);



// No seu arquivo de rotas
router.post('/book-now/customer/dashboard/post/photos', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist'), upload.array('images', 5), bookNowController.uploadReferenceImagesBookNow);

router.post('/book-now/customer/dashboard/payment', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.bookPaymentStripe);


router.get('/book-now/customer/dashboard/filtered/books', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getFilteredBooks);

router.get('/book-now/customer/dashboard/schedules/customers', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist','admin','owner'), bookNowController.allSchedulesCustomer);

router.delete('/book-now/dashboard/schedules/delete/marked/booked/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), bookNowController.deleteOneBookedSchedule);

router.post('/book-now/dashboard/schedules/clean/marked/booked', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.clearAppointmentFields);


router.delete('/book-now/customer/dashboard/customers/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), bookNowController.deleteCustomerAdminCombined);

// GET Store by name 
router.post('/book-now/customer/dashboard/store/by/name', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getStoreByName);


router.post('/book-now/customer/dashboard/artist/by/name', bookNowController.getArtistByNameCustom);


router.get('/book-now/customer/dashboard/checkout/customer/:id', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist'), bookNowController.checkoutBooked);


router.patch('/book-now/customer/dashboard/checkout/update/customer/:id', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist'), bookNowController.checkoutUpdateField);


router.patch('/book-now/customer/dashboard/finish/checkout/:id', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.finishCustomerCheckout);


router.patch('/artist/customer/checkin/customer/:id/checkin-approved', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), upload.any(), bookNowController.updateCheckinApproved);

// Checkout update - continue tattoo
router.patch('/artist/customer/checkout/continue/tattoo', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), upload.any(), bookNowController.checkoutArtistContinueTattoo);

router.patch('/customer/continue/tattoo/book-now/permission', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.permissionToContinueTattoo);


// ARTIST - All customer belongs to artist
router.get('/book-now/artist/dashboard/checkout/all/customers', authMiddleware.isAuthenticated, authMiddleware.permission('artist','admin','owner'), bookNowController.allArtistCustomerCheckout);
router.post('/book-now/artist/dashboard/checkout/send/email/customers',authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.checkoutArtistSendEmailCustomer)
router.patch('/book-now/artist/dashboard/checkout/send/photo/tattoo', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), upload.single('imageUrlCheckoutProgress'), bookNowController.uploadUpdateCustomerArtistDashboardCheckout);

router.get('/artist/customer/find/one/customer/custom/:id',authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.artistFindCustomer);

// ADMIN
router.get('/admin/book-now/dashboard/profile/info/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.getCustomerBooked);
router.get('/admin/book-now/dashboard/profile/all/info/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.getAllBookedCustomer);

// ADMIN --> Schedule 
router.get('/admin/book-now/dashboard/schedule/info/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), bookNowController.getScheduleBooked);

router.get('/admin/book-now/dashboard/filter/store/schedule/info/:store', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), bookNowController.getFilterByStoreBookedSchedule);

router.patch('/admin/book-now/dashboard/filter/update/schedule/info/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), bookNowController.updateScheduleCustomerAdmin);

router.patch('/admin/book-now/dashboard/roles/reverse', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), bookNowController.reverseUserRoles);



// RATINGS CUSTOMER TO ARTIST - ARTIST TO CUSTOMER
router.patch('/artist/customer/ratings/both/in/two/side', authMiddleware.isAuthenticated, authMiddleware.permission('artist','user'), bookNowController.ratingsCustomerAndArtist);
router.patch('/artist/customer/finish/with/out/link/custom', authMiddleware.isAuthenticated, authMiddleware.permission('artist','user'), bookNowController.finishArtistCheckout);

router.patch('/me/customer/arrival/notification/dashboard', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.arrivalNotificationStatus);

router.patch('/me/customer/checkout/customer/final-tattoo/:id', authMiddleware.isAuthenticated, authMiddleware.permission('user'), upload.any(), bookNowController.uploadCustomerFinalTattooCheckout);


// GET APPOINTMENT NUMBER

router.post('/book-now/customer/appointment/number/back', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getAppointmentNumber);
router.patch('/book-now/customer/appointment/number/continue/update', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.updateAppointmentNumber);
router.get('/book-now/customer/appointment/continue/tattoo/choose',authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getAppointmentsNumberContinueTattoo);

// GOOGLE CALENDAR 
// Available day - book day in time 
router.get('/book-now/customer/dashboard/fetch-all/times/calendar', bookNowController.availableTimeGoogleCalendar);
router.post('/book-now/customer/dashboard/appointment/calendar', bookNowController.appointmentTimesGoogleCalendar);


// Fetch one booded cancelled tattoo or finished
router.get('/fetch/finished/and/cancelled/tattoo/:id', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.getOneBookeFinishedTattoo);

// Update bookeed cancelled tattoo or finished
router.patch('/update/finished/and/cancelled/tattoo', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.restoreAppointmentCancelledTattoo);


router.patch('/update/artist/checkin/stage/one/tattoo', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.updateArtistCheckiValuesToCustomer);


router.patch('/update/artist/checkin/images/reference', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.saveReferecenArtistImagesToCustomer);

router.get('/get/all/customers/and/appointments/customer', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.getCustomerAppointments);


// Send message to customer to finish checkin
router.post('/send/notification/to/customer/for/checkin', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.askToCustomerToCheckin);


// sorted checkin/checkout ARTIST 
router.get('/get/all/booking/customers/artist/checkout/custom', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.artistCheckoutFilterAndSort);
router.get('/get/all/booking/customers/artist/checkin/custom', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.artistCheckinFilterAndSort);
router.get('/get/all/artist/schedules/from/customers', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.sortedItemsTableScheduleArtist);


// REBOOK
router.post('/book-now/customer/rebook/appointment', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.rebookAppointment);

// Create a new appointment based on continue tattoo
// Record the appointment reference number to history
// Use the old appointment to create a new appointment based on old tattoo to continue
router.post('/book-now/customer/create/new/tatto/based/on/referenced/continue/tattoo', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.createNewAppointmentContinueTattoo);

router.get('/registry/booking/history/customer/list/all', authMiddleware.isAuthenticated, authMiddleware.permission('owner'),  bookNowController.showHistoryContinueTattoos);

router.patch('/artist/checkin/customer/update/fields/to/edit', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.artistCheckinUpdateFields);


// update fields base on booknow
router.patch('/update/fields/book-now/contents', authMiddleware.isAuthenticated, authMiddleware.permission('user'), bookNowController.editSectionBooknowFields);
router.patch('/update/fields/artist/checkout/contents', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), bookNowController.editSectionCheckoutArtistFields);


module.exports = router;