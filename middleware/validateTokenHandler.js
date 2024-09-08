const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        console.log("No access token provided.");
        res.sendStatus(403);
        return res.redirect("/")
    }

    // Validate access token
    try {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);
            req.user = decoded.user;
            next();
        });
        // const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // console.log("🚀 ~ user:", user)
        // res.locals.user = user;
        // next();
    } catch (error) {
        console.log("Access token is invalid. Please get a new one.");
        res.clearCookie("accessToken");
        res.status(401);
    }
    
    // let token;
    // let authHeader = req.headers.Authorization || req.headers.authorization;
    // if (authHeader && authHeader.startsWith("Bearer")) {
    //     token = authHeader.split(" ")[1];
    //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //         if (err) {
    //             res.status(401);
    //             throw new Error("User is not authorized.")
    //         }
    //         // console.log("🚀 ~ decoded:", decoded)
    //         req.user = decoded.user;
    //         next();
    //     });

    //     if (!token) {
    //         res.status(401);
    //         throw new Error("User is not authorized or token is missing.")
    //     }
        
    // }

})

module.exports = validateToken;
