import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import mammoth from "mammoth";
import { useParams } from "react-router-dom";
import "../style/InterviewPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function InterviewPage() {
  const { company: companyParam, role: roleParam } = useParams();
  const company = decodeURIComponent(companyParam || "");
  const role = decodeURIComponent(roleParam || "");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState("pdf"); // "pdf" or "text"
  const [manualText, setManualText] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef(null);

  const getAuthHeaders = () => {
    const local = localStorage.getItem('IntelliPrepUser');
    const user = local ? JSON.parse(local) : null;
    const token = user?.accessToken;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Extract PDF text in-browser
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text.substring(0, 5000);
  };

  // Extract DOCX text in-browser
  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.substring(0, 5000);
  };

  // Upload & Parse Resume
  const handleUpload = async () => {
    setError("");
    setResumeText("");
    if (uploadMode === "pdf") {
      if (!file) {
        setError("Select a PDF or DOCX first");
        return;
      }
      if (
        file.type !== "application/pdf" &&
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setError("Only PDF or DOCX files are allowed");
        return;
      }
      setLoading(true);
      try {
        let text = "";
        if (file.type === "application/pdf") {
          text = await extractTextFromPDF(file);
        } else {
          text = await extractTextFromDocx(file);
        }
        setResumeText(text);
      } catch (err) {
        console.error(err);
        setError("Failed to extract text");
      }
      setLoading(false);
    } else {
      if (!manualText.trim()) {
        setError("Paste your resume text first");
        return;
      }
      if (manualText.length > 20000) {
        setError("Resume text too long (max 20000 chars)");
        return;
      }
      setResumeText(manualText);
    }
  };

  // Start Interview
  const startInterview = async () => {
    setError("");
    if (!resumeText) {
      setError("Upload resume first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/mock-interviews/start-interview/${company}/${role}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSessionId(data.sessionId);
        setChat([{ sender: "ai", message: data.question }]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start interview");
    }
    setLoading(false);
  };

  // Answer Q, Get Next Q
  const sendAnswer = async () => {
    setError("");
    if (!input.trim()) {
      setError("Please enter your answer");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/mock-interviews/ask-next/${company}/${role}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ sessionId, userAnswer: input }),
      });
      const data = await res.json();
      setChat((prev) => [
        ...prev,
        { sender: "user", message: input },
        { sender: "ai", message: data.nextMessage },
      ]);
      setInput("");
      if (data.done) {
        setDone(true);
        setAnalysis(data.analysis);
        setFeedback(data.feedback);
      }
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to get next question");
    }
    setLoading(false);
  };

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>AI Mock Interview</h2>
        {company && role && (
          <p className="interview-subtitle">
            {company} • {role}
          </p>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}

      {/* STEP 1: Upload */}
      {!resumeText && (
        <div className="upload-section">
          <div className="upload-mode-selector">
            <label className={`upload-mode-label ${uploadMode === "pdf" ? "active" : ""}`}>
              <input
                type="radio"
                checked={uploadMode === "pdf"}
                onChange={() => setUploadMode("pdf")}
                disabled={loading}
              />
              Upload PDF/DOCX
            </label>
            <label className={`upload-mode-label ${uploadMode === "text" ? "active" : ""}`}>
              <input
                type="radio"
                checked={uploadMode === "text"}
                onChange={() => setUploadMode("text")}
                disabled={loading}
              />
              Paste Resume Text
            </label>
          </div>

          {uploadMode === "pdf" ? (
            <div className="file-upload-container">
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                  className="file-input"
                />
                <button onClick={handleUpload} disabled={loading} className="upload-button">
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Extracting...
                    </>
                  ) : "Upload & Extract"}
                </button>
              </div>
            </div>
          ) : (
            <div className="file-upload-container">
              <textarea
                rows={8}
                placeholder="Paste your resume text here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="resume-textarea"
                disabled={loading}
              />
              <button onClick={handleUpload} disabled={loading} className="upload-button">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing...
                  </>
                ) : "Submit Text"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Show parsed resume text */}
      {resumeText && (
        <div className="resume-preview">
          <h4>Parsed Resume Preview</h4>
          <textarea 
            rows={8} 
            value={resumeText} 
            readOnly 
            className="resume-textarea" 
          />
        </div>
      )}

      {/* STEP 2: Start Interview */}
      {resumeText && !sessionId && (
        <div className="interview-controls">
          <button onClick={startInterview} disabled={loading} className="start-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Starting...
              </>
            ) : "Start Interview"}
          </button>
        </div>
      )}

      {/* STEP 3: Chat */}
      {sessionId && (
        <div className="chat-container">
          <h4 className="chat-header">Interview Conversation</h4>
          <div className="chat-window">
            {chat.map((m, i) => (
              <div 
                key={i} 
                className={`message ${m.sender === "ai" ? "message-ai" : "message-user"}`}
              >
                <div className="message-sender">
                  {m.sender === "ai" ? "Interviewer" : "You"}
                </div>
                <div className="message-content">
                  {m.message}
                </div>
              </div>
            ))}
          </div>
          {!done && (
            <div className="chat-input-container">
              <input
                placeholder="Type your answer here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="chat-input"
                disabled={loading}
                onKeyPress={(e) => e.key === "Enter" && sendAnswer()}
              />
              <button onClick={sendAnswer} disabled={loading} className="send-button">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Sending...
                  </>
                ) : "Send"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Final Feedback */}
      {done && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ Interview Completed</h3>
            <p>Here's your performance analysis and feedback</p>
          </div>
          <div className="analysis-section">
            <h4 className="section-title">Performance Analysis</h4>
            <div className="section-content">
              {analysis}
            </div>
          </div>
          <div className="feedback-section">
            <h4 className="section-title">Detailed Feedback</h4>
            <div className="section-content">
              {feedback}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}