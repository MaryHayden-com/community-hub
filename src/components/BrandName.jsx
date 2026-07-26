// Reusable styled brand name: "Hub4Community" with Hub4 in terracotta, Community in teal.
export default function BrandName({ className = "" }) {
  return (
    <span className={className} style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ color: "#D67D3E" }}>Hub4</span>
      <span style={{ color: "#2A7373" }}>Community</span>
    </span>
  );
}