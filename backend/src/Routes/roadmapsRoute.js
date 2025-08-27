import { createRoadmap,getAllRoadmaps,getRoadmapsById } from "../controllers/roadmaps.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const roadmapRoute = Router();

roadmapRoute.route('/').post(createRoadmap);
roadmapRoute.route('/').get(getAllRoadmaps);
roadmapRoute.route('/:id').get(getRoadmapsById);

export default roadmapRoute;