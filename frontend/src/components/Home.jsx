import '../style/Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('IntelliPrepUser');
    if (isLoggedIn) {
      navigate('/interviews');  // Send logged-in users to prep
    } else {
      navigate('/login');  // Send others to login
    }
  };

  return (
    <div className="home-screen">
      <div className="hero-container">
        <h1>Welcome to <span>IntelliPrep</span></h1>
        <p className="hero-text">
          Your AI-powered interview preparation platform. Master coding challenges, 
          practice mock interviews, and optimize your resume to land your dream job.
        </p>
        <button className="cta-button" onClick={handleGetStarted}>
          Get Started →
        </button>
        
        <div className="features-preview">
          <div className="feature-bubble">Interview Resources</div>
          <div className="feature-bubble">AI Mock Interviews</div>
          <div className="feature-bubble">Resume-JD Matcher</div>
        </div>
      </div>
    </div>
  );
}

export default Home;