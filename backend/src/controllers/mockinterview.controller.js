import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterviewSession } from "../Models/interview.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function checkGeminiKey(res) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === "undefined") {
    res.status(500).json({
      error: "GEMINI_API_KEY is missing or not loaded. Please check your .env file and restart the backend.",
    });
    return false;
  }
  return true;
}

// ✅ Resume upload: receives plain text only
export const resumeUpload = async (req, res) => {
  if (!checkGeminiKey(res)) return;
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        error: "No resumeText received. Parse PDF/DOCX on client and send text.",
      });
    }

    if (resumeText.length > 20000) {
      return res.status(400).json({ error: "Text too long. Max 20000 chars." });
    }

    res.json({ resumeText, length: resumeText.length });
  } catch (error) {
    console.error("Resume upload failed:", error);
    res.status(500).json({ error: "Failed to handle resume text. " + (error.message || "") });
  }
};

export const startInterview = async (req, res) => {
  if (!checkGeminiKey(res)) return;
  try {
    // Use company and role from params if present
    const company = req.params.company || req.body.company;
    const role = req.params.role || req.body.role;
    const { resumeText } = req.body;

    if (!company || !role || !resumeText) {
      return res.status(400).json({ error: "company, role and resumeText required." });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const session = await InterviewSession.create({ company, role, user: userId });

    const prompt = `
You are an AI interviewer.
Candidate's resume: ${resumeText}
Role: ${role} at ${company}.

Start by asking the first question only.
Ask 4 short and to the point questions (not too long) questions total, one by one.
Wait for the user’s answer before asking the next.
At the end, return JSON: { "analysis": "...", "feedback": "..." }
`;

    let model, chat, result, question;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      chat = model.startChat();
      result = await chat.sendMessage(prompt);
      question = result.response.text();
    } catch (err) {
      console.warn("gemini-2.5-pro failed, trying fallback");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      chat = model.startChat();
      result = await chat.sendMessage(prompt);
      question = result.response.text();
    }

    session.conversation.push({ sender: "ai", message: question });
    await session.save();

    res.json({ sessionId: session._id, question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start interview" });
  }
};

export const askNextQuestion = async (req, res) => {
  if (!checkGeminiKey(res)) return;

  try {
    const company = req.params.company || req.body.company || "";
    const role = req.params.role || req.body.role || "";
    const { sessionId, userAnswer } = req.body;

    if (!sessionId || !userAnswer) {
      return res.status(400).json({ error: "sessionId and userAnswer are required." });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    session.conversation.push({ sender: "user", message: userAnswer });

    const aiQuestionsCount = session.conversation.filter(
      (msg) => msg.sender === "ai"
    ).length;

    const history = session.conversation.map((m) => ({
      role: m.sender === "ai" ? "model" : "user",
      parts: [{ text: m.message }],
    }));

    let model, result, nextMessage;

    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      if (aiQuestionsCount >= 4) {
        result = await model.generateContent({
          contents: [
            ...history,
            {
              role: "user",
              parts: [{
                text: `You have now finished the interview.
Provide final JSON in this exact format: { "analysis": "...", "feedback": "..." }`
              }],
            },
          ],
        });
      } else {
        result = await model.generateContent({ contents: history });
      }

      nextMessage = result.response.text();
    } catch (err) {
      console.warn("gemini-2.5-pro failed, trying fallback");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      if (aiQuestionsCount >= 4) {
        result = await model.generateContent({
          contents: [
            ...history,
            {
              role: "user",
              parts: [{
                text: `You have now finished the interview.
Provide final JSON in this exact format: { "analysis": "...", "feedback": "..." }`
              }],
            },
          ],
        });
      } else {
        result = await model.generateContent({ contents: history });
      }

      nextMessage = result.response.text();
    }

    if (nextMessage.includes(`"analysis"`)) {
      const jsonMatch = nextMessage.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error("AI did not return valid JSON");
      }
      const final = JSON.parse(jsonMatch[0]);

      session.analysis = final.analysis;
      session.feedback = final.feedback;
    } else {
      session.conversation.push({ sender: "ai", message: nextMessage });
    }

    await session.save();

    res.json({
      nextMessage,
      done: !!session.analysis,
      analysis: session.analysis,
      feedback: session.feedback,
    });

  } catch (error) {
    console.error("askNextQuestion error:", error);
    res.status(500).json({ error: "Failed to ask next question" });
  }
};


