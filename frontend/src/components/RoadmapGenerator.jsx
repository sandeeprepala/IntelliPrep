import React, { useState } from 'react';
import '../style/RoadmapGenerator.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const RoadmapGenerator = () => {
  const [formData, setFormData] = useState({
    company: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/roadmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoadmap(data.data);
      } else {
        setError(data.message || 'Failed to generate roadmap');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="roadmap-container">
      {/* Header */}
      <div className="roadmap-header">
        <div className="header-icon">🚀</div>
        <h1 className="header-title">Interview Roadmap Generator</h1>
        <p className="header-subtitle">
          Create personalized interview preparation roadmaps for your dream company
        </p>
      </div>

      {/* Form */}
      <div className="roadmap-form-container">
        <form className="roadmap-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <div className="input-with-icon">
                <span className="input-icon">🏢</span>
                <input
                  type="text"
                  placeholder="Company Name (e.g., Google, Microsoft)"
                  value={formData.company}
                  onChange={handleInputChange('company')}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-with-icon">
                <span className="input-icon">💼</span>
                <input
                  type="text"
                  placeholder="Job Role (e.g., Full Stack Developer)"
                  value={formData.role}
                  onChange={handleInputChange('role')}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`generate-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                Generate Roadmap
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Roadmap Display */}
      {roadmap && (
        <div className="roadmap-results">
          <div className="results-header">
            <h2>Your Interview Roadmap</h2>
            <p className="company-role">
              {roadmap.company} • {roadmap.role}
            </p>
          </div>

          <div className="roadmap-steps">
            {roadmap.steps.map((step, index) => (
              <div key={step._id || index} className="step-card">
                <div className="step-number">Step {step.stepNumber}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <div className="step-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(step.stepNumber / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round((step.stepNumber / 5) * 100)}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;