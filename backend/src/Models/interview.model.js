import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String },
    role: { type: String },
    conversation: [
      {
        sender: { type: String, enum: ["user", "ai"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    analysis: {type: String, default: ""}, // Analysis of the interview session
    feedback: { type: String, default: "" }, // Feedback provided by the AI
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
