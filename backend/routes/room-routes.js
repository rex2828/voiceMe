const router = require('express').Router();
const roomsController = require('../controllers/rooms-controllers')
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/rooms', authMiddleware, roomsController.create)
router.get('/rooms', authMiddleware, roomsController.getRooms) 
router.get('/room/:roomId', authMiddleware, roomsController.getRoom) 

module.exports = router;