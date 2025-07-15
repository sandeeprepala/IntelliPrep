import mongoose from "mongoose";

const sessionTemplateSchema = new mongoose.Schema({
  company: { type: String },
  role: { type: String }
});
export const SessionTemplate = mongoose.model("SessionTemplate", sessionTemplateSchema);
