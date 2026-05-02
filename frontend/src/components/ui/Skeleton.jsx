export function Skeleton({ className = "", lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="skeleton-stack" aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton-line ${className}`.trim()} />
        ))}
      </div>
    );
  }
  return <div className={`skeleton-block ${className}`.trim()} aria-hidden />;
}
