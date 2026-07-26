// All 32 counties of Ireland (26 Republic + 6 Northern Ireland)
// Each county has 'towns' (larger settlements) and 'villages' (smaller settlements)
export const IRELAND_COUNTIES = [
  {
    county: "Antrim",
    towns: ["Belfast", "Antrim", "Ballymena", "Ballyclare", "Carrickfergus", "Larne", "Lisburn", "Newtownabbey"],
    villages: ["Randalstown", "Whitehead", "Ahoghill", "Armoy", "Ballycastle", "Ballinderry", "Ballyrobert", "Broughshane", "Buckna", "Bushmills", "Carnlough", "Clough", "Crumlin", "Cullybackey", "Cushendall", "Cushendun", "Dervock", "Doagh", "Dundrod", "Dunloy", "Glenarm", "Glenavy", "Gracehill", "Kells", "Kilrea", "Ligoniel", "Millisle", "Mosside", "Parkgate", "Portglenone", "Rasharkin", "Rathcoole", "Stoneyford", "Templepatrick", "Toomebridge", "Upperlands", "Waterfoot", "Whitehouse"]
  },
  {
    county: "Armagh",
    towns: ["Armagh City", "Craigavon", "Lurgan", "Portadown", "Banbridge", "Keady", "Markethill", "Tandragee"],
    villages: ["Bessbrook", "Blackwatertown", "Camlough", "Crossmaglen", "Cullyhanna", "Darkley", "Forkhill", "Hamiltonsbawn", "Jonesborough", "Killylea", "Loughgall", "Loughgilly", "Middletown", "Milford", "Mountnorris", "Newtownhamilton", "Poyntzpass", "Richhill", "Silverbridge", "Tynan", "Whitecross"]
  },
  {
    county: "Down",
    towns: ["Downpatrick", "Bangor", "Newry", "Newtownards", "Ballynahinch", "Comber", "Dromore", "Kilkeel", "Newcastle", "Rathfriland", "Warrenpoint"],
    villages: ["Annalong", "Ardglass", "Ballykinlar", "Boardmills", "Carryduff", "Castlewellan", "Clough", "Crossgar", "Donaghadee", "Dromara", "Dundrum", "Gilford", "Greyabbey", "Hillsborough", "Hilltown", "Holywood", "Kircubbin", "Loughinisland", "Millisle", "Moira", "Moneyreagh", "Portaferry", "Portavogie", "Saintfield", "Seaforde", "Strangford", "Waringstown"]
  },
  {
    county: "Fermanagh",
    towns: ["Enniskillen", "Irvinestown", "Kesh", "Lisnaskea", "Maguiresbridge"],
    villages: ["Belleek", "Rosslea", "Ballinamallard", "Belcoo", "Brookeborough", "Derrygonnelly", "Derrylin", "Florencecourt", "Garrison", "Kinawley", "Lack", "Newtownbutler", "Pettigo", "Springfield", "Tempo"]
  },
  {
    county: "Londonderry",
    towns: ["Derry City", "Coleraine", "Limavady", "Maghera", "Magherafelt", "Portstewart"],
    villages: ["Castledawson", "Dungiven", "Articlave", "Ballykelly", "Bellarena", "Castlerock", "Claudy", "Clady", "Draperstown", "Eglinton", "Feeny", "Garvagh", "Greysteel", "Kilrea", "Knockloughrim", "Macosquin", "Moneymore", "Moville", "Portrush", "Swatragh", "Tobermore", "Windyhill"]
  },
  {
    county: "Tyrone",
    towns: ["Omagh", "Strabane", "Dungannon", "Cookstown", "Castlederg", "Fivemiletown", "Stewartstown"],
    villages: ["Ballygawley", "Ardboe", "Ardstraw", "Aughnacloy", "Augher", "Ballymagorry", "Beragh", "Caledon", "Carrickmore", "Castlecaulfield", "Clady", "Clogher", "Coal Island", "Dromore", "Drumquin", "Dunamanagh", "Fintona", "Killeter", "Moygashel", "Newmills", "Pomeroy", "Sixmilecross", "Trillick"]
  },
  {
    county: "Carlow",
    towns: ["Carlow", "Muinebheag", "Tullow", "Hacketstown", "Leighlinbridge", "Borris", "Rathvilly"],
    villages: ["Bagenalstown", "Ardattin", "Ballon", "Bunclody", "Clonegal", "Fenagh", "Goresbridge", "Graiguecullen", "Kildavin", "Killeshin", "Knockananna", "Myshall", "Nurney", "Old Leighlin", "Palatine", "Paulstown", "Slaught", "Tinnahinch", "Tinryland", "Tombrack", "Wells"]
  },
  {
    county: "Cavan",
    towns: ["Cavan", "Bailieborough", "Belturbet", "Virginia", "Cootehill", "Ballyjamesduff", "Kingscourt", "Ballyconnell"],
    villages: ["Arva", "Arvagh", "Ballyhaise", "Butlersbridge", "Canningstown", "Castlesaunderson", "Crosskeys", "Dowra", "Drumalee", "Drumgoon", "Drumkilly", "Gowna", "Killeshandra", "Kilnaleck", "Loch Gowna", "Milltown", "Mountnugent", "Mullagh", "Redhills", "Shercock", "Stradone", "Swanlinbar"]
  },
  {
    county: "Clare",
    towns: ["Ennis", "Shannon", "Kilrush", "Kilkee", "Ennistymon", "Killaloe", "Miltown Malbay", "Lisdoonvarna", "Scarriff", "Sixmilebridge", "Newmarket-on-Fergus"],
    villages: ["Ballyvaughan", "Bodyke", "Broadford", "Bunratty", "Carrigaholt", "Clarecastle", "Clonlara", "Cooraclare", "Corrofin", "Cratloe", "Crusheen", "Doolin", "Doonbeg", "Feakle", "Flagmount", "Inagh", "Kilbaha", "Kilmihill", "Lahinch", "Lissycasey", "Mountshannon", "O'Callaghan's Mills", "Ogonnelloe", "Quilty", "Ruan", "Spanish Point", "Tulla", "Tuamgraney"]
  },
  {
    county: "Cork",
    towns: ["Cork City", "Bandon", "Bantry", "Clonakilty", "Cobh", "Fermoy", "Kinsale", "Macroom", "Mallow", "Midleton", "Skibbereen", "Youghal", "Carrigaline", "Dunmanway", "Kanturk", "Millstreet", "Mitchelstown", "Passage West", "Schull", "Castletownbere", "Charleville"],
    villages: ["Baltimore", "Crosshaven", "Glengarriff", "Drimoleague", "Ballincollig", "Blarney", "Carrigtwohill", "Glanmire", "Aghada", "Aghabullogue", "Aghadown", "Aherla", "Allihies", "Ardfield", "Ardmore", "Ballincurrig", "Ballineen", "Ballinhassig", "Ballinspittle", "Ballycotton", "Ballydesmond", "Ballydehob", "Ballyfeard", "Ballyhooley", "Ballylickey", "Ballymacoda", "Ballymartle", "Ballynoe", "Ballyvourney", "Béal na Bláth", "Brinny", "Butlerstown", "Caheragh", "Carrigrohane", "Castlemartyr", "Castletownshend", "Churchtown", "Coachford", "Coolea", "Courtmacsherry", "Crookstown", "Donoughmore", "Dripsey", "Dunworley", "Enniskeane", "Eyeries", "Farran", "Garretstown", "Garyvoe", "Glenville", "Goleen", "Grenagh", "Inchigeelagh", "Innishannon", "Kealkill", "Kilbrittain", "Kilworth", "Knocknagree", "Leap", "Liscarroll", "Lissarda", "Minane Bridge", "Ringaskiddy", "Rosscarbery", "Shanagarry", "Timoleague", "Union Hall", "Upton", "Waterfall", "Whitechurch"]
  },
  {
    county: "Donegal",
    towns: ["Letterkenny", "Donegal Town", "Buncrana", "Ballyshannon", "Bundoran", "Carndonagh", "Dungloe", "Killybegs", "Lifford", "Raphoe"],
    villages: ["Ardara", "Dunfanaghy", "Glenties", "Annagry", "Arranmore Island", "Ballybofey", "Ballyliffen", "Bridgend", "Bruckless", "Burtonport", "Carrick", "Carrigart", "Castlefin", "Clonmany", "Convoy", "Creeslough", "Crolly", "Derrybeg", "Downings", "Dunkineely", "Falcarragh", "Fintown", "Glencolumbkille", "Greencastle", "Gweedore", "Inver", "Kilcar", "Killygordon", "Kilmacrennan", "Laghy", "Malin", "Malin Head", "Manorcunningham", "Milford", "Moville", "Mountcharles", "Muff", "Newtowncunningham", "Pettigo", "Portnoo", "Ramelton", "Rathmullan", "Rossnowlagh", "St Johnston", "Stranorlar", "Termon"]
  },
  {
    county: "Dublin",
    towns: ["Dublin City", "Swords", "Tallaght", "Balbriggan", "Blanchardstown", "Clondalkin", "Dún Laoghaire", "Finglas", "Lucan", "Malahide", "Portmarnock", "Skerries"],
    villages: ["Artane", "Ashtown", "Baldoyle", "Ballsbridge", "Ballyboden", "Ballyboughal", "Ballyfermot", "Ballybrack", "Ballymun", "Beaumont", "Booterstown", "Cabinteely", "Cabra", "Castleknock", "Chapelizod", "Churchtown", "Citywest", "Clonee", "Clontarf", "Coolock", "Crumlin", "Dalkey", "Donabate", "Donnybrook", "Donnycarney", "Drimnagh", "Drumcondra", "Dundrum", "Foxrock", "Glasnevin", "Glasthule", "Goatstown", "Harold's Cross", "Howth", "Inchicore", "Irishtown", "Killester", "Killiney", "Kilmainham", "Kilmore", "Kilsallaghan", "Loughlinstown", "Lusk", "Marino", "Merrion", "Milltown", "Monkstown", "Mulhuddart", "Naul", "Newcastle", "Palmerstown", "Phibsborough", "Ranelagh", "Rathcoole", "Rathfarnham", "Rathmines", "Ringsend", "Saggart", "Sandyford", "Sandymount", "Santry", "Shankill", "Stepaside", "Stillorgan", "Sutton", "Templeogue", "Terenure", "The Naul", "Tyrrelstown", "Walkinstown", "Whitehall"]
  },
  {
    county: "Galway",
    towns: ["Galway City", "Athenry", "Ballinasloe", "Clifden", "Loughrea", "Portumna", "Tuam", "Gort", "Headford", "Oranmore", "Oughterard", "Glenamaddy", "Mountbellew"],
    villages: ["Ahascragh", "An Cheathrú Rua", "An Spidéal", "Annaghdown", "Ardrahan", "Aughrim", "Ballinafad", "Ballyconeely", "Ballydangan", "Ballygar", "Ballymoe", "Ballynahinch", "Barna", "Bearna", "Caltra", "Carraroe", "Claregalway", "Clarinbridge", "Clonbur", "Clonfert", "Costelloe", "Craughwell", "Dunmore", "Eyrecourt", "Killimor", "Kilronan", "Kinvara", "Leenane", "Letterfrack", "Lettermore", "Milltown", "Moylough", "Moycullen", "New Inn", "Peterswell", "Recess", "Roundstone", "Salthill", "Shrule", "Tynagh", "Woodlawn"]
  },
  {
    county: "Kerry",
    towns: ["Tralee", "Killarney", "Listowel", "Kenmare", "Dingle", "Cahirciveen", "Killorglin", "Castleisland", "Abbeyfeale", "Ballybunion"],
    villages: ["Castlegregory", "Sneem", "Waterville", "Abbeydorney", "An Daingean", "Annascaul", "Ardfert", "Ballinskelligs", "Ballylongford", "Ballymacelligott", "Barraduff", "Beaufort", "Brosna", "Camp", "Castlemaine", "Causeway", "Currow", "Derrynane", "Duagh", "Firies", "Fossa", "Glenbeigh", "Gneevgullia", "Kilcummin", "Kilflynn", "Kilgarvan", "Kilmoyley", "Knocknagoshel", "Lispole", "Lixnaw", "Miltown", "Moyvane", "Muckross", "Portmagee", "Rathmore", "Spa", "Tarbert", "Templenoe", "Tuosist", "Ventry"]
  },
  {
    county: "Kildare",
    towns: ["Naas", "Athy", "Celbridge", "Clane", "Kilcock", "Kildare", "Leixlip", "Maynooth", "Monasterevin", "Newbridge", "Prosperous", "Rathangan", "Sallins"],
    villages: ["Allenwood", "Ballitore", "Ballymore Eustace", "Baltinglass", "Blessington", "Broadford", "Carbury", "Castledermot", "Castletown", "Clonbullogue", "Coill Dubh", "Derrinturn", "Donadea", "Kill", "Kilmeage", "Kilmore", "Longwood", "Milltown", "Moone", "Nurney", "Robertstown", "Straffan", "Two-Mile-House"]
  },
  {
    county: "Kilkenny",
    towns: ["Kilkenny City", "Callan", "Castlecomer", "Graiguenamanagh", "Mullinavat", "Pilltown", "Thomastown", "Urlingford", "Freshford", "Gowran", "Ballyragget"],
    villages: ["Bennettsbridge", "Burnchurch", "Clogh", "Clonamery", "Danesfort", "Durrow", "Ferrybank", "Fiddown", "Glenmore", "Goresbridge", "Inistioge", "Johnswell", "Kells", "Kilmacow", "Kilmanagh", "Kilmoganny", "Knocktopher", "Mooncoin", "Nine Mile House", "Paulstown", "Stonyford", "The Rower", "Tullaroan", "Windgap"]
  },
  {
    county: "Laois",
    towns: ["Portlaoise", "Abbeyleix", "Mountmellick", "Mountrath", "Portarlington", "Rathdowney", "Stradbally", "Durrow", "Borris-in-Ossory", "Ballylinan"],
    villages: ["Aghaboe", "Arles", "Attanagh", "Ballacolla", "Ballyadams", "Ballyfin", "Ballyroan", "Camross", "Castlecuffe", "Castletown", "Clough", "Coolrain", "Cullohill", "Emo", "Errill", "Graiguecullen", "Killenard", "Killeshin", "Luggacurren", "Raheen", "Rosenallis", "Spink", "Timahoe", "Vicarstown", "Wolfhill"]
  },
  {
    county: "Leitrim",
    towns: ["Carrick-on-Shannon", "Ballinamore", "Drumshanbo", "Manorhamilton", "Mohill"],
    villages: ["Ballyconnell", "Drumkeerin", "Dromahair", "Aughawillan", "Ballinaglera", "Ballintogher", "Carrigallen", "Cloone", "Drumsna", "Fenagh", "Glencar", "Glenade", "Glenfarne", "Jamestown", "Keadue", "Keshcarrigan", "Killargue", "Leitrim Village", "Lurganboy", "Newtowngore", "Roosky", "Rossinver", "Tarmon"]
  },
  {
    county: "Limerick",
    towns: ["Limerick City", "Adare", "Kilmallock", "Newcastle West", "Rathkeale", "Abbeyfeale", "Askeaton", "Bruff", "Cappamore", "Croom", "Patrickswell"],
    villages: ["Ardagh", "Ardpatrick", "Athea", "Ballingarry", "Ballylanders", "Bruree", "Caherconlish", "Castleconnell", "Castlemahon", "Clarina", "Croagh", "Doon", "Dromcollogher", "Foynes", "Galbally", "Glin", "Herbertstown", "Hospital", "Kilcornan", "Kilfinane", "Kildimo", "Killeedy", "Kilmeedy", "Knocklong", "Lough Gur", "Monagea", "Murroe", "Oola", "Pallasgreen", "Pallaskenry", "Shanagolden", "Templeglantine"]
  },
  {
    county: "Longford",
    towns: ["Longford Town", "Ballymahon", "Edgeworthstown", "Granard", "Lanesborough", "Strokestown"],
    villages: ["Kenagh", "Abbeyshrule", "Ardagh", "Aughnacliffe", "Ballinalee", "Carrickedmond", "Clondra", "Colmcille", "Coolamber", "Corboy", "Dring", "Drumlish", "Ennybegs", "Finea", "Forgney", "Legan", "Moydow", "Moyne", "Newtownforbes", "Scramogue", "Stonepark", "Tarmonbarry"]
  },
  {
    county: "Louth",
    towns: ["Drogheda", "Dundalk", "Ardee", "Carlingford", "Dunleer", "Castlebellingham", "Blackrock"],
    villages: ["Termonfeckin", "Annagassan", "Baltray", "Castletown", "Clogherhead", "Collon", "Dromiskin", "Dunnaman", "Kilkerley", "Kilsaran", "Knockbridge", "Louth Village", "Monasterboice", "Omeath", "Philipstown", "Ravensdale", "Slane", "Tallanstown", "Templetown"]
  },
  {
    county: "Mayo",
    towns: ["Castlebar", "Ballina", "Westport", "Ballinrobe", "Belmullet", "Claremorris", "Crossmolina", "Killala", "Louisburgh", "Swinford", "Foxford", "Newport", "Knock"],
    villages: ["Achill", "Achill Sound", "Aghamore", "Ballaghaderreen", "Ballycroy", "Ballyhaunis", "Ballyheane", "Ballyvary", "Bonniconlon", "Charlestown", "Cong", "Doogort", "Doohoma", "Inishturk", "Islandeady", "Keel", "Kilkelly", "Kilmaine", "Kilmeena", "Kiltimagh", "Lahardane", "Lecanvey", "Manulla", "Mulrany", "Partry", "Pontoon", "Straide", "Turlough"]
  },
  {
    county: "Meath",
    towns: ["Navan", "Ashbourne", "Athboy", "Duleek", "Dunboyne", "Dunshaughlin", "Kells", "Nobber", "Oldcastle", "Ratoath", "Slane", "Trim", "Bettystown", "Laytown"],
    villages: ["Ballivor", "Batterstown", "Bohermeen", "Carnaross", "Castletown", "Clonard", "Donore", "Donacarney", "Drumconrath", "Enfield", "Garristown", "Gibbstown", "Gormanston", "Julianstown", "Kinnegad", "Lobinstown", "Longwood", "Moynalty", "Oristown", "Rathcairn", "Rathmolyons", "Skreen", "Stackallen", "Stamullen", "Summerhill", "Tara", "Wilkinstown"]
  },
  {
    county: "Monaghan",
    towns: ["Monaghan Town", "Carrickmacross", "Castleblayney", "Clones", "Ballybay", "Glaslough", "Emyvale"],
    villages: ["Aughnamullen", "Ballinode", "Clontibret", "Corcaghan", "Inniskeen", "Knockatallon", "Laragh", "Latton", "Lough Egish", "Magheracloone", "Newbliss", "Oram", "Rockcorry", "Scotstown", "Smithborough", "Tydavnet"]
  },
  {
    county: "Offaly",
    towns: ["Tullamore", "Birr", "Banagher", "Edenderry", "Clara", "Kilbeggan", "Ferbane", "Portarlington"],
    villages: ["Ballyboy", "Ballycumber", "Belmont", "Bracknagh", "Cloghan", "Clonaslee", "Clonbullogue", "Daingean", "Doon", "Dunkerrin", "Geashill", "Kilcormac", "Kinnitty", "Lusmagh", "Moneygall", "Moate", "Mucklagh", "Pullough", "Rahan", "Rhode", "Shannonbridge", "Shinrone", "Toomyvara"]
  },
  {
    county: "Roscommon",
    towns: ["Roscommon Town", "Boyle", "Castlerea", "Ballaghaderreen", "Strokestown", "Athlone", "Elphin", "Frenchpark"],
    villages: ["Athleague", "Ballintober", "Ballyfarnan", "Ballyleague", "Castlecoote", "Cloonfree", "Cootehall", "Creggs", "Fairymount", "Fourmilehouse", "Fuerty", "Kilbride", "Kilglass", "Knockcroghery", "Loughglinn", "Mantua", "Moore", "Tarmonbarry"]
  },
  {
    county: "Sligo",
    towns: ["Sligo Town", "Ballymote", "Collooney", "Enniscrone", "Riverstown", "Tobercurry", "Strandhill"],
    villages: ["Mullaghmore", "Achonry", "Aclare", "Ballinfull", "Ballintrillick", "Calry", "Carney", "Castlebaldwin", "Cliffony", "Culfadda", "Drumcliff", "Easky", "Grange", "Gurteen", "Kilmacowen", "Kilglass", "Kilmacteige", "Lissadell", "Monasteraden", "Rosses Point", "Skreen", "Templeboy", "Tubbercurry"]
  },
  {
    county: "Tipperary",
    towns: ["Clonmel", "Nenagh", "Thurles", "Tipperary Town", "Cahir", "Carrick-on-Suir", "Cashel", "Fethard", "Roscrea", "Templemore", "Borrisokane", "Borrisoleigh"],
    villages: ["Ardfinnan", "Ballingarry", "Ballycahill", "Ballymacarbry", "Ballyporeen", "Bansha", "Burncourt", "Cappawhite", "Castleiney", "Clonakenny", "Cloughjordan", "Clogheen", "Dromineer", "Dundrum", "Emly", "Galbally", "Golden", "Kilcommon", "Killenaule", "Kilsheelan", "Knockgraffon", "Lorrha", "Loughmore", "Monard", "Mullinahone", "New Inn", "Newport", "Puckane", "Rearcross", "Rosegreen", "Silvermines", "Solohead", "Terryglass", "Two-Mile-Borris", "Urlingford"]
  },
  {
    county: "Waterford",
    towns: ["Waterford City", "Dungarvan", "Tramore", "Lismore", "Dunmore East", "Cappoquin", "Kilmacthomas", "Portlaw", "Tallow"],
    villages: ["Ardmore", "Aglish", "Annestown", "Ballymacarbry", "Bunmahon", "Butlerstown", "Carrickbeg", "Cheekpoint", "Clonea", "Comeragh", "Fenor", "Ferrybank", "Kilgobnet", "Kill", "Killea", "Kilmacomb", "Knockanore", "Leamybrien", "Newtown", "Passage East", "Rathgormack", "Ringville", "Stradbally", "Villierstown"]
  },
  {
    county: "Westmeath",
    towns: ["Athlone", "Mullingar", "Moate", "Castlepollard", "Kilbeggan", "Kinnegad", "Tyrrellspass", "Rochfortbridge"],
    villages: ["Ballinacarrigy", "Ballinea", "Ballymore", "Bunbrosna", "Castletown-Geoghegan", "Collinstown", "Crookedwood", "Delvin", "Drumraney", "Dysart", "Fore", "Glasson", "Horseleap", "Killucan", "Knockdrin", "Lismacaffrey", "Milltownpass", "Moyvore", "Multyfarnham", "Rathowen", "Streamstown", "Tang"]
  },
  {
    county: "Wexford",
    towns: ["Wexford Town", "Enniscorthy", "Gorey", "New Ross", "Bunclody", "Ferns", "Kilmore Quay", "Rosslare", "Taghmon", "Courtown"],
    villages: ["Adamstown", "Arthurstown", "Ballindaggin", "Ballycanew", "Ballycullane", "Ballyhack", "Ballymitty", "Ballymurn", "Blackwater", "Boolavogue", "Bridgetown", "Camolin", "Campile", "Castlebridge", "Clongeen", "Clonroche", "Duncormick", "Fethard-on-Sea", "Foulksmills", "Glenbrien", "Glynn", "Gusserane", "Kilrane", "Kiltealy", "Lady's Island", "Marshalstown", "Monaseed", "Monamolin", "Murrintown", "Newbawn", "Oylegate", "Piercestown", "Raheen", "Ramsgrange", "Rathnure", "Riverchapel", "Rosslare Harbour", "Saltmills", "Tomhaggard", "Wellingtonbridge"]
  },
  {
    county: "Wicklow",
    towns: ["Wicklow Town", "Arklow", "Bray", "Carnew", "Enniskerry", "Greystones", "Newtownmountkennedy", "Rathdrum", "Tinahely", "Blessington", "Roundwood"],
    villages: ["Ashford", "Aughrim", "Avoca", "Baltinglass", "Barndarrig", "Blackrock", "Brittas Bay", "Coolgreany", "Delgany", "Donard", "Dunlavin", "Glendalough", "Glenmalure", "Hollywood", "Kilcoole", "Kilmacanogue", "Kilpedder", "Knockananna", "Laragh", "Macreddin", "Manor Kilbride", "Newcastle", "Oldcourt", "Poulaphuca", "Rathnew", "Redcross", "Shillelagh", "Stratford-on-Slaney", "Woodenbridge"]
  }
];

export const ALL_COUNTIES = IRELAND_COUNTIES.map(c => c.county);

export function getTownsForCounty(county) {
  const found = IRELAND_COUNTIES.find(c => c.county === county);
  if (!found) return [];
  return [...(found.towns || []), ...(found.villages || [])].sort();
}

export function getTownsAndVillagesForCounty(county) {
  const found = IRELAND_COUNTIES.find(c => c.county === county);
  if (!found) return { towns: [], villages: [] };
  return {
    towns: [...(found.towns || [])].sort(),
    villages: [...(found.villages || [])].sort()
  };
}

// Global town/village name sets (across all counties) so we can classify a
// listing's town even when no county filter is selected.
export const ALL_TOWN_NAMES = new Set(IRELAND_COUNTIES.flatMap(c => c.towns || []));
export const ALL_VILLAGE_NAMES = new Set(IRELAND_COUNTIES.flatMap(c => c.villages || []));