import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import ColorPalette from "../components/navbar/ColorPalette";
import ThemeToggle from "../components/navbar/ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: "person_search",
      title: "Onboarding New Talent with Digital HRMS",
      description: "Everything you need in an easily customizable dashboard"
    },
    {
      icon: "analytics",
      title: "AI-Powered Analytics & Insights",
      description: "Make data-driven decisions with intelligent workforce analytics"
    },
    {
      icon: "groups",
      title: "Smart Talent Matching System",
      description: "Find the perfect candidate with AI-powered search technology"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (email && password) {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="theme-controls">
        <ThemeToggle />
        <ColorPalette />
      </div>
      <div className="login-wrapper">
        <div className="login-info">
          <div className="info-slides">
            {slides.map((slide, index) => (
              <div
              key={index}
              className={`slide-content ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="illustration">
                  <div className="illustration-circle">
                    <span className="material-symbols-outlined">{slide.icon}</span>
                  </div>
                </div>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
              </div>
            ))}
          </div>

          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <span className="lg-logo-text">HRMS.AI</span>
              </div>
              <h1>Welcome Back !</h1>
              <p>Please enter your details</p>
            </div>
  
            <div>
              <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>}
      
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                </div>
      
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
      
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
      
                <button type="submit" className="login-button">
                  Login
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>
            </div>
  
            <div className="login-footer">
              <p>Don't have an account? <a href="#">Sign up</a></p>
            </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default Login;
