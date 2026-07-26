// Reusable styled brand name: "Hub4Community" with Hub4 in orange, Community in teal.
export default function BrandName({ className = "" }) {
  return (
    <span className={className} style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ color: "#E2701B" }}>Hub4</span>
      <span style={{ color: "#097275" }}>Community</span>
    </span>
  );
}