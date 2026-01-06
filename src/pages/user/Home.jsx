import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PawIcon, ArrowRightIcon } from '../../components/common/Icons';
import './Home.css';

// Custom hook for scroll reveal animations
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: options.threshold || 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal({ threshold: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  // Scroll reveal refs for each section
  const [missionRef, missionVisible] = useScrollReveal();
  const [bentoRef, bentoVisible] = useScrollReveal();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-catchy">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Find Your Perfect</span>
            <br />Companion Today
          </h1>
          <p>
            Join thousands of families who've discovered unconditional love through adoption.
            Every adoption saves two lives—the pet you adopt and the one that takes their place.
          </p>
          <div className="hero-buttons">
            <Link to="/Adopt" className="btn-primaryhero">
              <span>Find a Pet</span>
              <PawIcon size={18} />
            </Link>
            <Link to="/volunteer" className="btn-outlinehero">Join the Mission</Link>
          </div>
        </div>
      </header>

      {/* Mission */}
      <section
        className={`mission-impact ${missionVisible ? 'reveal-visible' : ''}`}
        ref={missionRef}
      >
        <div className="mission-content-full">
          <span className="mission-label">OUR PROMISE</span>
          <h2>
            Bridging the gap between <span className="highlight-teal">hope</span> and <span className="highlight-orange">home.</span>
          </h2>
          <p>
            PetVerse isn't just a platform; it's a lifeline. We exist to simplify the chaos of animal welfare
            by connecting shelters, volunteers, and adopters in one seamless ecosystem.
            Because every wag, purr, and chirp deserves a chance to be heard.
          </p>
          <div className="impact-stats-row">
            <div className="stat-card glass-effect">
              <strong className="stat-number color-teal">
                <AnimatedCounter end={500} suffix="+" />
              </strong>
              <span className="stat-label">Lives Saved</span>
            </div>
            <div className="stat-card glass-effect">
              <strong className="stat-number color-purple">
                <AnimatedCounter end={200} suffix="+" />
              </strong>
              <span className="stat-label">Pets Waiting</span>
            </div>
            <div className="stat-card glass-effect">
              <strong className="stat-number color-orange">
                <AnimatedCounter end={120} suffix="+" />
              </strong>
              <span className="stat-label">Volunteers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section
        className={`bento-section ${bentoVisible ? 'reveal-visible' : ''}`}
        ref={bentoRef}
      >
        <div className="bento-grid">
          <div className="bento-box large-box adopt-box">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>Adopt a Pet</h3>
              <p>Your new best friend is waiting for you.</p>
              <Link to="/Adopt" className="bento-btn-glass">
                <span>Browse Pets</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
          <div className="bento-box medium-box bg-volunteer">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>Volunteer</h3>
              <p>Be the hero they need.</p>
              <Link to="/volunteer" className="text-link-white">
                <span>Join Us</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="bento-box medium-box bg-donate">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>Donate</h3>
              <p>Fuel the mission.</p>
              <Link to="/donate" className="text-link-white">
                <span>Support</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="bento-box medium-box bg-community">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>Community</h3>
              <p>Connect with pet lovers.</p>
              <Link to="/community" className="text-link-white">
                <span>Chat Now</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="bento-box medium-box bg-lostfound">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>Lost & Found</h3>
              <p>Reunite families.</p>
              <Link to="/lost-found" className="text-link-white">
                <span>Report</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="bento-box medium-box bg-adoptions">
            <div className="box-overlay"></div>
            <div className="box-content">
              <h3>My Journey</h3>
              <p>Track your adoption status.</p>
              <Link to="/myadoptions" className="text-link-white">
                <span>View</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;