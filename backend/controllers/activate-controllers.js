const path = require('path')
const userService = require('../services/user-service')
const UserDto = require('../dtos/user-dto')
const Jimp = require('jimp')
const activate = async (req, res) => {

    const { name, avatar } = req.body

    if (!name || !avatar) {
        res.status(400).json({ message: "All fields are required" })
    }

    const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
    const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`

    try {
        const image = await Jimp.read(buffer)
        await image.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`))
    } catch (error) {
        return res.status(500).json({ message: "Could not process the image" })
    }

    try {
        const userId = req.user._id

        const user = await userService.findUser({ _id: userId })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.name = name
        user.activated = true
        user.avatar = `/storage/${imagePath}`
        user.save()
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }

}

module.exports = {
    activate,
}