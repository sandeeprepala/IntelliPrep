import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createResource, getAllResources } from "../controllers/resources.controller.js";

const resourcesRouter = Router();

resourcesRouter.route("/").post(verifyJWT,createResource);
resourcesRouter.route("/").get(getAllResources);

export default resourcesRouter;