import { ApiError} from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { InterviewSession } from "../Models/interview.model.js";
import { SessionTemplate } from "../Models/sessions.model.js";

// Function to create a new interview session
const createInterviewSession = asyncHandler(async (req, res, next) => {
    const { company, role } = req.body;

    if (!company || !role) {
        throw new ApiError("Company, role are required", 400);
    }

    const interviewSession = await SessionTemplate.create({
        company,
        role,
    });

    res.status(201).json(new ApiResponse(201, interviewSession, "Interview session created successfully"));
});

// Function to get all interview sessions not using user
const getAllInterviewSessions = asyncHandler(async (req, res, next) => {
    const interviewSessions = await SessionTemplate.find();

    if (!interviewSessions || interviewSessions.length === 0) {
        throw new ApiError("No interview sessions found", 404);
    }

    res.status(200).json(new ApiResponse(200, interviewSessions, "Interview sessions fetched successfully"));
});



export { createInterviewSession, getAllInterviewSessions };