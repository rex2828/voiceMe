const jwt = require('jsonwebtoken')
const refreshModel = require('../model/refresh-model')

const generateTokens = async (payload) => {
    const accessToken =  jwt.sign(payload,process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: '1min'
    })
    const refreshToken =  jwt.sign(payload,process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '1y'
    })
    return {accessToken,refreshToken}
}

const storeRefreshToken = async (token, userId) => {
    try {
        await refreshModel.create({
            token,
            userId,
        })
    } catch (error) {
        console.log(error.message)
    }
}

const verifyAccessToken = async (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
}

const verifyRefreshToken = async (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
}

const findRefreshToken = async (userId, refreshToken) => {
    return await refreshModel.findOne({userId, token: refreshToken})
}

const updateRefreshToken = async (userId, refreshToken) => {
    return await refreshModel.updateOne({ userId: userId }, { token: refreshToken})
}

const removeToken = async (refreshToken) => {
    return await refreshModel.deleteOne({ token: refreshToken })
}

module.exports = {
    generateTokens,
    storeRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    findRefreshToken,
    updateRefreshToken,
    removeToken,
}