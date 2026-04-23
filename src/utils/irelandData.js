// All 32 counties of Ireland (26 Republic + 6 Northern Ireland)
export const IRELAND_COUNTIES = [
  {
    county: "Antrim",
    towns: ["Belfast", "Antrim", "Ballymena", "Ballyclare", "Carrickfergus", "Larne", "Lisburn", "Newtownabbey", "Randalstown", "Whitehead"]
  },
  {
    county: "Armagh",
    towns: ["Armagh City", "Craigavon", "Lurgan", "Portadown", "Banbridge", "Keady", "Markethill", "Tandragee"]
  },
  {
    county: "Down",
    towns: ["Downpatrick", "Bangor", "Newry", "Newtownards", "Ballynahinch", "Comber", "Dromore", "Kilkeel", "Newcastle", "Rathfriland", "Warrenpoint"]
  },
  {
    county: "Fermanagh",
    towns: ["Enniskillen", "Belleek", "Irvinestown", "Kesh", "Lisnaskea", "Maguiresbridge", "Rosslea"]
  },
  {
    county: "Londonderry",
    towns: ["Derry City", "Coleraine", "Limavady", "Maghera", "Magherafelt", "Portstewart", "Castledawson", "Dungiven"]
  },
  {
    county: "Tyrone",
    towns: ["Omagh", "Strabane", "Dungannon", "Cookstown", "Ballygawley", "Castlederg", "Fivemiletown", "Stewartstown"]
  },
  {
    county: "Carlow",
    towns: ["Carlow", "Muinebheag", "Tullow", "Hacketstown", "Leighlinbridge", "Borris", "Rathvilly", "Bagenalstown"]
  },
  {
    county: "Cavan",
    towns: ["Cavan", "Bailieborough", "Belturbet", "Virginia", "Cootehill", "Ballyjamesduff", "Kingscourt", "Ballyconnell"]
  },
  {
    county: "Clare",
    towns: ["Ennis", "Shannon", "Kilrush", "Kilkee", "Ennistymon", "Killaloe", "Miltown Malbay", "Lisdoonvarna", "Scarriff", "Sixmilebridge", "Newmarket-on-Fergus"]
  },
  {
    county: "Cork",
    towns: [
      "Cork City", "Bandon", "Bantry", "Clonakilty", "Cobh", "Fermoy", "Kinsale", "Macroom",
      "Mallow", "Midleton", "Skibbereen", "Youghal", "Carrigaline", "Dunmanway", "Kanturk",
      "Millstreet", "Mitchelstown", "Passage West", "Schull", "Castletownbere",
      "Baltimore", "Crosshaven", "Glengarriff", "Drimoleague", "Dunmore East",
      "Ballincollig", "Blarney", "Carrigtwohill", "Glanmire", "Little Island",
      "Ovens", "Tower", "Whitegate",
      // Bandon Townlands / surrounding areas
      "Ballinadee", "Ballinhassig", "Barryroe", "Brinny", "Clogagh", "Desert",
      "Enniskeane", "Kilbrogan", "Kilmacsimon", "Knockavilla", "Murragh",
      "Templemartin", "Upton", "Ballinphellic", "Kilpatrick", "Innishannon",
      "Ballineen", "Lissarda", "Crookstown", "Aherla", "Waterfall",
      "Minane Bridge", "Nohoval", "Ballyfeard", "Carrigadrohid",
      "Aghabullogue", "Donoughmore", "Cloughduv", "Dripsey",
      "Coachford", "Codrum", "Kilmurry", "Farran", "Dooniskey"
    ]
  },
  {
    county: "Donegal",
    towns: ["Letterkenny", "Donegal Town", "Buncrana", "Ballyshannon", "Bundoran", "Carndonagh", "Dungloe", "Killybegs", "Lifford", "Raphoe", "Ardara", "Dunfanaghy", "Glenties"]
  },
  {
    county: "Dublin",
    towns: ["Dublin City", "Swords", "Tallaght", "Balbriggan", "Blanchardstown", "Clondalkin", "Dún Laoghaire", "Finglas", "Lucan", "Malahide", "Portmarnock", "Rush", "Santry", "Stillorgan", "Raheny"]
  },
  {
    county: "Galway",
    towns: ["Galway City", "Athenry", "Ballinasloe", "Clifden", "Loughrea", "Portumna", "Tuam", "Gort", "Headford", "Oranmore", "Oughterard", "Glenamaddy", "Mountbellew"]
  },
  {
    county: "Kerry",
    towns: ["Tralee", "Killarney", "Listowel", "Kenmare", "Dingle", "Cahirciveen", "Killorglin", "Castleisland", "Abbeyfeale", "Ballybunion", "Castlegregory", "Sneem", "Waterville"]
  },
  {
    county: "Kildare",
    towns: ["Naas", "Athy", "Celbridge", "Clane", "Kilcock", "Kildare", "Leixlip", "Maynooth", "Monasterevin", "Newbridge", "Prosperous", "Rathangan", "Sallins"]
  },
  {
    county: "Kilkenny",
    towns: ["Kilkenny City", "Callan", "Castlecomer", "Graiguenamanagh", "Mullinavat", "Pilltown", "Thomastown", "Urlingford", "Freshford", "Gowran", "Ballyragget"]
  },
  {
    county: "Laois",
    towns: ["Portlaoise", "Abbeyleix", "Mountmellick", "Mountrath", "Portarlington", "Rathdowney", "Stradbally", "Durrow", "Borris-in-Ossory", "Ballylinan"]
  },
  {
    county: "Leitrim",
    towns: ["Carrick-on-Shannon", "Ballinamore", "Drumshanbo", "Manorhamilton", "Mohill", "Ballyconnell", "Drumkeerin", "Dromahair"]
  },
  {
    county: "Limerick",
    towns: ["Limerick City", "Adare", "Kilmallock", "Nenagh", "Newcastle West", "Rathkeale", "Abbeyfeale", "Askeaton", "Bruff", "Cappamore", "Killaloe", "Croom", "Patrickswell"]
  },
  {
    county: "Longford",
    towns: ["Longford Town", "Ballymahon", "Edgeworthstown", "Granard", "Lanesborough", "Strokestown", "Kenagh"]
  },
  {
    county: "Louth",
    towns: ["Drogheda", "Dundalk", "Ardee", "Carlingford", "Dunleer", "Castlebellingham", "Blackrock", "Termonfeckin"]
  },
  {
    county: "Mayo",
    towns: ["Castlebar", "Ballina", "Westport", "Ballinrobe", "Belmullet", "Claremorris", "Crossmolina", "Killala", "Louisburgh", "Swinford", "Tuam", "Foxford", "Newport", "Knock"]
  },
  {
    county: "Meath",
    towns: ["Navan", "Ashbourne", "Athboy", "Duleek", "Dunboyne", "Dunshaughlin", "Kells", "Nobber", "Oldcastle", "Ratoath", "Slane", "Trim", "Bettystown", "Laytown"]
  },
  {
    county: "Monaghan",
    towns: ["Monaghan Town", "Carrickmacross", "Castleblayney", "Clones", "Ballybay", "Glaslough", "Emyvale"]
  },
  {
    county: "Offaly",
    towns: ["Tullamore", "Birr", "Banagher", "Edenderry", "Clara", "Kilbeggan", "Ferbane", "Portarlington"]
  },
  {
    county: "Roscommon",
    towns: ["Roscommon Town", "Boyle", "Castlerea", "Ballaghaderreen", "Strokestown", "Athlone", "Elphin", "Frenchpark"]
  },
  {
    county: "Sligo",
    towns: ["Sligo Town", "Ballymote", "Collooney", "Enniscrone", "Riverstown", "Tobercurry", "Strandhill", "Mullaghmore"]
  },
  {
    county: "Tipperary",
    towns: ["Clonmel", "Nenagh", "Thurles", "Tipperary Town", "Cahir", "Carrick-on-Suir", "Cashel", "Dungarvan", "Fethard", "Roscrea", "Templemore", "Borrisokane", "Borrisoleigh"]
  },
  {
    county: "Waterford",
    towns: ["Waterford City", "Dungarvan", "Tramore", "Lismore", "Dunmore East", "Cappoquin", "Kilmacthomas", "Portlaw", "Tallow", "Ardmore"]
  },
  {
    county: "Westmeath",
    towns: ["Athlone", "Mullingar", "Moate", "Castlepollard", "Kilbeggan", "Kinnegad", "Tyrrellspass", "Rochfortbridge"]
  },
  {
    county: "Wexford",
    towns: ["Wexford Town", "Enniscorthy", "Gorey", "New Ross", "Bunclody", "Ferns", "Kilmore Quay", "Rosslare", "Taghmon", "Courtown"]
  },
  {
    county: "Wicklow",
    towns: ["Wicklow Town", "Arklow", "Bray", "Carnew", "Enniskerry", "Greystones", "Newtownmountkennedy", "Rathdrum", "Tinahely", "Blessington", "Roundwood"]
  }
];

export const ALL_COUNTIES = IRELAND_COUNTIES.map(c => c.county);

export function getTownsForCounty(county) {
  const found = IRELAND_COUNTIES.find(c => c.county === county);
  return found ? found.towns : [];
}