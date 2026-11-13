import {Router} from "express";
import { approveOrReject, getAllVisitor } from "../controllers/employeeController.js";
import { authorizedRoles, authToken } from "../middlewares/authMiddleware.js";

const employeeRouter = Router();

employeeRouter.get("/getAllVisitor", authToken, authorizedRoles("employee"), getAllVisitor);
employeeRouter.patch("/visitor/:id/updateStatus", authToken, authorizedRoles("employee"), approveOrReject);

export default employeeRouter