const otpService = require('../services/otp-service')
const hashService = require('../services/hash-service')
const userService = require('../services/user-service')
const tokenService = require('../services/token-service')
const UserDto = require('../dtos/user-dto')
const sendOtp = async (req, res) => {

    const { phone } = req.body

    if (!phone) {
        return res.status(400).json({ message: "Phone is required!" })
    }

    const otp = await otpService.generateOtp();

    // Hash
    const ttl = 1000 * 60 * 5
    const expires = Date.now() + ttl
    const data = `${phone}.${otp}.${expires}`

    const hash = hashService.hashOtp(data)

    // send OTP
    try {
        await otpService.sendOtp(phone,otp)
        return res.json({
            hash: `${hash}.${expires}`,
            phone,
            // otp,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "message sending failed!" })
    }

}

const verifyOtp = async (req, res) => {
    const { otp, hash, phone } = req.body

    if (!otp || !hash || !phone) {
        return res.status(400).json({ message: "All fields are required!" })
    }
    const [hashedOtp, expires] = hash.split('.')

    if (Date.now() > +expires) {
        return res.status(400).json({ message: "OTP expired!" })
    }

    const data = `${phone}.${otp}.${expires}`

    const isValid = otpService.verifyOtp(hashedOtp, data)
    if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP!" })
    }

    let user

    try {
        user = await userService.findUser({
            phone
        })
        if (!user) {
            user = await userService.createUser({
                phone,
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "DB error" })
    }

    // Token
    const { accessToken, refreshToken } = await tokenService.generateTokens({
        _id: user._id,
        activated: false,
    })

    await tokenService.storeRefreshToken(refreshToken, user._id)

    res.cookie('refreshtoken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    })
    res.cookie('accesstoken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    })
    const userDto = new UserDto(user);
    return res.json({ user: userDto, auth: true })

}

const refreshToken = async (req, res) => {
    // refresh token from cookie
    const { refreshtoken: refreshTokenFromCookie } = req.cookies

    let userData;
    try {
        // verifying refresh token using jwt
        userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie)
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" })
    }
    try {
        const token = await tokenService.findRefreshToken(userData._id, refreshTokenFromCookie)
        if (!token) {
            return res.status(401).json({ message: "Invalid refresh token" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }

    const user = await userService.findUser({ _id: userData._id })
    if (!user) {
        return res.status(404).json({ message: "No user found" })
    }

    // generate new tokens
    const { refreshToken, accessToken } = await tokenService.generateTokens({ _id: userData._id })

    // update  refresh token
    try {
        await tokenService.updateRefreshToken(userData._id, refreshToken)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }

    res.cookie('refreshtoken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    })
    res.cookie('accesstoken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    })
    const userDto = new UserDto(user);
    return res.json({ user: userDto, auth: true })


}

const logout = async (req, res) => {
    // delete refresh token from db
    const {refreshtoken} = req.cookies
    await tokenService.removeToken(refreshtoken)
    // delete cookies
    res.clearCookie('refreshtoken')
    res.clearCookie('accesstoken')
    res.json({ user: null, auth: false })
}

module.exports = {
    sendOtp,
    verifyOtp,
    refreshToken,
    logout
}