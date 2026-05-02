/**
 * Decorative SVG for dashboard hero — no semantic meaning (aria-hidden).
 */
export function HeroIllustration({ className = "" }) {
  return (
    <div className={`hero-illustration ${className}`.trim()} aria-hidden>
      <svg viewBox="0 0 480 300" className="hero-illustration-svg" role="img">
        <defs>
          <linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="hg2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="hg3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background blobs */}
        <ellipse cx="380" cy="60" rx="90" ry="70" fill="url(#hg2)" className="hero-float hero-float--a" />
        <ellipse cx="80" cy="220" rx="110" ry="85" fill="url(#hg3)" className="hero-float hero-float--b" />
        <path
          d="M200 40 Q 340 20 420 120 Q 320 200 180 160 Q 120 100 200 40"
          fill="url(#hg1)"
          opacity="0.85"
          className="hero-float hero-float--c"
        />

        {/* Book / screen stack */}
        <g filter="url(#softGlow)" transform="translate(140, 70)">
          <rect x="0" y="30" width="200" height="140" rx="12" fill="var(--white, #fff)" stroke="#c4b5fd" strokeWidth="2" />
          <rect x="14" y="46" width="172" height="10" rx="3" fill="#e9d5ff" opacity="0.9" />
          <rect x="14" y="64" width="120" height="8" rx="2" fill="#ede9fe" />
          <rect x="14" y="80" width="160" height="8" rx="2" fill="#f5f3ff" />
          <rect x="14" y="96" width="100" height="8" rx="2" fill="#ede9fe" />
          <circle cx="170" cy="130" r="22" fill="#8b5cf6" opacity="0.9" />
          <path d="M162 130 L168 136 L182 120" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating cards */}
        <g className="hero-float hero-float--d" transform="translate(30, 40)">
          <rect width="88" height="56" rx="10" fill="var(--white, #fff)" stroke="#ddd6fe" strokeWidth="1.5" opacity="0.95" />
          <rect x="10" y="14" width="40" height="6" rx="2" fill="#c4b5fd" />
          <rect x="10" y="26" width="68" height="5" rx="2" fill="#ede9fe" />
        </g>
        <g className="hero-float hero-float--e" transform="translate(330, 160)">
          <rect width="100" height="64" rx="12" fill="var(--white, #fff)" stroke="#a78bfa" strokeWidth="1.5" opacity="0.92" />
          <circle cx="50" cy="28" r="12" fill="#8b5cf6" opacity="0.35" />
          <rect x="18" y="44" width="64" height="6" rx="2" fill="#e9d5ff" />
        </g>

        {/* Spark dots */}
        <circle cx="260" cy="48" r="4" fill="#8b5cf6" className="hero-spark" />
        <circle cx="420" cy="200" r="3" fill="#a78bfa" className="hero-spark hero-spark--delay" />
        <circle cx="60" cy="100" r="3" fill="#6366f1" className="hero-spark hero-spark--delay2" />
      </svg>
    </div>
  );
}
