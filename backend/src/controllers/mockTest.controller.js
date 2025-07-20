import { ApiError} from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { MockTest } from "../Models/mocktest.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MockTestFeedback } from "../Models/mocktestfeedback.model.js";
import mongoose from "mongoose";

// Function to create a new mock test question
const createMockTestQuestion = asyncHandler(async (req, res, next) => {
    const { company, role, question, options, answer } = req.body;

    if (!company || !role || !question || !options || !answer) {
        throw new ApiError("All fields are required", 400);
    }

    const mockTestQuestion = await MockTest.create({
        company,
        role,
        question,
        options,
        answer,
    });

    res.status(201).json(new ApiResponse(201, mockTestQuestion, "Mock test question created successfully"));
});

// Function to get all mock test questions
const getAllMockTestQuestions = asyncHandler(async (req, res, next) => {
    const { company, role } = req.params;
    const mockTestQuestions = await MockTest.find({ company, role });

    // Always return an array, even if empty
    res.status(200).json(new ApiResponse(200, mockTestQuestions, "Mock test fetched successfully"));
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generateMockTestFeedback = asyncHandler(async (req, res) => {
  const { company, role, answers, questions, score } = req.body;

  if (!answers || !questions) {
    return res.status(400).json({ error: "Answers and questions required" });
  }

  const prompt = `
You are an interview preparation assistant.
The candidate took a mock test for ${role} at ${company}.

Questions with answers:
${questions.map((q, i) => `
Q${i + 1}: ${q.question}
Correct answer: ${q.answer}
Candidate's answer: ${answers[i] || "No answer"}
`).join("\n")}

The candidate scored ${score} out of ${questions.length}.

Provide a short, actionable feedback paragraph about their 
strengths and weaknesses and what things should he work on to crack the 
interview (note give only feedback).
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const result = await model.generateContent(prompt);
  const feedback = result.response.text();

  // Prepare answers array for storage
  const answersArray = questions.map((q, i) => ({
    question: q.question,
    selectedOption: answers[i] || "",
    correctAnswer: q.answer
  }));

  // Save feedback to DB, ensure user is ObjectId
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const saved = await MockTestFeedback.create({
    user: userId,
    company,
    role,
    answers: answersArray,
    feedback,
    score,
    totalQuestions: questions.length
  });
  console.log('Saved feedback for user:', userId, 'company:', company, 'role:', role, 'id:', saved._id);

  res.json({ feedback });
});

// Function to get all previous mock test feedbacks for a user
const getUserMockTestFeedbacks = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  console.log('User ID:', userId);
  console.log('Fetching feedbacks for user:', userId);
  const feedbacks = await MockTestFeedback.find({user: userId}).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, feedbacks, "User mock test feedbacks fetched successfully"));
});



export { createMockTestQuestion, getAllMockTestQuestions, generateMockTestFeedback, getUserMockTestFeedbacks };