import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/RoadmapDetail.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmapById();
  }, [id]);

  const fetchRoadmapById = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${BACKEND_URL}/api/v1/roadmaps/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setRoadmap(data.data);
      } else {
        setError(data.message || 'Failed to fetch roadmap');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getCompanyLogo = (company) => {
    const companyLower = company.toLowerCase();
    if (companyLower.includes('google')) return '🔍';
    if (companyLower.includes('amazon')) return '📦';
    if (companyLower.includes('microsoft')) return '💻';
    if (companyLower.includes('meta') || companyLower.includes('facebook')) return '👥';
    if (companyLower.includes('apple')) return '🍎';
    if (companyLower.includes('netflix')) return '🎬';
    return '🏢';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="roadmap-detail-container">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading roadmap details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-detail-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Roadmap</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/roadmaps')}
            className="back-btn"
          >
            ← Back to All Roadmaps
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="roadmap-detail-container">
        <div className="not-found-container">
          <div className="not-found-icon">🔍</div>
          <h3>Roadmap Not Found</h3>
          <p>The requested roadmap could not be found.</p>
          <button 
            onClick={() => navigate('/roadmaps')}
            className="back-btn"
          >
            ← Back to All Roadmaps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button 
          onClick={() => navigate('/roadmaps')}
          className="back-button"
        >
          ← Back to Roadmaps
        </button>
        
        <div className="header-content">
          <div className="company-section">
            <div className="company-logo-large">
              {getCompanyLogo(roadmap.company)}
            </div>
            <div className="company-info">
              <h1 className="company-name">{roadmap.company}</h1>
              <h2 className="role-title">{roadmap.role}</h2>
            </div>
          </div>
          
          {/* <div className="header-actions">
            <button className="action-btn download-btn">
              📄 Download PDF
            </button>
            <button className="action-btn share-btn">
              ↗️ Share
            </button>
          </div> */}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-stats">
          <div className="stat">
            <div className="stat-number">{roadmap.steps.length}</div>
            <div className="stat-label">Total Steps</div>
          </div>
          <div className="stat">
            <div className="stat-number">5</div>
            <div className="stat-label">Weeks Estimated</div>
          </div>
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Completion</div>
          </div>
        </div>
        
        <div className="progress-bar-large">
          <div 
            className="progress-fill-large"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>

      {/* Roadmap Steps */}
      <div className="steps-container">
        <div className="steps-header">
          <h3>Interview Preparation Roadmap</h3>
          <span className="steps-count">{roadmap.steps.length} steps</span>
        </div>

        <div className="steps-timeline">
          {roadmap.steps.map((step, index) => (
            <div key={step._id || index} className="timeline-item">
              <div className="timeline-marker">
                <div className="marker-number">{step.stepNumber}</div>
                <div className="marker-line"></div>
              </div>
              
              <div className="timeline-content">
                <div className="step-card-detailed">
                  <div className="step-header">
                    <h4 className="step-title">{step.title}</h4>
                    <div className="step-badge">Step {step.stepNumber}</div>
                  </div>
                  
                  <p className="step-description">{step.description}</p>
                  
                  <div className="step-actions">
                    <button className="step-btn resources-btn" onClick={()=>navigate('/interview-prep')}>
                      📚 Resources
                    </button>
                    <button className="step-btn mark-complete">
                      ✅ Mark Complete
                    </button>
                  </div>
                  
                  <div className="step-progress-detailed">
                    <div className="progress-label">Progress</div>
                    <div className="progress-bar-step">
                      <div 
                        className="progress-fill-step"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                    <span className="progress-percentage">0%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="resources-section">
        <h3>Additional Resources</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon" onClick={()=>navigate('/interview-prep')}>📖</div>
            <h4>Study Materials</h4>
            <p>Recommended books and online courses</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon" onClick={()=>navigate('/interview-prep')}>🎥</div>
            <h4>Video Tutorials</h4>
            <p>Helpful video content and tutorials</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon" onClick={()=>navigate('/interview-prep')}>💻</div>
            <h4>Practice Problems</h4>
            <p>Coding challenges and exercises</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="detail-footer">
        <div className="footer-info">
          <p>Roadmap created on {formatDate(roadmap.createdAt || new Date())}</p>
        </div>
        <div className="footer-actions">
          {/* <button className="footer-btn feedback-btn">
            💬 Provide Feedback
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;