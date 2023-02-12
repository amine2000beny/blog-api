const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token is required" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ error: "Invalid token" });
        }

        req.account = decode.id;
        req.email = decode.email;

        next();
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

module.exports = { authenticate };
