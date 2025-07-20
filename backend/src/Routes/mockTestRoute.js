import express from "express";
import {createMockTestQuestion , getAllMockTestQuestions,generateMockTestFeedback, getUserMockTestFeedbacks} from "../controllers/mockTest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const mockTestRouter = express.Router();
mockTestRouter.post("/", verifyJWT, createMockTestQuestion);
mockTestRouter.get("/:company/:role", verifyJWT, getAllMockTestQuestions);
mockTestRouter.post("/feedback", verifyJWT, generateMockTestFeedback);
mockTestRouter.get("/feedback/history", verifyJWT, getUserMockTestFeedbacks);

export default mockTestRouter;