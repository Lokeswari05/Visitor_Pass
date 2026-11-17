import {Router} from "express"
import { authorizedRoles, authToken } from "../middlewares/authMiddleware.js";
import { checkIn, checkOut, getVisitorActivity, RegisterVisitor } from "../controllers/visitorContoller.js";

const visitorRouter = Router();

visitorRouter.post("/visitor", authToken, authorizedRoles("admin", "receptionist"), RegisterVisitor);

visitorRouter.patch("/:id/checkIn", authToken, authorizedRoles("receptionist"), checkIn);
visitorRouter.patch("/:id/checkOut", authToken, authorizedRoles("receptionist"), checkOut);

visitorRouter.get("/:id/activites", authToken, authorizedRoles("admin", "receptionist","employee"), getVisitorActivity);

export default visitorRouter;