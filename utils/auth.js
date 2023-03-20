const jwt = require('jsonwebtoken');

function generateToken(userInfo) {
    if (!userInfo) return null;

    return jwt.sign(userInfo, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
}

function verifyToken(username, token) {
    return jwt.verify(token, process.env.JWT_SECRET, (err, response) => {
        if (err) {
            return {
                verified: false,
                message: 'invalid token'
            }
        }

        if (response.username !== username) {
            return {
                verified: false,
                message: 'invalid user',
            }
        }

        return {
            verified: true,
            message: 'token verified'
        }
    })
}
// export the functions
module.exports = {
    generateToken, verifyToken
};
