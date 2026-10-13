const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const {
  listAllProducts, createProduct, updateProduct, deleteProduct, updateStock, bulkUpdate,
} = require('../controllers/admin/adminProductController');
const { listOrders, getOrder, updateOrderStatus } = require('../controllers/admin/adminOrderController');
const { listUsers, getUser, changeUserRole, setUserActive, deleteUser } = require('../controllers/admin/adminUserController');
const { listCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/admin/adminCouponController');
const { getOverview, getCharts, getInventory } = require('../controllers/admin/adminAnalyticsController');
const { listAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/admin/adminCategoryController');
const { listAllCollections, createCollection, updateCollection, deleteCollection } = require('../controllers/admin/adminCollectionController');
const { listAllArticles, createArticle, updateArticle, setArticleStatus, deleteArticle } = require('../controllers/admin/adminJournalController');
const { listAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/admin/adminTestimonialController');
const { listAllReviews, setReviewStatus, deleteReview } = require('../controllers/admin/adminReviewController');
const { listAdminNotifications, markAdminNotificationRead, markAllAdminRead } = require('../controllers/admin/adminNotificationController');
const { listActivityLog } = require('../controllers/admin/adminActivityLogController');
const { getSettings, updateSettings } = require('../controllers/admin/adminSettingsController');
const { getAdminProfile, updateAdminProfile, removeAdminAvatar, changeAdminPassword, uploadAdminAvatar } = require('../controllers/admin/adminProfileController');
const { globalSearch } = require('../controllers/admin/adminSearchController');
const upload = require('../middleware/upload');
const {
  uploadProductImages, addProductImagesByUrl, deleteProductImage, reorderProductImages, setPrimaryImage,
} = require('../controllers/admin/adminImageController');
const { listMessages, setMessageStatus, deleteMessage } = require('../controllers/admin/adminMessageController');

// Every route below requires a signed-in admin.
router.use(requireAuth, requireAdmin);

// Products
router.get('/products', listAllProducts);
router.post('/products', createProduct);
router.post('/products/bulk', bulkUpdate);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);

// Product image manager (real upload via Cloudinary, plus direct-URL images)
router.post('/products/:id/images', upload.array('images', 50), uploadProductImages);
router.post('/products/:id/images/url', addProductImagesByUrl);
router.delete('/products/:id/images/:imageId', deleteProductImage);
router.patch('/products/:id/images/reorder', reorderProductImages);
router.patch('/products/:id/images/:imageId/primary', setPrimaryImage);

// Categories
router.get('/categories', listAllCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Collections
router.get('/collections', listAllCollections);
router.post('/collections', createCollection);
router.patch('/collections/:id', updateCollection);
router.delete('/collections/:id', deleteCollection);

// Orders
router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Users / Customers
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/status', setUserActive);
router.delete('/users/:id', deleteUser);

// Coupons
router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews
router.get('/reviews', listAllReviews);
router.patch('/reviews/:id/status', setReviewStatus);
router.delete('/reviews/:id', deleteReview);

// Journal CMS
router.get('/journal', listAllArticles);
router.post('/journal', createArticle);
router.patch('/journal/:id', updateArticle);
router.patch('/journal/:id/status', setArticleStatus);
router.delete('/journal/:id', deleteArticle);

// Testimonials
router.get('/testimonials', listAllTestimonials);
router.post('/testimonials', createTestimonial);
router.patch('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Analytics + inventory
router.get('/analytics/overview', getOverview);
router.get('/analytics/charts', getCharts);
router.get('/inventory', getInventory);

// Notifications
router.get('/notifications', listAdminNotifications);
router.patch('/notifications/read-all', markAllAdminRead);
router.patch('/notifications/:id/read', markAdminNotificationRead);

// Activity log
router.get('/activity-log', listActivityLog);

// Settings
router.get('/settings', getSettings);
router.patch('/settings/:key', updateSettings);

// Admin profile
router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadAdminAvatar);
router.delete('/profile/avatar', removeAdminAvatar);
router.post('/profile/password', changeAdminPassword);

// Global search
router.get('/search', globalSearch);

// Messages
router.get('/messages', listMessages);
router.patch('/messages/:id/status', setMessageStatus);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
