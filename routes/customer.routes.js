const express            = require('express');
const router             = express.Router();
const customerController = require('../controller/customer.controller'); 
const authMiddleware     = require('../middlewares/auth');
const authController     = require('../controller/auth.controller');
const upload             = require('../middlewares/multer');

// Auth 
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Customers
router.get('/me', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'),customerController.getMe);

router.get('/all/customer/artist/admin/data',authMiddleware.isAuthenticated, authMiddleware.permission('user','artist'),customerController.getCustomersArtistCustom);

// Logout
router.get('/logout', authController.logout);


// Update user 
router.patch('/me/update',authMiddleware.isAuthenticated, authMiddleware.permission('user','artist','admin','owner'), customerController.updateUserProfile);


router.patch('/me/customer/send/notification/artist/dashboard/custom', authMiddleware.isAuthenticated, authMiddleware.permission('artist','user','owner','admin'), customerController.updateSendNotification);
router.patch('/me/customer/mark/notification/artist/dashboard/custom', authMiddleware.isAuthenticated, authMiddleware.permission('artist','user','owner','admin'), customerController.markAllNotificationsAsVisible);


router.patch('/visible/to/all/notifications/visited/before', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), customerController.markAllNotificationsAsVisibleAdminToOnwer);


// Forgot password token 
router.post('/forgotPassword', authController.forgotPassword);


// Reset password
router.put('/reset/password/:token', authController.resetPassword);


// Health 
// GET
router.get('/me/health', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','owner'), customerController.getHealth);

// artist to customer health access 
router.get('/me/artist/health/:id', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), customerController.getCustomerHealthForArtist);


// PUT
router.put('/me/health/update', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','owner'), customerController.updateHealth);


// ADMIN 

// Create new Artist
router.post('/me/artist/admin', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), customerController.createNewArtist);


// Artist Sign 
router.get('/health/sign/artist/:id', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), customerController.getCustomerArtistSign);

// Sign
router.post('/health/sign', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist','owner'), customerController.createSign);
router.get('/health/sign', authMiddleware.isAuthenticated, authMiddleware.permission('admin', 'user','artist','owner'), customerController.getSign);
router.get('/health/sign/customer/admin/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), customerController.getOneCustomerSignAdmin);
router.get('/health/sign-all', authMiddleware.isAuthenticated, authMiddleware.permission('admin', 'user','artist','owner'), customerController.getAllSign);

router.patch('/upload', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'), upload.single('imageUrl'), customerController.uploadProfilePhoto);
router.patch('/upload/document', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'), upload.single('imageUrlDocument'), customerController.uploadProfilePhotoDocument);


router.get('/get/on/artist/profile/by/id/content/:id', customerController.getArtistProfileById);

// CUSTOMERS

// Customer - Checkin 
router.post('/checkin/create', authMiddleware.isAuthenticated, authMiddleware.permission('user'), customerController.checkin);
router.get('/checkin/all', authMiddleware.isAuthenticated, authMiddleware.permission('user'), customerController.getCheckin);

// Customer - setting 
// GET
router.get('/settings/all', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'), customerController.getAllSettings);
router.get('/settings/specific/info/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), customerController.getSpecificSettingInfo);



// SOCKET POST IO
router.post('/checkout/socketio/payment/confirm/pass', authMiddleware.isAuthenticated, authMiddleware.permission('user'), customerController.confirmPaymentChekoutDone);
router.post('/checkout/socketio/payment/confirm/pass/artist', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), customerController.confirmPaymentChekoutDoneArtist);


// GET - All notifications
router.get('/all/notifications/artist', authMiddleware.isAuthenticated, authMiddleware.permission('artist','admin','owner'), customerController.getAllNotification);

// GET - all notification only for admin and owner
router.get('/get/all/notification/to/admin/and/owner/all', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), customerController.getAllNotificationsToAdminAndOwner);


router.get('/me/artist/all/customers/appointment/cancelled', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), customerController.getAllCustomerFinishedAppointment);
router.get('/me/artist/all/progress/continue/tattoos', authMiddleware.isAuthenticated, authMiddleware.permission('artist'), customerController.getAllProgressContinueTattoos);


router.get('/all/artist/roles/show/in', customerController.getAllArtistOnly);

// POST
router.post('/settings', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'), customerController.settings);
router.post('/deleted/customer/account', authMiddleware.isAuthenticated, authMiddleware.permission('user','artist','admin','owner'), customerController.deleteAccount);
router.post('/me/customer/recover/dashboard/password', authMiddleware.isAuthenticated, authMiddleware.permission('user','admin','artist','owner'), authController.resetCustomerDashboardPassword);



module.exports = router;