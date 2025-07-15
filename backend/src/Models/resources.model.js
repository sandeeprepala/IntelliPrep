import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String }, // e.g. Google, Amazon
    role: { type: String }, // e.g. SDE, Analyst
    type: { type: String, enum: ["DSA", "InterviewQuestion", "Guide"] },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Resources = mongoose.model("Resource", resourceSchema);
