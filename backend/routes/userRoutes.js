const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadAvatar, removeAvatar, updateProfile, changePassword, listAddresses, createAddress, deleteAddress,
} = require('../controllers/userController');

router.use(requireAuth);
router.patch('/me', updateProfile);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/me/avatar', removeAvatar);
router.post('/me/password', changePassword);
router.get('/me/addresses', listAddresses);
router.post('/me/addresses', createAddress);
router.delete('/me/addresses/:id', deleteAddress);

module.exports = router;
