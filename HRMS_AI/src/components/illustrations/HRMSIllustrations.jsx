export const OnboardingIllustration = () => (
  <svg viewBox="0 0 600 400" className="illustration-svg">
    <rect width="600" height="400" fill="var(--color-bg-muted)" />
    
    {/* Background circles */}
    <circle cx="100" cy="80" r="80" fill="var(--color-primary)" opacity="0.15" />
    <circle cx="500" cy="300" r="100" fill="var(--color-primary)" opacity="0.1" />
    
    {/* Growth Arrow */}
    <path d="M 150 280 L 420 120" stroke="var(--color-primary)" strokeWidth="4" fill="none" opacity="0.3" />
    <polygon points="420,120 412,132 425,128" fill="var(--color-primary)" />
    
    {/* Person 1 - Bottom Left */}
    <circle cx="150" cy="260" r="18" fill="#2d3142" />
    <rect x="132" y="280" width="36" height="45" fill="#1a1f3a" rx="2" />
    <rect x="127" y="286" width="8" height="28" fill="#4a5568" />
    <rect x="141" y="286" width="8" height="28" fill="#4a5568" />
    <rect x="132" y="325" width="8" height="32" fill="#2d3142" />
    <rect x="160" y="325" width="8" height="32" fill="#2d3142" />
    
    {/* Person 2 - Middle */}
    <circle cx="300" cy="190" r="20" fill="#2d3142" />
    <rect x="280" y="213" width="40" height="50" fill="#1a1f3a" rx="2" />
    <rect x="274" y="219" width="9" height="32" fill="#4a5568" />
    <rect x="287" y="219" width="9" height="32" fill="#4a5568" />
    <rect x="280" y="263" width="9" height="38" fill="#2d3142" />
    <rect x="311" y="263" width="9" height="38" fill="#2d3142" />
    {/* Badge on Person 2 */}
    <circle cx="310" cy="205" r="10" fill="var(--color-primary)" />
    <text x="310" y="209" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">+</text>
    
    {/* Person 3 - Top Right */}
    <circle cx="450" cy="110" r="22" fill="#2d3142" />
    <rect x="428" y="135" width="44" height="55" fill="#1a1f3a" rx="2" />
    <rect x="422" y="142" width="10" height="34" fill="#4a5568" />
    <rect x="438" y="142" width="10" height="34" fill="#4a5568" />
    <rect x="428" y="190" width="10" height="42" fill="#2d3142" />
    <rect x="462" y="190" width="10" height="42" fill="#2d3142" />
    {/* Star on Person 3 */}
    <polygon points="458,128 460,134 467,134 462,138 464,144 458,140 452,144 454,138 449,134 456,134" fill="var(--color-primary)" />
    
    {/* Connecting lines */}
    <line x1="168" y1="245" x2="282" y2="205" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" strokeDasharray="4,4" />
    <line x1="320" y1="180" x2="428" y2="135" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" strokeDasharray="4,4" />
    
    {/* Decorative elements */}
    <circle cx="200" cy="140" r="6" fill="var(--color-primary)" opacity="0.2" />
    <circle cx="350" cy="150" r="5" fill="var(--color-primary)" opacity="0.3" />
    <circle cx="380" cy="220" r="5" fill="var(--color-primary)" opacity="0.25" />
  </svg>
);

export const AnalyticsIllustration = () => (
  <svg viewBox="0 0 600 400" className="illustration-svg">
    <rect width="600" height="400" fill="var(--color-bg-muted)" />
    
    {/* Background circles */}
    <circle cx="100" cy="80" r="80" fill="var(--color-primary)" opacity="0.15" />
    <circle cx="500" cy="300" r="100" fill="var(--color-primary)" opacity="0.1" />
    
    {/* Chart Bars */}
    <rect x="90" y="250" width="40" height="80" fill="var(--color-primary)" rx="4" opacity="0.8" />
    <rect x="150" y="220" width="40" height="110" fill="var(--color-primary)" rx="4" />
    <rect x="210" y="180" width="40" height="150" fill="var(--color-primary)" rx="4" opacity="0.9" />
    <rect x="270" y="140" width="40" height="190" fill="var(--color-primary)" rx="4" />
    <rect x="330" y="190" width="40" height="140" fill="var(--color-primary)" rx="4" opacity="0.85" />
    <rect x="390" y="230" width="40" height="100" fill="var(--color-primary)" rx="4" opacity="0.8" />
    <rect x="450" y="210" width="40" height="120" fill="var(--color-primary)" rx="4" opacity="0.9" />
    
    {/* Chart Line */}
    <polyline points="110,250 170,220 230,180 290,140 350,190 410,230 470,210" 
              stroke="var(--color-primary)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Data Points */}
    <circle cx="110" cy="250" r="5" fill="var(--color-primary)" />
    <circle cx="170" cy="220" r="5" fill="var(--color-primary)" />
    <circle cx="230" cy="180" r="5" fill="var(--color-primary)" />
    <circle cx="290" cy="140" r="5" fill="var(--color-primary)" />
    <circle cx="350" cy="190" r="5" fill="var(--color-primary)" />
    <circle cx="410" cy="230" r="5" fill="var(--color-primary)" />
    <circle cx="470" cy="210" r="5" fill="var(--color-primary)" />
    
    {/* Axis */}
    <line x1="70" y1="340" x2="500" y2="340" stroke="var(--color-primary)" strokeWidth="2" opacity="0.3" />
    <line x1="70" y1="120" x2="70" y2="340" stroke="var(--color-primary)" strokeWidth="2" opacity="0.3" />
    
    {/* Grid lines */}
    <line x1="70" y1="270" x2="500" y2="270" stroke="var(--color-primary)" strokeWidth="1" opacity="0.1" />
    <line x1="70" y1="200" x2="500" y2="200" stroke="var(--color-primary)" strokeWidth="1" opacity="0.1" />
  </svg>
);

export const TalentMatchingIllustration = () => (
  <svg viewBox="0 0 600 400" className="illustration-svg">
    <rect width="600" height="400" fill="var(--color-bg-muted)" />
    
    {/* Background circles */}
    <circle cx="100" cy="80" r="80" fill="var(--color-primary)" opacity="0.15" />
    <circle cx="500" cy="300" r="100" fill="var(--color-primary)" opacity="0.1" />
    
    {/* Left Profile Card */}
    <rect x="80" y="140" width="120" height="160" fill="white" rx="10" />
    <circle cx="140" cy="175" r="30" fill="#2d3142" />
    <rect x="95" y="220" width="90" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="95" y="235" width="90" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="95" y="250" width="60" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="95" y="265" width="90" height="5" fill="var(--color-primary)" rx="3" opacity="0.15" />
    
    {/* Right Profile Card */}
    <rect x="400" y="140" width="120" height="160" fill="white" rx="10" />
    <circle cx="460" cy="175" r="30" fill="#2d3142" />
    <rect x="415" y="220" width="90" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="415" y="235" width="90" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="415" y="250" width="60" height="7" fill="var(--color-primary)" rx="4" opacity="0.2" />
    <rect x="415" y="265" width="90" height="5" fill="var(--color-primary)" rx="3" opacity="0.15" />
    
    {/* Connection Line */}
    <line x1="200" y1="220" x2="400" y2="220" stroke="var(--color-primary)" strokeWidth="4" />
    
    {/* Match Circle with Checkmark */}
    <circle cx="300" cy="220" r="24" fill="var(--color-primary)" />
    <path d="M 292 220 L 298 226 L 312 214" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Sparkles */}
    <circle cx="250" cy="100" r="2.5" fill="var(--color-primary)" />
    <circle cx="350" cy="90" r="2.5" fill="var(--color-primary)" />
    <circle cx="280" cy="310" r="2.5" fill="var(--color-primary)" />
    <circle cx="420" cy="320" r="2.5" fill="var(--color-primary)" />
    
    {/* Decorative lines */}
    <line x1="240" y1="100" x2="258" y2="108" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5" />
    <line x1="342" y1="90" x2="360" y2="98" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
