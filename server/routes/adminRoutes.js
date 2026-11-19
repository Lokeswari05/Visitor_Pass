import {Router} from "express"
import { authorizedRoles, authToken } from "../middlewares/authMiddleware.js";
import { getActivity, getAllUsers, getAllVisitors, getDashboard, getUser, getVisitor, registerUser, updateUser, updateUserStatus } from "../controllers/adminController.js";


const adminRouter = Router();

adminRouter.get("/dashboard", authToken, authorizedRoles("admin"), getDashboard);
adminRouter.get("/users", authToken, authorizedRoles("admin"), getAllUsers);
adminRouter.get("/users/:id", authToken, authorizedRoles("admin"), getUser);

adminRouter.post("/users", authToken, authorizedRoles("admin"), registerUser);

adminRouter.patch("/users/:id", authToken, authorizedRoles("admin"), updateUser);
adminRouter.patch("/users/:id/status", authToken, authorizedRoles("admin"), updateUserStatus);

adminRouter.get("/visitors", authToken, authorizedRoles("admin"), getAllVisitors);
adminRouter.get("/visitors/:id", authToken, authorizedRoles("admin"), getVisitor);
adminRouter.get("/activities", authToken, authorizedRoles("admin"), getActivity);


export default adminRouter;