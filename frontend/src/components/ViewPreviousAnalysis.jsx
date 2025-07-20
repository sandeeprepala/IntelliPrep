import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/MockInterviews.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ViewPreviousAnalysis = () => {
  const [sessions, setSessions] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('interview');
  const [expandedMockTest, setExpandedMockTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const local = localStorage.getItem('IntelliPrepUser');
        const user = local ? JSON.parse(local) : null;
        const token = user?.accessToken;
        const interviewRes = await axios.get(`${BACKEND_URL}/api/v1/previous-analysis`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const mockTestRes = await axios.get(`${BACKEND_URL}/api/v1/mock-test/feedback/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        setSessions(interviewRes.data.data);
        //console.log(mockTestRes.data.data);
        setMockTests(mockTestRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSessionClick = (session) => {
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
        <h2>Your Previous Interview / Mock Sessions</h2>
        <div>
          {/* <button
            className={filter === 'interview' ? 'active' : ''}
            onClick={() => setFilter('interview')}
          >Interview Analysis</button> */}
          {/* <button
            className={filter === 'mocktest' ? 'active' : ''}
            onClick={() => setFilter('mocktest')}
          >Mock Test Analysis</button> */}
        </div>
        <p className="sessions-count">
          {filter === 'interview'
            ? `${sessions.length} interview session${sessions.length !== 1 ? 's' : ''}`
            : `${mockTests.length} mock test${mockTests.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filter === 'interview' ? (
        sessions.length > 0 ? (
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
                    <span className="meta-value">{session.role}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{new Date(session.createdAt).toISOString().split('T')[0]}</span>
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
                    View Analysis
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
        )
      ) : (
        mockTests.length > 0 ? (
          <div className="sessions-grid">
            {mockTests.map((test) => (
              <div key={test._id} className="session-card mocktest-card">
                <div className="card-header">
                  <h3>{test.company}</h3>
                  <span className="pill">{test.role}</span>
                </div>
                <div className="card-body">
                  <div className="meta-item">
                    <span className="meta-label">Role</span>
                    <span className="meta-value">{test.role}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{new Date(test.createdAt).toISOString().split('T')[0]}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="view-button"
                    onClick={e => {
                      e.stopPropagation();
                      setExpandedMockTest(expandedMockTest === test._id ? null : test._id);
                    }}
                  >
                    {expandedMockTest === test._id ? 'Hide Analysis' : 'View Analysis'}
                  </button>
                </div>
                {expandedMockTest === test._id && (
                  <div className="mocktest-details">
                    <div className="meta-item">
                      <span className="meta-label">Score</span>
                      <span className="meta-value">{test.score} / {test.totalQuestions}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Feedback</span>
                      <span className="meta-value">{test.feedback}</span>
                    </div>
                    <div className="mocktest-analysis-questions">
                      <h4>Questions Analysis</h4>
                      <ul>
                        {test.answers.map((ans, idx) => (
                          <li key={idx} className="mocktest-analysis-question">
                            <div><strong>Q{idx + 1}:</strong> {ans.question}</div>
                            <div>Marked Answer: <span className={ans.selectedOption === ans.correctAnswer ? 'correct' : 'incorrect'}>{ans.selectedOption || <em>Not answered</em>}</span></div>
                            <div>Correct Answer: <span className="correct">{ans.correctAnswer}</span></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No mock tests found</h3>
            <p>You haven't completed any mock tests yet</p>
          </div>
        )
      )}
    </div>
  );
};

export default ViewPreviousAnalysis;