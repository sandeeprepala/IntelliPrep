import { ApiError} from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Resources } from "../Models/resources.model.js";

// Function to create a new resource

const createResource = asyncHandler(async (req, res,next) => {
    const { title, company, role, type, content } = req.body;

    if (!title || !content) {
        throw new ApiError("Title and content are required", 400);
    }

    const resource = await Resources.create({
        title,
        company,
        role,
        type,
        content
    });

    res.status(201).json(new ApiResponse(201, resource, "Resource created successfully"));
});

// Function to get all resources
const getAllResources = asyncHandler(async (req, res,next) => {
    const resources = await Resources.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, resources, "Resources fetched successfully"));
});

export { createResource, getAllResources };

