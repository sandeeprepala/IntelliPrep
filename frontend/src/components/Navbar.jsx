import { Link } from 'react-router-dom';
import '../style/Navbar.css';
import { useEffect } from 'react';
import { useState } from 'react';

const Navbar = () => {
  // Safely get and parse user data
  const [user,setUser] = useState(null);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" className="logo-text">IntelliPrep</Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          
          <Link to="/resume-review" className="nav-link">Resume JD Matcher</Link>
          <Link to="/interviews" className="nav-link">Mock Interviews</Link>
          <Link to="/previous-analysis" className="nav-link">Interview Analysis</Link>
          <Link to="/interview-prep" className="nav-link">Resources</Link>
          <Link to="/profile" className="signup-btn">Profile</Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;