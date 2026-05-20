const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Handle "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next(); // THIS IS THE FUNCTION THAT MUST EXIST
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};