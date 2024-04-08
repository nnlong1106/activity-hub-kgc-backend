const { verifyToken } = require('../../utils/jwt');
const roles = JSON.parse(process.env.ROLES);
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);

module.exports = (allowedRoles = roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: errorMessages.unauthorized });
        }

        const verificationResult = verifyToken(token);

        if (!verificationResult.success) {
            return res.status(401).json({ error: errorMessages.unauthorized });
        }

        const user = verificationResult.decoded;

        // Kiểm tra quyền truy cập dựa trên thông tin trong token
        if (allowedRoles.includes(user.role)) {
            // Cho phép truy cập nếu có quyền truy cập được phép
            req.user = user;
            return next();
        } else {
            return res.status(403).json({ error: errorMessages.forbidden });
        }
    };
};
