import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/MockInterviews.css';

const ViewPreviousAnalysis = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const local = localStorage.getItem('IntelliPrepUser');
        const user = local ? JSON.parse(local) : null;
        const token = user?.accessToken;
        const response = await axios.get('/api/v1/previous-analysis', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSessions(response.data.data);
        console.log(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleSessionClick = (session) => {
    const company = encodeURIComponent(session.company);
    const role = encodeURIComponent(session.role);
    navigate(`/previous-analysis/${session._id}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your sessions...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p className="error-message">{error}</p>
      <button 
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h2>Your Previous Interview Sessions</h2>
        <p className="sessions-count">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
        
      </div>

      {sessions.length > 0 ? (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div 
              key={session._id} 
              className="session-card"
              onClick={() => handleSessionClick(session)}
            >
              <div className="card-header">
                <h3>{session.company}</h3>
                <span className="pill">{session.role}</span>
              </div>
              <div className="card-body">
                <div className="meta-item">
                  <span className="meta-label">Role</span>
                  <span className="meta-value">
                    {session.role}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Date</span>
                    <span className="meta-value">
                    {new Date(session.createdAt).toISOString().split('T')[0]}
                    </span>
                </div>
              </div>
              <div className="card-footer">
                <button 
                  className="view-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionClick(session);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No sessions found</h3>
          <p>You haven't created any interview sessions yet</p>
        </div>
      )}
    </div>
  );
};

export default ViewPreviousAnalysis;