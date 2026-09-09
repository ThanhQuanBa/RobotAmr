import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
  Bus, Search, Brain, Shield, Radio, Star,
  ArrowRight, Clock, MapPin, Users, ChevronRight,
  Mail, Phone, Globe, ExternalLink
} from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const featuredTours = [
    {
      id: 1,
      title: 'Grand Campus Overview',
      description: 'A comprehensive journey through main academic halls, the central plaza, and student union.',
      image: '/tour-campus.jpg',
      duration: '2 Hrs',
      stops: 12,
      likes: 248,
    },
    {
      id: 2,
      title: 'Innovation Labs',
      description: 'Explore state-of-the-art engineering facilities, robotics centers, and collaborative working spaces.',
      image: '/tour-labs.jpg',
      duration: '1.5 Hrs',
      stops: 8,
      likes: 186,
    },
    {
      id: 3,
      title: 'Garden & Outdoor',
      description: 'Visit the lush gardens, aquatic center, running trails, and recreational fields.',
      image: '/tour-garden.jpg',
      duration: '1 Hr',
      stops: 6,
      likes: 312,
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Prospective Student',
      text: '"The autonomous tour was incredible! I was amazed by the AMR\'s smooth navigation. It felt like having a personal guide that knows every corner of the campus."',
      rating: 5
    },
    {
      name: 'Mark Smith',
      role: 'Campus Visitor',
      text: '"As an educator, seeing the new innovative labs via the AMR was a highlight. The technology is state-of-the-art, and the real-time AI guide answered all my questions."',
      rating: 5
    },
    {
      name: 'Amy Lee',
      role: 'Alumni',
      text: '"Wanted to Re-Explore, the labs and campus have changed so much. The smart robot tour showcasing all the new facilities felt amazing!"',
      rating: 5
    }
  ];

  return (
    <div className="home-page">
      {/* ---- NAVBAR ---- */}
      <nav className="home-nav" id="home-nav">
        <div className="home-nav-inner">
          <div className="home-logo" onClick={() => navigate('/')}>
            <Bus size={26} />
            <span>SmartBus</span>
          </div>
          <div className="home-nav-links">
            <a href="#home" className="nav-active">Home</a>
            <a href="#features">Features</a>
            <a href="#tours">Explore</a>
            <a href="#testimonials">Safety</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="home-nav-actions">
            {user ? (
              <button className="btn-get-started" onClick={() => navigate(user.role === 'visitor' ? '/booking' : '/dashboard')}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button className="btn-signin" onClick={() => navigate('/login')}>Sign in</button>
                <button className="btn-get-started" onClick={() => navigate('/login')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ---- HERO SECTION ---- */}
      <section className="hero-section" id="home">
        <div className="hero-bg">
          <div className="hero-gradient-overlay" />
        </div>
        <div className="hero-content">
          <h1>Discover Your Path</h1>
          <p className="hero-subtitle">
            The most interactive and immersive way to explore our campus with an autonomous AMR
            digital tour experience. Find the perfect route to every spot on the campus.
          </p>
          <div className="hero-search-bar">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Where would you like to explore today?"
              />
            </div>
            <button className="btn-find-tours" onClick={() => navigate('/login')}>
              Find Tours
            </button>
          </div>
        </div>
      </section>

      {/* ---- WHY CHOOSE US ---- */}
      <section className="why-section" id="features">
        <div className="why-inner">
          <div className="why-image">
            <img src="/amr-robot.jpg" alt="SmartBus AMR Robot" loading="lazy" />
          </div>
          <div className="why-content">
            <h2>Why Choose SmartBus?</h2>
            <p className="why-subtitle">
              Experience the future of campus exploration with our cutting-edge
              autonomous technology.
            </p>
            <div className="why-features-grid">
              <div className="why-feature-card active">
                <div className="why-feature-icon">
                  <Brain size={22} />
                </div>
                <div className="why-feature-text">
                  <h4>AI-Powered</h4>
                  <p>Smart navigation with real-time AI guide answering your questions along the journey.</p>
                </div>
              </div>
              <div className="why-feature-card">
                <div className="why-feature-icon safe">
                  <Shield size={22} />
                </div>
                <div className="why-feature-text">
                  <h4>Safe & Secure</h4>
                  <p>Advanced sensor suite and LIDAR ensuring safe navigation with obstacle avoidance.</p>
                </div>
              </div>
              <div className="why-feature-card">
                <div className="why-feature-icon immersive">
                  <Radio size={22} />
                </div>
                <div className="why-feature-text">
                  <h4>Real-time Tracking</h4>
                  <p>Digital Twin visualization with live telemetry data streaming for complete transparency.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURED TOURS ---- */}
      <section className="tours-section" id="tours">
        <div className="tours-inner">
          <div className="section-header">
            <h2>Featured Tours</h2>
            <p>Curated routes for the best campus experience.</p>
          </div>
          <div className="tours-grid">
            {featuredTours.map(tour => (
              <div className="tour-card" key={tour.id}>
                <div className="tour-card-image">
                  <img src={tour.image} alt={tour.title} loading="lazy" />
                </div>
                <div className="tour-card-body">
                  <h3>{tour.title}</h3>
                  <p>{tour.description}</p>
                  <div className="tour-card-stats">
                    <span><Clock size={14} /> {tour.duration}</span>
                    <span><MapPin size={14} /> {tour.stops} Stops</span>
                  </div>
                  <div className="tour-card-footer">
                    <div className="tour-likes">
                      <span>❤️ {tour.likes}</span>
                      <span>⭐ {tour.stops} Stops</span>
                    </div>
                    <button className="btn-view-details" onClick={() => navigate('/login')}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-inner">
          <div className="section-header">
            <h2>Visitor Experiences</h2>
            <p>What our explorers are saying about their journey.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name.charAt(0)}</div>
                  <div className="author-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Book your autonomous tour today and discover the campus like never before with SmartBus AMR technology.</p>
            <div className="cta-buttons">
              <button className="btn-book-now" onClick={() => navigate('/login')}>
                Book Now
              </button>
              <button className="btn-learn-more" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="home-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-col footer-brand">
              <div className="footer-logo">
                <Bus size={22} />
                <span>SmartBus</span>
              </div>
              <p>Pioneering the future of autonomous campus exploration with AMR technology, accessible for all.</p>
              <div className="footer-socials">
                <a href="#" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#tours">Tours</a></li>
                <li><a href="#testimonials">Safety</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Accessibility</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 SmartBus AMR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
