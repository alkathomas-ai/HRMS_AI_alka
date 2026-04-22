import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import ColorPalette from "../components/navbar/ColorPalette";
import ThemeToggle from "../components/navbar/ThemeToggle";
import { loginApi } from "../services/api";
import { Eye, EyeOff, ArrowRight, User, Lock } from "lucide-react";
import { OnboardingIllustration, AnalyticsIllustration, TalentMatchingIllustration } from "../components/illustrations/HRMSIllustrations";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const slides = [
    {
      component: OnboardingIllustration,
      title: "Onboarding New Talent with Digital HRMS",
      description: "Everything you need in an easily customizable dashboard"
    },
    {
      component: AnalyticsIllustration,
      title: "AI-Powered Analytics & Insights",
      description: "Make data-driven decisions with intelligent workforce analytics"
    },
    {
      component: TalentMatchingIllustration,
      title: "Smart Talent Matching System",
      description: "Find the perfect candidate with AI-powered search technology"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await loginApi({
            username: trimmedUsername,
            password: trimmedPassword
          });
      const token = response.access_token || response.token;
      if (token) {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("username", username);
        
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', trimmedUsername);
          localStorage.setItem('rememberedPassword', trimmedPassword);
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
        }
      }
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      {/* <div className="theme-controls">
        <ThemeToggle />
        <ColorPalette />
      </div> */}
      <div className="login-wrapper">
        <div className="login-info">
          <div className="info-slides">
            {slides.map((slide, index) => {
              const IllustrationComponent = slide.component;
              return (
                <div
                key={index}
                className={`slide-content ${index === currentSlide ? 'active' : ''}`}
                >
                  <div className="illustration">
                    <IllustrationComponent />
                  </div>
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              );
            })}
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
                {error && <div className="login-error-message">{error}</div>}
      
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                </div>
      
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
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
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
      
                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
      
                <button type="submit" className="login-button">
                  Login
                  <ArrowRight size={20} />
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
