// Hub4Community logo — interlocking atom rings using Mary Hayden brand colours.
// Zest #E2701B · Atoll #097275 · Brick #911B1B
export default function CommunityHubLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Horizontal orbit — Atoll (teal) */}
      <ellipse cx="24" cy="24" rx="22" ry="8.5" stroke="#097275" strokeWidth="2.5" />
      {/* Diagonal orbit 60° — Zest (orange) */}
      <ellipse cx="24" cy="24" rx="22" ry="8.5" transform="rotate(60 24 24)" stroke="#E2701B" strokeWidth="2.5" />
      {/* Diagonal orbit 120° — Brick (red) */}
      <ellipse cx="24" cy="24" rx="22" ry="8.5" transform="rotate(120 24 24)" stroke="#911B1B" strokeWidth="2.5" />
      {/* Nucleus — Atoll */}
      <circle cx="24" cy="24" r="4" fill="#097275" />
    </svg>
  );
}