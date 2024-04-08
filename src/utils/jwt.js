const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return { success: true, decoded };
    } catch (error) {
        return { success: false, error: 'Token không hợp lệ.' };
    }
}

module.exports = { generateToken, verifyToken };
