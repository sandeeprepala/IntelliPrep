import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../style/ViewPreviousAnalysisById.css'; // Create this CSS file

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ViewPreviousAnalysisById = () => {
  const [analysis, setAnalysis] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company,setCompany] = useState("");
  const [role,setRole] = useState("");
  const [convo,setConvo] = useState("");
  const { sessionId } = useParams();

  const fetchAnalysis = async () => {
    try {
      const local = localStorage.getItem('IntelliPrepUser');
      const user = local ? JSON.parse(local) : null;
      const token = user?.accessToken;

      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await axios.get(`${BACKEND_URL}/api/v1/previous-analysis/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAnalysis(res.data.data.analysis);
      setFeedback(res.data.data.feedback);
      setCompany(res.data.data.company);
      setRole(res.data.data.role);
      setConvo(res.data.data.conversation);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={fetchAnalysis}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Interview Analysis And Feedback</h2>
        <div className="session-id"> Company: {company}</div>
        <div className="session-id"> Role: {role}</div>
      </div>

      <div className="analysis-section">
        <h3 className="section-title">Performance Analysis</h3>
        <div className="section-content">
          {analysis || "No analysis available"}
        </div>
      </div>

      <div className="feedback-section">
        <h3 className="section-title">Detailed Feedback</h3>
        <div className="section-content">
          {feedback || "No feedback available"}
        </div>
      </div>
      {/* <div className="conversation-section">
        <h3 className="section-title">Interview Conversation</h3>
        <div className="section-content">
          {convo || "No Conversation available"}
        </div>
      </div> */}
    </div>
  );
};

export default ViewPreviousAnalysisById;