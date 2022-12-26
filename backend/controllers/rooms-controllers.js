const RoomDto = require('../dtos/room-dto');
const roomService = require('../services/room-service')

const create = async (req, res) => {
    const {topic , roomType} = req.body;
    if (!topic || !roomType) {
        return res.status(400).json({ message: "All fields are required!" })
    }

    const room = await roomService.create({topic, roomType, ownerId: req.user._id});
    return res.json(new RoomDto(room))
}

const getRooms = async (req, res) => {
    const rooms = await roomService.getAllRooms(['open'])
    const allRooms = rooms.map((room) => new RoomDto(room))
    return res.json(allRooms)
}

const getRoom = async (req, res) => {
    const room = await roomService.getOneRoom(req.params.roomId);
    return res.json(room)
}

module.exports = {
    create,
    getRooms,
    getRoom,
}