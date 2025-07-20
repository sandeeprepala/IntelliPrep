import mongoose from "mongoose";

const mockTestFeedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        company: { type: String, required: true },
        role: { type: String, required: true },
        answers: [
            {
                question: String,
                selectedOption: String,
                correctAnswer: String
            }
        ],
        feedback: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, default: 3 }, // Rating for the mock test
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
    },
    { timestamps: true }
);

export const MockTestFeedback = mongoose.model("MockTestFeedback", mockTestFeedbackSchema);