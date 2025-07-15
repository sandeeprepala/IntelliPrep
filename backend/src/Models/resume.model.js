import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    jdText: { type: String, required: true },
    matchPercentage: { type: Number, required: true },
    missingKeywords: [String],
    aiSuggestions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
