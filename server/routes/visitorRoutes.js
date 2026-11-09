import {Router} from "express"
import { authorizedRoles, authToken } from "../middlewares/authMiddleware.js";
import { RegisterVisitor } from "../controllers/visitorContoller.js";

const visitorRouter = Router();

visitorRouter.post("/register", authToken, authorizedRoles("admin", "receptionist"), RegisterVisitor);

export default visitorRouter;