const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to check if user is incharge
const requireIncharge = (req, res, next) => {
    if (req.user && req.user.role === 'incharge') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Incharge role required.' });
    }
};

module.exports = { authenticateToken, requireIncharge };