import '../style/About.css';

function About() {
  return (
    <div className="about-screen">
      <div className="about-container">
        <h1>Why Choose <span>IntelliPrep</span></h1>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              Democratize interview prep with accessible, personalized tools that 
              help candidates showcase their true potential.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>What We Offer</h3>
            <p>
              Technical practice, behavioral coaching, and resume optimization 
              tailored to your target companies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Our Story</h3>
            <p>
              Created by hiring managers who saw candidates struggle with 
              unbalanced preparation.
            </p>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Users Helped</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Company Guides</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About;