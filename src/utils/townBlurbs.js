// Short, real, locally-accurate intros for towns — used on TownPage (body + meta).
// Falls back to a warm templated line using the county for towns without a curated blurb.

const TOWN_BLURBS = {
  "Bandon": "A bustling market town on the River Bandon in West Cork, known for its food scene, independent shops and the historic Bandon Bridge.",
  "Clonakilty": "An award-winning West Cork town, famous for its colourful streets, traditional music and the Clonakilty black pudding that carries its name.",
  "Kinsale": "Ireland's gourmet capital — a picturesque harbour town at the mouth of the Bandon estuary, with sailing, food and two 17th-century forts.",
  "Skibbereen": "A lively market town on the River Ilen in West Cork, proud of its food scene, heritage and its place at the heart of the Wild Atlantic Way.",
  "Bantry": "A vibrant West Cork town overlooking Bantry Bay, home to Bantry House, a weekly market and the gateway to the Sheep's Head and Beara peninsulas.",
  "Cork City": "Ireland's second city, built on the River Lee — a foodie, friendly place of old quays, independent shops and the famous English Market.",
  "Cobh": "A colourful harbour town on Great Island, the last port of call for the Titanic and framed by the spire of St Colman's Cathedral.",
  "Midleton": "A market town in east Cork, home to the world-famous Jameson Distillery and a popular farmers' market.",
  "Youghal": "A historic walled port at the mouth of the River Blackwater, with sandy beaches, a medieval tower house and a lively seafront.",
  "Macroom": "A market town at the gateway to West Cork, straddling the River Sullane and a meeting point of old and new Ireland.",
  "Fermoy": "A riverside town on the Blackwater in north Cork, known for its rowing, fishing and family-run shops.",
  "Mallow": "A north Cork market town on the Blackwater, home to Mallow Castle and a strong racing and agricultural heritage.",
  "Dunmanway": "A market town in West Cork on the River Bandon, a traditional stopping point on the road west to Bantry.",
  "Carrigaline": "A fast-growing town just south of Cork City, sitting on the Owenabue river with a strong community and easy reach of Cork Harbour.",
  "Schull": "A vibrant sailing village on the Mizen peninsula in West Cork, with a working pier, a planetarium and views across to Cape Clear.",
  "Castletownbere": "One of Ireland's main fishing ports, on the Beara peninsula in West Cork — dramatic scenery and a busy working harbour.",
  "Mitchelstown": "A planned estate town in north Cork, gateway to the Galtee Mountains and known for its limestone square.",
  "Ballydehob": "A bohemian village in West Cork, famous for its pubs, its artists and the old Schull railway.",
};

export function getTownBlurb(town, county) {
  if (TOWN_BLURBS[town]) return TOWN_BLURBS[town];
  return `${town} is a town in Co. ${county}, with its own local businesses, clubs and community events — all gathered here in one place.`;
}

// Short, warm per-area welcome shown at the top of each TownPage.
// Curated towns get a personalised line; every other area gets a friendly
// templated welcome so no town is left without an intro.
export function getTownWelcome(town, county) {
  const blurb = TOWN_BLURBS[town];
  if (blurb) return `Welcome to ${town} — ${blurb}`;
  return `Welcome to ${town}, a local area in Co. ${county}. Here you'll find local businesses, clubs, community services, schools and events all gathered together in one place.`;
}