const express            = require('express');
const router             = express.Router();
const authMiddleware     = require('../middlewares/auth');
const authController     = require('../controller/auth.controller');
const adminController    = require('../controller/admin.controller');
const upload             = require('../middlewares/multer')

// GET - customer(s)
router.get('/admin/dashboard/customers', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getCustomers);
router.get('/admin/dashboard/customers/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getCustomer);
router.get('/admin/dashboard/customers/health/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getHealthCustomer);

// PUT - customer 
router.patch('/admin/dashboard/customers/update/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.updateCustomer);
router.post('/admin/dashboard/customers/create/new', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.createNewCustomerAdminDashboard);
router.post('/admin/dashboard/employee/post/photo/upload', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrlDocument'), adminController.uploadNewCustomerAdminDashboardCustomer);
router.patch('/admin/dashboard/employee/post/update/photo/upload/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrlDocument'), adminController.uploadUpdateCustomerAdminDashboardCustomer);



// ----------------------------------------------------------------------------------------------------------------------------------------------------------------

// GET - employee(s)
router.get('/admin/dashboard/employees', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), adminController.getAllEmployees);
router.get('/admin/dashboard/employee/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getEmployee);

// POST - employee
router.post('/admin/dashboard/employee/new', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.addNewEmployee);

// Upload employee photo 
router.post('/admin/dashboard/employee/post/photo', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrlDocument'), adminController.uploadNewEmployeePhotoCreate);

// PUT - employee
router.patch('/admin/dashboard/employee/update/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.updateEmployee);


// PATCH - Employee
router.patch('/admin/dashboard/employee/upload/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrl'), adminController.uploadEmployeePhoto);

// PATCH - New Employee
router.patch('/admin/dashboard/employee/upload', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrl'), adminController.uploadNewEmployeePhoto);

router.patch('/admin/employee/upload/document/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner','user','artist'), upload.single('imageUrlDocument'), adminController.uploadAdminArtistDocumentPhoto);

router.delete('/admin/dashboard/employee/delete/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.deleteEmployee);


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
// GET - Stores
router.get('/admin/dashboard/stores', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), adminController.getAllStores);

router.get('/admin/dashboard/stores/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getStoreDetail);

// POST - store
router.post('/admin/dashboard/stores/new', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.createNewStore);

// POST - store
router.put('/admin/dashboard/stores/update/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.updateStore);

router.patch('/admin/dashboard/stores/upload/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrl'), adminController.uploadStorePhoto);

router.post('/admin/dashboard/stores/upload/new/file', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), upload.single('imageUrl'), adminController.uploadStoreNewPhotoCustom);


router.delete('/admin/dashboard/stores/delete/one', authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.deleteOneStore);


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
// GET - Services
router.get('/admin/dashboard/services', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getAllServices);

// GET - Service detail
router.get('/admin/dashboard/services/detail/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.getServiceDetail);

// POST - Services
router.post('/admin/dashboard/services/new', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.createNewService);

// PUT - Services
router.put('/admin/dashboard/services/update/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.updateService);

// PATCH 
router.patch('/admin/dashboard/services/upload/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), upload.single('imageUrl'), adminController.uploadServicePhoto);

// POST - Category - Services - create
router.post('/admin/dashboard/services/category/new', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.serviceCategoryNew);

// POST - Upload - Services - Category
router.post('/admin/dashboard/services/category/new/upload', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'),  upload.single('imageUrl'), adminController.uploadNewCategoryPhoto);

router.post('/admin/dashboard/services/category/update/upload', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'),  upload.single('imageUrl'), adminController.uploadImageUpdateCategory);

router.delete('/admin/dashboard/services/category/delete/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.deleteServiceCategory);

router.delete('/admin/dashboard/services/category/delete/chunk/:id_category_option', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), adminController.deleteCategoryOptionChunkItem);

router.get('/admin/dashboard/services/categories', authMiddleware.isAuthenticated, authMiddleware.permission('admin','user','artist','owner'), adminController.getAllServicesCategories);


// get one register style
router.get('/admin/dashboard/styles/categories/:id',authMiddleware.isAuthenticated, authMiddleware.permission('admin','owner'), adminController.getOneStyleCategory);

// update register style 
router.patch('/admin/dashboard/styles/categories/update', authMiddleware.isAuthenticated, authMiddleware.permission('owner','admin'), adminController.updateStyleCategory);

// update only image style 
router.patch('/admin/dashboard/styles/categories/update/image', authMiddleware.isAuthenticated, authMiddleware.permission('owner', 'admin'), upload.single('image'), adminController.updateStyleImage);

// --------------------------------------------------------------------------------------------------------------------------
// SCHEDULE 


router.patch('/admin/dashboard/update/schedule/custom/:id', authMiddleware.isAuthenticated, authMiddleware.permission('admin','artist','owner'), upload.single('file'), adminController.updateAdminScheduleDashboard);

module.exports = router;