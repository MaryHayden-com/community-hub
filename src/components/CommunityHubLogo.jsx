// Community Hub logo — a network/atom mark with teal, orange and blue accents.
export default function CommunityHubLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer atom ellipse - teal */}
      <ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(60 24 24)" stroke="#0e8a8c" strokeWidth="2.4" />
      {/* Orbit - orange */}
      <ellipse cx="24" cy="24" rx="21" ry="9" stroke="#e2701b" strokeWidth="2.4" />
      {/* Orbit - blue */}
      <ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(120 24 24)" stroke="#2f6fd6" strokeWidth="2.4" />
      {/* Nodes */}
      <circle cx="24" cy="24" r="4.5" fill="#0e8a8c" />
      <circle cx="45" cy="24" r="3" fill="#e2701b" />
      <circle cx="11.9" cy="3.2" r="3" fill="#2f6fd6" />
      <circle cx="11.9" cy="44.8" r="3" fill="#0e8a8c" />
    </svg>
  );
}