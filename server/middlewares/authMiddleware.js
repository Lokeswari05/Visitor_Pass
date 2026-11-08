import jwt from "jsonwebtoken";
import User from "../models/User.js";

// jwt authentication
export const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message: "Access denied. Please login first."
            })
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("_id name email role isActive");
        if(!user){
            return res.status(401).json({
                message: "User not found"
            });
        }
        if(!user.isActive){
            return res.status(403).json({
                message: "your account is inactive"
            });
        }
        // attach the logged-in user to the request
        req.user = user;
        next();
    }

    catch(error){
        if(error.name === "TokenExpiredError" || error.name === "JsonWebTokenError"){
            return res.status(401).json({
                message: "Invalid token"
            });
        }
        console.log("Auth Middleware Error", error);
        return res.status(403).json({
            message: "Internal Server error", error
        });
    }

}

// role based access control
export const authorizedRoles = (...roles) => {
    return(req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                message: "Please Login first"
            });
        }
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    }
}