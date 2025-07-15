import express from "express";
import {
  resumeUpload,
  startInterview,
  askNextQuestion
} from "../controllers/mockinterview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const mockRouter = express.Router();

mockRouter.post("/resume-upload", resumeUpload);
mockRouter.post("/start-interview/:company/:role", verifyJWT, startInterview);
mockRouter.post("/ask-next/:company/:role", verifyJWT, askNextQuestion);

export default mockRouter;
