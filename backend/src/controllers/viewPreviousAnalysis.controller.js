import { ApiError} from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { InterviewSession } from "../Models/interview.model.js";

// display all previous interview analysis and feedback
const viewPreviousAnalysis = asyncHandler(async (req, res, next) => {
    // Fetch all interview sessions for the user
    const interviewSessions = await InterviewSession.find({ user: req.user._id })
        .sort({ createdAt: -1 }) // Sort by most recent first
        .select('company role createdAt'); // Select relevant fields

    if (!interviewSessions || interviewSessions.length === 0) {
        throw new ApiError("No previous interview analysis found", 404);
    }

    res.status(200).json(new ApiResponse(200, interviewSessions, "Previous interview analysis fetched successfully"));
});

//view analysis and feedback for a specific session
const viewAnalysisBySession = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        throw new ApiError("Session ID is required", 400);
    }

    const session = await InterviewSession.findById(sessionId)  
        .select('company role conversation analysis feedback createdAt');
    if (!session) {
        throw new ApiError("Interview session not found", 404);
    }
    res.status(200).json(new ApiResponse(200, session, "Interview analysis fetched successfully"));
});

export { viewPreviousAnalysis, viewAnalysisBySession };