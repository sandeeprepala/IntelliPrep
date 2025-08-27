import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const resumeJD = async (req, res) => {
  // Debug: Print the API key to verify it's loaded
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY:', geminiKey);
  if (!geminiKey || geminiKey === 'undefined') {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing or not loaded. Please check your .env file and restart the backend.' });
  }
  try {
    const { resumeText, jobDescription } = req.body;
    
    // Validate input
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both fields are required' });
    }
    console.log('Received resumeText:', resumeText);
    console.log('Received jobDescription:', jobDescription);
    // Free tier limits
    if (resumeText.length > 2000 || jobDescription.length > 1000) {
      return res.status(400).json({ 
        error: 'Text too long. Max 2000 chars for resume, 1000 for JD' 
      });
    }

    // Optimized prompt for minimal token usage
    const prompt = `Analyze this resume against the job description. Return JSON with:
      - matchScore (0-100)
      - top 5 keywords with matchType (critical/high/medium) and count
      - 3 concise improvement suggestions
      Format:
      {
        "matchScore": number,
        "keywords": [{"word": string, "matchType": string, "count": number}],
        "suggestions": string[]
      }

      Resume: ${resumeText}
      Job Description: ${jobDescription}`;

    // Try both model names for compatibility
    let model, result, response, text, data;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await model.generateContent(prompt);
      response = await result.response;
      text = response.text();
      console.log('Gemini response:', text);
    } catch (err) {
      // Try fallback model name if the first fails
      console.warn('gemini-pro failed, trying gemini-1.5-pro-latest');
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      result = await model.generateContent(prompt);
      response = await result.response;
      text = response.text();
    }
    // Clean response and parse
    text = text.replace(/```json|```/g, '').trim();
    data = JSON.parse(text);

    // Cache results
    res.set('Cache-Control', 'public, max-age=86400');
    res.json(data);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed. ' + (error.message || '') + ' Please try shorter texts or try again later.' 
    });
  }
};

export { resumeJD };