import express from 'express';
import { resumeJD } from '../controllers/resumeJD.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const resumeJDRouter = express.Router();

// Apply JWT verification to all resume routes

/**
 * @route POST /api/resume/analyze
 * @desc Analyze resume text against job description
 * @access Private
 * @body {resumeText: string, jobDescription: string}
 */
resumeJDRouter.post('/', resumeJD);

export default resumeJDRouter;