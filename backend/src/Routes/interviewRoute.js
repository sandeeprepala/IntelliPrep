import { Router } from "express";
import { createInterviewSession, getAllInterviewSessions } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const interviewRouter = Router();
// Route to create a new interview session
interviewRouter.route("/").post(verifyJWT, createInterviewSession);
// Route to get all interview sessions for a user
interviewRouter.route("/").get(verifyJWT, getAllInterviewSessions);
export default interviewRouter;