import { Link } from "react-router-dom";

export function AppLogo({ to = "/", size = 36, showText = true }) {
  return (
    <Link to={to} className="logo-link" aria-label="LearnEase Pro home">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img">
        <circle cx="24" cy="24" r="20" stroke="#8B5CF6" strokeWidth="3" />
        <circle cx="24" cy="24" r="10" stroke="#8B5CF6" strokeWidth="3" opacity="0.8" />
        <circle cx="36" cy="14" r="4" fill="#8B5CF6" />
      </svg>
      {showText ? (
        <span>
          <strong>LearnEase Pro</strong>
        </span>
      ) : null}
    </Link>
  );
}
