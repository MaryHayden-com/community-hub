// Community Hub logo — a network/atom mark with teal, terracotta and blue accents.
export default function CommunityHubLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Orbit - teal (vertical-leaning) */}
      <ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(90 24 24)" stroke="#2C6A66" strokeWidth="2.4" />
      {/* Orbit - terracotta (horizontal) */}
      <ellipse cx="24" cy="24" rx="21" ry="9" stroke="#CC8554" strokeWidth="2.4" />
      {/* Orbit - blue (diagonal) */}
      <ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(60 24 24)" stroke="#3875D6" strokeWidth="2.4" />
      {/* Nucleus — teal */}
      <circle cx="24" cy="24" r="4.5" fill="#2C6A66" />
      {/* Electron — terracotta (right) */}
      <circle cx="45" cy="24" r="3" fill="#CC8554" />
      {/* Electron — blue (top) */}
      <circle cx="24" cy="3" r="3" fill="#3875D6" />
      {/* Electron — teal (bottom-left) */}
      <circle cx="11.9" cy="44.8" r="3" fill="#2C6A66" />
    </svg>
  );
}