import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try{
        const{name, email, phone, password, role} = req.body;
        // validation
        if(!name || !email || !phone || !password){
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        if(password.length < 6) {
            return res.status(400).json({
                message: "password must contain altleast 6 characters"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({email: cleanEmail}).select("+password");
        if(existingUser){
            return res.status(400).json({
                message: "User is aldready exists..."
            });
        }

        const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : ""; 
        if(cleanPhone.length !== 10){
            return res.status(400).json({
                message: "Phone Number should contain exactly 10 numbers"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // otp based email verification
        const user = await User.create({
            name, email: cleanEmail, phone: cleanPhone, password: hashedPassword, role
        });
        res.status(201).json({
            message: "User register Successfully...", 
            user
        });
    }
    catch(error){
        console.error("Error registering the user");
        res.status(500).json({
            message: "Error registering the user", error: error.message
        });
    }
}

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                //success: false,
                message: " All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()}).select("+password");
        if(!existingUser){
            return res.status(401).json({
                message: "User is not found"
            });
        }
        if(!existingUser.isActive){
            return res.status(403).json({
                message: "Your account is inActive"
            });
        }

        if(! await bcrypt.compare(password, existingUser.password)){
            return res.status(401).json({
                message: "Invalid Password"
            });
        }
        // generate jwt
        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role},
            process.env.JWT_SECRET,
            { expiresIn: "1d"}
        );

        res.status(200).json({
            message: "Login successfully",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });
    } 
    catch(error){
        console.error("Error occurs during login...");
        res.status(500).json({
            message: "Error occurs during login...", error: error.message
        });
    }
}

// get cuurent user profile
export const getProfile = async (req, res) => {
    // user details aldready attached by authToken
    try{
        const user = await User.findById(req.user.id).select("_id name email phone role isActive");

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        if(!user.isActive){
            return res.status(403).json({
                message: "Account is not Active"
            });
        }
        return res.status(200).json({
            message: "User details fetched successfully.",
            user
        });
    }
    catch(error){
        console.error("Error during fetching the user details");
        return res.status(500).json({
            message: "Error during fetching the user details", error
        });
    }
}

// if logout API contract wants create a simple logout endpoints
export const logoutUser = async (req, res) => {
    try{
        return res.status(200).json({
            message: `${req.user.name} logout Successfully`
        });
    }
    catch(error){
        console.error("Logout Error", error);
        return res.status(500).json({
            message: "Logout Error"
        });
    }
}