import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Roadmap } from "../Models/roadmaps.model.js";
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY:', geminiKey ? 'Present' : 'Missing');

let genAI;
if (geminiKey && geminiKey !== 'undefined') {
  genAI = new GoogleGenerativeAI(geminiKey);
} else {
  console.log('Gemini AI not initialized due to missing API key');
}

// ============================
// Create a roadmap
// ============================
export const createRoadmap = asyncHandler(async (req, res) => {
  const { company, role } = req.body;
  if (!company || !role) throw new ApiError(400, "Company and role are required");

  console.log('Generating roadmap for:', company, role);

  const createFallbackRoadmap = async () => {
    const getRoleSpecificSteps = () => {
      const roleLower = role.toLowerCase();
      const companyLower = company.toLowerCase();

      const getCompanySpecificContent = () => {
        if (companyLower.includes('google')) return { tech: "algorithms, data structures, and system design", focus: "problem-solving and scalability", specific: "Google's coding style and engineering principles" };
        if (companyLower.includes('amazon') || companyLower.includes('aws')) return { tech: "AWS services, distributed systems", focus: "leadership principles and customer obsession", specific: "Amazon's 14 Leadership Principles" };
        if (companyLower.includes('microsoft')) return { tech: "C#, .NET, Azure services", focus: "design patterns and architecture", specific: "Microsoft's development ecosystem" };
        if (companyLower.includes('meta') || companyLower.includes('facebook')) return { tech: "React, PHP/Hack, distributed systems", focus: "product sense and scalability", specific: "Meta's engineering culture" };
        return { tech: "relevant technologies", focus: "problem-solving and technical skills", specific: "the company's specific requirements" };
      };

      const companyInfo = getCompanySpecificContent();

      if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
        return [
          { stepNumber: 1, title: "Master Frontend Fundamentals", description: `Deepen knowledge of HTML, CSS, JavaScript, and modern frameworks. Focus on ${companyInfo.tech} for ${company}.` },
          { stepNumber: 2, title: "Learn Company's Tech Stack", description: `Research ${company}'s specific frontend technologies, tools like React/Angular/Vue, and their design systems.` },
          { stepNumber: 3, title: "Build Portfolio Projects", description: `Create 2-3 projects showcasing modern frontend technologies that align with ${company}'s stack.` },
          { stepNumber: 4, title: "Practice Technical Interviews", description: `Solve frontend coding challenges focusing on ${companyInfo.focus}. Practice UI design and component architecture.` },
          { stepNumber: 5, title: "Mock Interviews & System Design", description: `Conduct mock interviews focusing on ${companyInfo.specific}. Prepare for behavioral questions and system design.` }
        ];
      } else if (roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('server')) {
        return [
          { stepNumber: 1, title: "Master Backend Technologies", description: `Deepen knowledge of server-side languages, databases, and API design for ${company}.` },
          { stepNumber: 2, title: "Learn Infrastructure & DevOps", description: `Study ${company}'s backend architecture, cloud services, microservices, and deployment practices.` },
          { stepNumber: 3, title: "Build Scalable Systems", description: "Create projects demonstrating ability to build robust, scalable backend systems." },
          { stepNumber: 4, title: "Practice System Design", description: `Solve system design problems focusing on ${companyInfo.focus}. Study distributed systems patterns.` },
          { stepNumber: 5, title: "Prepare for Comprehensive Interviews", description: `Practice coding, system design, and behavioral questions. Focus on ${companyInfo.specific}.` }
        ];
      } else if (roleLower.includes('fullstack') || roleLower.includes('full stack')) {
        return [
          { stepNumber: 1, title: "Master Full Stack Technologies", description: `Deepen knowledge of frontend and backend technologies relevant to ${company}'s stack.` },
          { stepNumber: 2, title: "Learn End-to-End Development", description: `Study ${company}'s complete technology ecosystem from UI to database and deployment.` },
          { stepNumber: 3, title: "Build Complete Applications", description: "Create full-stack projects demonstrating both client-side and server-side capabilities." },
          { stepNumber: 4, title: "Practice Comprehensive Problems", description: `Solve problems covering both frontend and backend concepts. Focus on ${companyInfo.focus}.` },
          { stepNumber: 5, title: "Prepare for Multi-domain Interviews", description: `Practice full-stack coding, system design, and behavioral questions. Study ${companyInfo.specific}.` }
        ];
      } else {
        return [
          { stepNumber: 1, title: "Research Company & Role", description: `Research ${company}'s products, culture, and requirements for ${role}.` },
          { stepNumber: 2, title: "Technical Skill Assessment", description: `Identify and master key skills for ${role} at ${company}.` },
          { stepNumber: 3, title: "Project Portfolio Development", description: "Build projects demonstrating your capabilities." },
          { stepNumber: 4, title: "Interview Preparation", description: "Practice coding, system design, and behavioral questions." },
          { stepNumber: 5, title: "Mock Interviews & Final Prep", description: "Conduct mock interviews and refine answers." }
        ];
      }
    };

    return await Roadmap.create({ company, role, steps: getRoleSpecificSteps() });
  };

  if (!geminiKey || !genAI) {
    console.log("No Gemini API key available, using fallback roadmap");
    const roadmap = await createFallbackRoadmap();
    return res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created with fallback data"));
  }

  try {
    const prompt=`Generate a 5-step roadmap for a ${role} at ${company}.Return ONLY valid JSON with keys: company, role, steps (array of objects with stepNumber, title, description).No extra text.and Note that Ensure stepNumber is a number, title and description are strings.
Do not return extra commentary, only JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Correct way to get text
    const text = response.text();
    console.log('Gemini AI text:', text);

    if (!text) {
      console.log('AI returned empty text, using fallback roadmap');
      const roadmap = await createFallbackRoadmap();
      return res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created with fallback data (AI empty)"));
    }
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log(cleanText);
    let roadmapJson;
    try { roadmapJson = JSON.parse(cleanText); } 
    catch { 
      const roadmap = await createFallbackRoadmap();
      return res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created with fallback data (AI returned invalid JSON)")); 
    }

    const roadmap = await Roadmap.create(roadmapJson);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created successfully with AI"));

  } catch (error) {
    console.error('Error generating roadmap with AI:', error);
    const roadmap = await createFallbackRoadmap();
    return res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created with fallback data (system error)"));
  }
});

// ============================
// Get all roadmaps
// ============================
export const getAllRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find();
  res.status(200).json(new ApiResponse(200, roadmaps, "All roadmaps fetched successfully"));
});

// ============================
// Get roadmap by ID
// ============================

export const getRoadmapsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!id || id.length !== 24) {
    throw new ApiError(400, "Invalid roadmap ID");
  }

  const roadmap = await Roadmap.findById(id);

  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  res.status(200).json(
    new ApiResponse(200, roadmap, "Roadmap fetched successfully")
  );
});
