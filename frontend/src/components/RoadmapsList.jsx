import React, { useState, useEffect } from 'react';
import '../style/RoadmapsList.css';
import { useNavigate } from 'react-router-dom';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const RoadmapsList = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoadmaps, setFilteredRoadmaps] = useState([]);

  useEffect(() => {
    fetchAllRoadmaps();
  }, []);

  useEffect(() => {
    const filtered = roadmaps.filter(roadmap =>
      roadmap.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoadmaps(filtered);
  }, [searchTerm, roadmaps]);

  const fetchAllRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/v1/roadmaps`);
      const data = await response.json();
      
      if (data.success) {
        setRoadmaps(data.data);
      } else {
        setError('Failed to fetch roadmaps');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="roadmaps-container">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmaps-container">
      {/* Header */}
      <div className="roadmaps-header">
        <div className="header-icon">🗂️</div>
        <h1 className="header-title">All Interview Roadmaps</h1>
        <p className="header-subtitle">
          Browse through all generated interview preparation roadmaps
        </p>
      </div>

      {/* Search and Stats */}
      <div className="roadmaps-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">{roadmaps.length}</div>
            <div className="stat-label">Total Roadmaps</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(roadmaps.map(r => r.company)).size}
            </div>
            <div className="stat-label">Unique Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(roadmaps.map(r => r.role)).size}
            </div>
            <div className="stat-label">Unique Roles</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Roadmaps Grid */}
      <div className="roadmaps-grid">
        {filteredRoadmaps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No roadmaps found</h3>
            <p>
              {searchTerm ? 
                `No roadmaps match "${searchTerm}"` : 
                'No roadmaps have been created yet'
              }
            </p>
          </div>
        ) : (
          filteredRoadmaps.map((roadmap) => (
            <div key={roadmap._id} className="roadmap-card">
              <div className="card-header">
                <div className="company-logo">
                  {getCompanyLogo(roadmap.company)}
                </div>
                <div className="company-info">
                  <h3 className="company-name">{roadmap.company}</h3>
                  <p className="role-name">{roadmap.role}</p>
                </div>
              </div>

              <div className="steps-preview">
                <div className="steps-header">
                  <span className="steps-label">Roadmap Steps</span>
                  <span className="steps-count">{roadmap.steps.length} steps</span>
                </div>
                
                <div className="steps-list">
                  {roadmap.steps.slice(0, 5).map((step, index) => (
                    <div key={step._id || index} className="step-preview">
                      <div className="step-number-small">#{step.stepNumber}</div>
                      <span className="step-title-small">{step.title}</span>
                    </div>
                  ))}
                  
                </div>
              </div>

              <div className="card-footer">
                <div className="created-date">
                  Created {formatDate(roadmap.createdAt || new Date())}
                </div>
                <div className='view-details-btn' onClick={() => navigate(`/roadmaps/${roadmap._id}`)}>
                  View Details
                </div>
              </div>

              <div className="progress-indicator">
                <div className="progress-background">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      background: `linear-gradient(90deg, #42a5f5, #1976d2)`,
                      width: '100%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button 
          onClick={fetchAllRoadmaps}
          className="refresh-btn"
        >
          <span className="refresh-icon">🔄</span>
          Refresh Roadmaps
        </button>
      </div>
    </div>
  );
};

export default RoadmapsList;