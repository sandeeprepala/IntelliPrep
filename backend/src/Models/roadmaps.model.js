import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const roadmapSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  steps: [stepSchema] // Array of step objects
});

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);