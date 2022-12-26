const router = require('express').Router();
const authController = require('../controllers/auth-controllers');
const activateController = require('../controllers/activate-controllers');
const roomsController = require('../controllers/rooms-controllers')
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/send-otp', authController.sendOtp)
router.post('/verify-otp',authController.verifyOtp)
router.post('/activate',authMiddleware, activateController.activate)
router.get('/refresh', authController.refreshToken)
router.post('/logout', authMiddleware, authController.logout)
router.post('/rooms', authMiddleware, roomsController.create)
module.exports = router;