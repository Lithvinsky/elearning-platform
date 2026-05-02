export function RatingSummary({ averageRating, count }) {
  if (!count || averageRating == null) {
    return <p className="meta-line rating-summary-empty">No learner ratings yet.</p>;
  }

  const pct = Math.min(100, Math.max(0, (averageRating / 5) * 100));

  return (
    <div className="rating-summary">
      <div className="rating-summary-top">
        <span className="rating-summary-score" aria-label={`Average ${averageRating} out of 5`}>
          {averageRating}
          <span className="rating-summary-outof">/5</span>
        </span>
        <div className="rating-stars-track" aria-hidden>
          <div className="rating-stars-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <p className="meta-line rating-summary-count">
        Based on {count} learner {count === 1 ? "rating" : "ratings"}
      </p>
    </div>
  );
}
