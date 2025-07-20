// models/mockQuestion.model.js

import mongoose from "mongoose";

const mockQuestionSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  answer: {
    type: String,
    required: true,
  },
});

export const MockTest = mongoose.model("MockTest", mockQuestionSchema);
