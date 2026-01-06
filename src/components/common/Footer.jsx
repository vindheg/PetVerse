import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, MailIcon, FacebookIcon, InstagramIcon, TwitterIcon, ChatIcon } from './Icons';

const Footer = () => {
  return (
    <footer className="footer-modern">
      <div className="footer-container">

        {/* Column 1: Brand & Logo */}
        <div className="footer-col">
          <div className="footer-logo">
            <span className="footer-brand-name">PetVerse</span>
          </div>
          <p className="footer-desc">
            A house is not a home without paw prints. We are your one-stop destination for adoption, care, and community.
          </p>
          <div className="contact-item">
            <PhoneIcon size={16} color="var(--primary)" />
            <span>+91 9876-543-210</span>
          </div>
          <div className="contact-item">
            <MailIcon size={16} color="var(--primary)" />
            <a href="mailto:teampetverse@gmail.com">teampetverse@gmail.com</a>
          </div>
        </div>

        {/* Column 2: Company */}
        <div className="footer-col">
          <h3>Company</h3>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Column 3: Our Features */}
        <div className="footer-col">
          <h3>Our Features</h3>
          <ul className="footer-links">
            <li><Link to="/Adopt">Adopt a Pet</Link></li>
            <li><Link to="/lost-found">Lost & Found</Link></li>
            <li><Link to="/community">Community Chat</Link></li>
            <li><Link to="/volunteer">Volunteer</Link></li>
          </ul>
        </div>

        {/* Column 4: Stay Connected */}
        <div className="footer-col">
          <h3>Stay Connected</h3>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1rem' }}>
            Follow us on social media for the latest updates and happy tails.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
              <FacebookIcon size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Twitter">
              <TwitterIcon size={18} />
            </a>
            <a href="/community" className="social-btn" aria-label="Chat">
              <ChatIcon size={18} />
            </a>
          </div>
        </div>

      </div>

      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} PetVerse Team. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;