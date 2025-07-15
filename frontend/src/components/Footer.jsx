import '../style/Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
        
        <div className="social-links">
          <a href="https://twitter.com" aria-label="Twitter">
            <span className="social-icon twitter">𝕏</span>
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn">
            <span className="social-icon linkedin">in</span>
          </a>
          <a href="https://github.com" aria-label="GitHub">
            <span className="social-icon github">⌨</span>
          </a>
          <a href="https://instagram.com" aria-label="Instagram">
            <span className="social-icon instagram">IG</span>
          </a>
        </div>
        
        <div className="copyright">
          © {new Date().getFullYear()} IntelliPrep. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;