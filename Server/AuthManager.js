const jwt = require("jsonwebtoken");


var secret = "NetaDaniSuperSecretSHHHHHHHHHH!!!!";


exports.generateToken = function(payload,secret, options){

    return jwt.sign(payload,secret, options)
};

exports.validate = function(req, res, next){
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        next();
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
};


