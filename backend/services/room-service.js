const roomModel = require("../model/room-model");

const create = async (payload) => {
    const {topic, roomType, ownerId} = payload;
    const room = await roomModel.create({
        topic,
        roomType,
        ownerId,
        speakers: [ownerId],
    });
    return room;
}

const getAllRooms = async (types) => {
    const rooms = roomModel.find({
        roomType: {$in : types},
    }).populate('speakers').populate('ownerId').exec()
    return rooms;
}

const getOneRoom = async (roomId) => {
    const room = await roomModel.findOne({ _id : roomId })
    return room;
}

module.exports = {
    create,
    getAllRooms,
    getOneRoom,
}