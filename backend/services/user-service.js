const User = require('../model/user-model')

const findUser = async (filter) => {
    const user = await User.findOne(filter)
    return user
}

const createUser = async (data) => {
    const user = await User.create(data)
    return user
}

module.exports = {
    findUser,
    createUser
}