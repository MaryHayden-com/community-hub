// Define the canonical type order for all listings
export const TYPE_ORDER = {
  "Business": 0,
  "Community Services": 1,
  "Club & Group": 2,
  "Education": 3,
  "What's On": 4,
};

// Sort function to apply consistent type ordering
export function sortByTypeOrder(listings) {
  return [...listings].sort((a, b) => {
    const typeOrder = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    if (typeOrder !== 0) return typeOrder;
    // Within same type, sort alphabetically by name
    return (a.name || "").localeCompare(b.name || "");
  });
}