const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { listMyNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');

router.use(requireAuth);
router.get('/', listMyNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
