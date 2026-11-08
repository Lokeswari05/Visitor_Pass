import { Router } from "express";
import {registerUser, loginUser, getProfile, logoutUser} from "../controllers/AuthController.js"
import { authorizedRoles, authToken } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// protectedRoutes - jwt ---> for testing
authRouter.get("/protected", authToken, (req, res) => {
    return res.status(200).json({
        message: "JWT Authentication successfully",
        user: req.user
    });
});

// protectedRoutes - Role based access 
authRouter.get("/protected/admin", authToken, authorizedRoles("admin"), (req, res) => {
    return res.status(200).json({
        message: "admin-only can acces this site",
        user: req.user
    });
});
authRouter.get("/protected/receptionist", authToken, authorizedRoles("admin", "receptionist"), (req, res) => {
    return res.status(200).json({
        message: "admin and receptionist are also access this site",
        user: req.user
    });
});
authRouter.get("/protected/employee", authToken, authorizedRoles("employee"), (req, res) => {
    return res.status(200).json({
        message: "employee can access this site",
        user: req.user
    });
});

//get user profile
authRouter.get("/get-me", authToken, getProfile);

// if logout API contract wants create a simple logout endpoints
authRouter.post("/logout", authToken, logoutUser);

export default authRouter;