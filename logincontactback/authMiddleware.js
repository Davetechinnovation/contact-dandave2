require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET); // Use environment secret key
        req.user = verifiedUser; // Attach user info to the request
        next(); // Proceed to the next function
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please log in again." });
        }
        res.status(400).json({ error: "Invalid token." });
    }
};

module.exports = authenticateUser; // Export the middleware
