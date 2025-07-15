import { Router } from "express";
import { viewPreviousAnalysis, viewAnalysisBySession } from "../controllers/viewPreviousAnalysis.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const viewPreviousAnalysisRouter = Router();

viewPreviousAnalysisRouter.get("/", verifyJWT, viewPreviousAnalysis); // Route to view all previous analysis
viewPreviousAnalysisRouter.get("/:sessionId", verifyJWT, viewAnalysisBySession); // Route to view analysis by specific session ID

export default viewPreviousAnalysisRouter;