import { useState, useMemo, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════

const DEFAULT_TIERS = {
  RB: {
    T1:{name:"Cream of the Crop"},T2:{name:"Strong RB1"},
    T3:{name:"Low End RB1, Would Love as My RB2"},T4:{name:"RB2 with RB1 Upside"},
    T5:{name:"Low Upside, High Enough Floor (RB2)"},T6:{name:"High Risk High Reward · Low RB2 / High End RB3"},
    T7:{name:"RB3 with Upside"},T8:{name:"Locked in Timeshare, Need Injury to Outperform ADP (RB4)"},
    T9:{name:"RB5"},T10:{name:"Handcuffs w/ Some Upside"},
  },
  WR: {
    T1:{name:"Cream of the Crop"},T2:{name:"Strong WR1"},
    T3:{name:"Low End WR1, Would Love as My WR2"},T4:{name:"WR2 with WR1 Upside"},
    T5:{name:"High Floor (WR2)"},T6:{name:"High Risk High Reward · Low WR2 / High End WR3"},
    T7:{name:"WR3 with Upside"},T8:{name:"WR3.5"},T9:{name:"WR4"},
    T10:{name:"WR5"},T11:{name:"Who Knows"},
  },
  QB: {},
  TE: {},
};

function rbTier(rk){if(rk<=2)return"T1";if(rk<=8)return"T2";if(rk<=10)return"T3";if(rk<=13)return"T4";if(rk<=18)return"T5";if(rk<=22)return"T6";if(rk<=28)return"T7";if(rk<=36)return"T8";if(rk<=44)return"T9";return"T10";}
function wrTier(rk){if(rk<=3)return"T1";if(rk<=7)return"T2";if(rk<=11)return"T3";if(rk<=14)return"T4";if(rk<=20)return"T5";if(rk<=26)return"T6";if(rk<=29)return"T7";if(rk<=32)return"T8";if(rk<=42)return"T9";if(rk<=59)return"T10";return"T11";}

const DEFAULT_RBS = [
  {n:"Jahmyr Gibbs",s:1},{n:"Bijan Robinson",s:2},{n:"CMC",s:3},{n:"Jonathan Taylor",s:4},
  {n:"James Cook",s:6},{n:"Ashton Jeanty",s:7},{n:"Omarion Hampton",s:9},{n:"Chase Brown",s:10},
  {n:"Saquon Barkley",s:8},{n:"Devon Achane",s:5},{n:"Isiah Pacheco",s:null},
  {n:"Derrick Henry",s:13},{n:"Jeremiyah Love",s:11},{n:"Josh Jacobs",s:14},
  {n:"Javonte Williams",s:19},{n:"Cam Skattebo",s:21},{n:"Breece Hall",s:16},
  {n:"Kyren Williams",s:15},{n:"Quinshon Judkins",s:22},{n:"Trey'Veon Henderson",s:20},
  {n:"Bayshul Tuten",s:24},{n:"Bucky Irving",s:17},{n:"Travis Etienne",s:18},
  {n:"De'Andre Swift",s:25},{n:"Jadarian Price",s:29},{n:"David Montgomery",s:23},
  {n:"Chuba Hubbard",s:28},{n:"Kyle Monangai",s:33},{n:"Jaylen Warren",s:27},
  {n:"RJ Harvey",s:26},{n:"JK Dobbins",s:34},{n:"Rhamondre Stevenson",s:30},
  {n:"Rico Dowdle",s:32},{n:"Aaron Jones",s:37},{n:"Blake Corum",s:35},
  {n:"Jonathan Brooks",s:44},{n:"Alvin Kamara",s:51},{n:"Rachaad White",s:41},
  {n:"Jacory Croskey-Merrit",s:38},{n:"Jordan Mason",s:42},{n:"Woody Marks",s:45},
  {n:"Zach Charbonnet",s:40},{n:"Kenny Gainwell",s:36},{n:"Chris Rodriguez",s:46},
  {n:"Brian Robinson",s:39},{n:"Tyler Allgeier",s:43},{n:"Tyrone Tracy",s:48},
  {n:"Keaton Mitchell",s:52},{n:"Dylan Sampson",s:null},{n:"Jonah Coleman",s:47},
  {n:"Emmett Johnson",s:49},{n:"Tyjae Spears",s:null},{n:"Braelon Allen",s:null},
  {n:"Nicholas Singleton",s:null},{n:"Mike Washington",s:null},{n:"Kaytron Allen",s:null},
].map((p,i)=>({player:p.n,pos:"RB",posRk:i+1,tier:rbTier(i+1),slpRk:p.s}));

const DEFAULT_WRS_RAW = [
  {p:"Puka Nacua",s:2},{p:"Ja'Marr Chase",s:1},{p:"Jaxon Smith-Njigba",s:3},
  {p:"Amon-Ra St. Brown",s:4},{p:"CeeDee Lamb",s:5},{p:"Justin Jefferson",s:6},
  {p:"AJ Brown",s:8},{p:"George Pickens",s:10},{p:"Nico Collins",s:11},
  {p:"Rashee Rice",s:9},{p:"Drake London",s:7},{p:"Chris Olave",s:12},
  {p:"Tee Higgins",s:14},{p:"Tetairoa McMillan",s:15},{p:"Garrett Wilson",s:16},
  {p:"Malik Nabers",s:13},{p:"Zay Flowers",s:19},{p:"Ladd McConkey",s:18},
  {p:"DeVonta Smith",s:20},{p:"Emeka Egbuka",s:21},{p:"Davante Adams",s:23},
  {p:"Luther Burden",s:17},{p:"Terry McLaurin",s:25},{p:"Jaylen Waddle",s:22},
  {p:"Mike Evans",s:26},{p:"Carnell Tate",s:28},{p:"Jameson Williams",s:24},
  {p:"Christian Watson",s:30},{p:"Jordyn Tyson",s:31},{p:"Brian Thomas Jr",s:32},
  {p:"DJ Moore",s:27},{p:"Rome Odunze",s:29},{p:"Quentin Johnston",s:44},
  {p:"Michael Pittman",s:45},{p:"DK Metcalf",s:33},{p:"Marvin Harrison Jr",s:34},
  {p:"Michael Wilson",s:37},{p:"Makai Lemon",s:35},{p:"Courtland Sutton",s:36},
  {p:"Alec Pierce",s:38},{p:"Josh Downs",s:49},{p:"Chris Godwin",s:41},
  {p:"Jakobi Meyers",s:39},{p:"Parker Washington",s:40},{p:"Wan'Dale Robinson",s:46},
  {p:"Jayden Reed",s:48},{p:"KC Concepcion",s:56},{p:"Jordan Addison",s:43},
  {p:"Denzel Boston",s:58},{p:"Romeo Doubs",s:47},{p:"Matthew Golden",s:53},
  {p:"Jalen Coker",s:55},{p:"Stefon Diggs",s:50},
  {p:"Jayden Higgins",s:51},{p:"Khalil Shakir",s:52},{p:"Jalen McMillan",s:null},
  {p:"Deebo Samuel",s:null},{p:"Omar Cooper Jr",s:59},{p:"Xavier Worthy",s:54},
  {p:"Jalen Nailor",s:null},{p:"Antonio Williams",s:null},
];
// Use original sheet posRk for tier, then renumber
const DEFAULT_WRS = DEFAULT_WRS_RAW.map((w,i)=>{
  const origRk = i < 53 ? i+1 : i+2; // skip Pearsall at original 54
  return {player:w.p,pos:"WR",posRk:i+1,tier:wrTier(origRk),slpRk:w.s};
});

const DEFAULT_QBS = [
  {player:"Josh Allen",pos:"QB",posRk:1,tier:"",slpRk:1},
  {player:"Lamar Jackson",pos:"QB",posRk:2,tier:"",slpRk:2},
  {player:"Drake Maye",pos:"QB",posRk:3,tier:"",slpRk:3},
  {player:"Joe Burrow",pos:"QB",posRk:4,tier:"",slpRk:4},
  {player:"Jayden Daniels",pos:"QB",posRk:5,tier:"",slpRk:5},
  {player:"Jalen Hurts",pos:"QB",posRk:6,tier:"",slpRk:6},
  {player:"Jaxson Dart",pos:"QB",posRk:7,tier:"",slpRk:7},
  {player:"Caleb Williams",pos:"QB",posRk:8,tier:"",slpRk:8},
  {player:"Justin Herbert",pos:"QB",posRk:9,tier:"",slpRk:9},
  {player:"Dak Prescott",pos:"QB",posRk:10,tier:"",slpRk:10},
  {player:"Trevor Lawrence",pos:"QB",posRk:11,tier:"",slpRk:11},
  {player:"Patrick Mahomes",pos:"QB",posRk:12,tier:"",slpRk:12},
  {player:"Brock Purdy",pos:"QB",posRk:13,tier:"",slpRk:13},
  {player:"Matthew Stafford",pos:"QB",posRk:14,tier:"",slpRk:14},
  {player:"Bo Nix",pos:"QB",posRk:15,tier:"",slpRk:15},
  {player:"Jared Goff",pos:"QB",posRk:16,tier:"",slpRk:16},
  {player:"Jordan Love",pos:"QB",posRk:17,tier:"",slpRk:17},
  {player:"Malik Willis",pos:"QB",posRk:18,tier:"",slpRk:18},
  {player:"Baker Mayfield",pos:"QB",posRk:19,tier:"",slpRk:19},
  {player:"Kyler Murray",pos:"QB",posRk:20,tier:"",slpRk:20},
  {player:"Tyler Shough",pos:"QB",posRk:21,tier:"",slpRk:21},
  {player:"CJ Stroud",pos:"QB",posRk:22,tier:"",slpRk:22},
];
const DEFAULT_TES = [
  {player:"Trey McBride",pos:"TE",posRk:1,tier:"",slpRk:1},
  {player:"Brock Bowers",pos:"TE",posRk:2,tier:"",slpRk:2},
  {player:"Colston Loveland",pos:"TE",posRk:3,tier:"",slpRk:3},
  {player:"Tyler Warren",pos:"TE",posRk:4,tier:"",slpRk:4},
  {player:"Harold Fannin",pos:"TE",posRk:5,tier:"",slpRk:5},
  {player:"Tucker Kraft",pos:"TE",posRk:6,tier:"",slpRk:6},
  {player:"Kyle Pitts",pos:"TE",posRk:7,tier:"",slpRk:7},
  {player:"Sam LaPorta",pos:"TE",posRk:8,tier:"",slpRk:8},
  {player:"Oronde Gadsden",pos:"TE",posRk:9,tier:"",slpRk:9},
  {player:"Dalton Kincaid",pos:"TE",posRk:10,tier:"",slpRk:10},
  {player:"George Kittle",pos:"TE",posRk:11,tier:"",slpRk:11},
  {player:"Jake Ferguson",pos:"TE",posRk:12,tier:"",slpRk:12},
  {player:"Hunter Henry",pos:"TE",posRk:13,tier:"",slpRk:13},
  {player:"Travis Kelce",pos:"TE",posRk:14,tier:"",slpRk:14},
  {player:"Dallas Goedert",pos:"TE",posRk:15,tier:"",slpRk:15},
  {player:"Mark Andrews",pos:"TE",posRk:16,tier:"",slpRk:16},
  {player:"Isaiah Likely",pos:"TE",posRk:17,tier:"",slpRk:17},
  {player:"Kenyon Sadiq",pos:"TE",posRk:18,tier:"",slpRk:18},
  {player:"Brenton Strange",pos:"TE",posRk:19,tier:"",slpRk:19},
  {player:"Juwan Johnson",pos:"TE",posRk:20,tier:"",slpRk:20},
  {player:"Dalton Schultz",pos:"TE",posRk:21,tier:"",slpRk:21},
  {player:"TJ Hockenson",pos:"TE",posRk:22,tier:"",slpRk:22},
  {player:"Chig Okonkwo",pos:"TE",posRk:23,tier:"",slpRk:23},
  {player:"AJ Barner",pos:"TE",posRk:24,tier:"",slpRk:24},
  {player:"Terrence Ferguson",pos:"TE",posRk:25,tier:"",slpRk:25},
  {player:"Cade Otton",pos:"TE",posRk:26,tier:"",slpRk:26},
];

const OVERALL_ORDER = [
  "Jahmyr Gibbs","Bijan Robinson","Puka Nacua","Ja'Marr Chase","CMC",
  "Amon-Ra St. Brown","Jaxon Smith-Njigba","Jonathan Taylor","James Cook","CeeDee Lamb",
  "Justin Jefferson","Ashton Jeanty","AJ Brown","Omarion Hampton","Trey McBride",
  "Chase Brown","Saquon Barkley","Devon Achane","Brock Bowers","George Pickens",
  "Isiah Pacheco","Derrick Henry","Nico Collins","Rashee Rice","Jeremiyah Love",
  "Drake London","Chris Olave","Tee Higgins","Josh Allen","Tetairoa McMillan",
  "Josh Jacobs","Garrett Wilson","Javonte Williams","Malik Nabers","Lamar Jackson",
  "Cam Skattebo","Breece Hall","Zay Flowers","Ladd McConkey","Kyren Williams",
  "Colston Loveland","DeVonta Smith","Emeka Egbuka","Davante Adams","Luther Burden",
  "Bayshul Tuten","Terry McLaurin","Quinshon Judkins","Trey'Veon Henderson","Jaylen Waddle",
  "Mike Evans","Bucky Irving","Travis Etienne","De'Andre Swift","Tyler Warren",
  "Drake Maye","Carnell Tate","Jameson Williams","Christian Watson","Jordyn Tyson",
  "Joe Burrow","Jadarian Price","David Montgomery","Brian Thomas Jr","DJ Moore",
  "Jayden Daniels",
];

// Sleeper's overall rankings (from CSV, exact order)
const SLEEPER_OVERALL = {
  "Jahmyr Gibbs":1,"Bijan Robinson":2,"Ja'Marr Chase":3,"Puka Nacua":4,"CMC":5,
  "Jaxon Smith-Njigba":6,"Jonathan Taylor":7,"Amon-Ra St. Brown":8,"CeeDee Lamb":9,
  "Justin Jefferson":10,"Devon Achane":11,"James Cook":12,"Drake London":13,
  "Ashton Jeanty":14,"Saquon Barkley":15,"Trey McBride":16,"Omarion Hampton":17,
  "Chase Brown":18,"AJ Brown":19,"Jeremiyah Love":20,"Brock Bowers":21,
  "Rashee Rice":22,"George Pickens":24,"Derrick Henry":25,"Nico Collins":26,
  "Chris Olave":27,"Malik Nabers":28,"Josh Jacobs":29,"Josh Allen":30,
  "Kyren Williams":31,"Breece Hall":32,"Bucky Irving":33,"Tee Higgins":34,
  "Travis Etienne":35,"Tetairoa McMillan":36,"Lamar Jackson":37,"Javonte Williams":38,
  "Garrett Wilson":39,"Luther Burden":40,"Colston Loveland":41,"Ladd McConkey":42,
  "Zay Flowers":43,"DeVonta Smith":44,"Emeka Egbuka":45,"Jaylen Waddle":46,
  "Davante Adams":47,"Trey'Veon Henderson":48,"Cam Skattebo":49,"Tyler Warren":50,
  "Drake Maye":51,"Jameson Williams":52,"Quinshon Judkins":53,"David Montgomery":54,
  "Terry McLaurin":55,"Joe Burrow":56,"Mike Evans":57,"DJ Moore":58,
  "Bayshul Tuten":59,"Jayden Daniels":60,"Carnell Tate":62,"Rome Odunze":63,
  "De'Andre Swift":64,"Christian Watson":67,"RJ Harvey":68,"Jordyn Tyson":69,
  "Brian Thomas Jr":70,"DK Metcalf":72,"Jaylen Warren":73,"Chuba Hubbard":74,
  "Marvin Harrison Jr":75,"Makai Lemon":77,"Courtland Sutton":78,"Michael Wilson":79,
  "Jadarian Price":80,"Rhamondre Stevenson":82,"Alec Pierce":84,"Jakobi Meyers":87,
  "Rico Dowdle":88,"Parker Washington":89,"Kyle Monangai":90,"JK Dobbins":93,
  "Chris Godwin":94,"Blake Corum":98,"Jordan Addison":101,"Quentin Johnston":102,
  "Michael Pittman":103,"Wan'Dale Robinson":104,"Kenny Gainwell":108,"Aaron Jones":110,
  "Jacory Croskey-Merrit":113,"Romeo Doubs":115,"Jayden Reed":116,
  "Brian Robinson":121,"Josh Downs":123,"Zach Charbonnet":124,"Stefon Diggs":125,
  "Rachaad White":126,"Jordan Mason":128,"Jayden Higgins":129,"Tyler Allgeier":130,
  "Khalil Shakir":131,"Matthew Golden":132,"Xavier Worthy":133,"Jalen Coker":135,
  "Jonathan Brooks":138,"Woody Marks":141,"Chris Rodriguez":142,"KC Concepcion":144,
  "Jonah Coleman":146,"Tyrone Tracy":147,"Denzel Boston":150,"Omar Cooper Jr":151,
  "Emmett Johnson":152,"Alvin Kamara":156,"Jalen McMillan":161,"Deebo Samuel":162,
  "Keaton Mitchell":163,"Isiah Pacheco":999,
  "Dylan Sampson":999,"Tyjae Spears":999,"Braelon Allen":999,
  "Nicholas Singleton":999,"Mike Washington":999,"Kaytron Allen":999,
  "Antonio Williams":999,"Jalen Nailor":999,
  "Jalen Hurts":65,"Jaxson Dart":81,"Caleb Williams":83,"Justin Herbert":85,
  "Dak Prescott":91,"Trevor Lawrence":92,"Patrick Mahomes":100,"Brock Purdy":105,
  "Matthew Stafford":114,"Bo Nix":119,"Jared Goff":120,"Jordan Love":122,
  "Malik Willis":137,"Baker Mayfield":139,"Kyler Murray":143,"Tyler Shough":145,
  "CJ Stroud":160,
  "Harold Fannin":61,"Tucker Kraft":66,"Kyle Pitts":71,"Sam LaPorta":76,
  "Oronde Gadsden":95,"Dalton Kincaid":96,"George Kittle":97,"Jake Ferguson":106,
  "Hunter Henry":107,"Travis Kelce":109,"Dallas Goedert":111,"Mark Andrews":112,
  "Isaiah Likely":117,"Kenyon Sadiq":118,"Brenton Strange":127,"Juwan Johnson":134,
  "Dalton Schultz":136,"TJ Hockenson":140,"Chig Okonkwo":148,"AJ Barner":153,
  "Terrence Ferguson":157,"Cade Otton":159,
  "Kenneth Walker":23,"Tony Pollard":86,"James Conner":155,
  "Jauan Jennings":149,"Rashid Shaheed":154,"Travis Hunter":158,
};

function buildDefaultPlayers() {
  const allPos = [...DEFAULT_RBS,...DEFAULT_WRS,...DEFAULT_QBS,...DEFAULT_TES];
  const lookup = new Map(allPos.map(p=>[p.player,p]));
  const all = [];
  const used = new Set();

  OVERALL_ORDER.forEach((name,i)=>{
    const src = lookup.get(name);
    if(!src) return;
    all.push({...src, rank:i+1, onBoard:true, drafted:false, draftedBy:null, isMyPick:false, id:crypto.randomUUID(), slpOverall:SLEEPER_OVERALL[name]||999});
    used.add(name);
  });

  let nextRank = OVERALL_ORDER.length+1;
  allPos.forEach(p=>{
    if(used.has(p.player)) return;
    all.push({...p, rank:nextRank++, onBoard:false, drafted:false, draftedBy:null, isMyPick:false, id:crypto.randomUUID(), slpOverall:SLEEPER_OVERALL[p.player]||999});
    used.add(p.player);
  });
  return all;
}

// ═══════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = "draft-command-v5";

function saveAll(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      v:5, ts:Date.now(),
      players: state.players.map(p=>({
        id:p.id, player:p.player, pos:p.pos, posRk:p.posRk, rank:p.rank,
        tier:p.tier, slpRk:p.slpRk, slpOverall:p.slpOverall, onBoard:p.onBoard,
        drafted:p.drafted, draftedBy:p.draftedBy, isMyPick:p.isMyPick,
      })),
      tiers: state.tiers,
      currentPick: state.currentPick,
      sleeperUsername: state.sleeperUsername,
      myTeamSlot: state.myTeamSlot,
      teamNames: state.teamNames,
      gridPicks: state.gridPicks,
    }));
  } catch(e) { console.warn("Save failed:", e); }
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const d = JSON.parse(raw);
    if(d.v !== 5) return null;
    return d;
  } catch(e) { return null; }
}

// ═══════════════════════════════════════════════════════
// SLEEPER
// ═══════════════════════════════════════════════════════

async function sleeperGet(path) {
  const r = await fetch(`https://api.sleeper.app/v1${path}`);
  return r.ok ? r.json() : null;
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const C = {
  bg:"#0b1221",card:"#111b2b",border:"#1c2d42",accent:"#00c2d1",
  accentDim:"rgba(0,194,209,0.10)",green:"#34d399",red:"#f87171",
  amber:"#fbbf24",text:"#e8edf4",dim:"#6b7d95",dimmer:"#3d5068",
};
const POS_C = {QB:"#f472b6",RB:"#34d399",WR:"#60a5fa",TE:"#fbbf24"};
const TIER_COLORS_LIST = ["#22c55e","#4ade80","#86efac","#fbbf24","#f59e0b","#fb923c","#60a5fa","#818cf8","#a78bfa","#6b7d95","#4b5e75","#94a3b8"];

function getTierColor(tierKey) {
  const n = parseInt(tierKey.replace("T","")) - 1;
  return TIER_COLORS_LIST[n % TIER_COLORS_LIST.length] || C.dimmer;
}

const btn = (bg,small) => ({
  background:bg,color:"#fff",border:"none",borderRadius:6,
  padding:small?"4px 10px":"8px 16px",fontSize:small?11:13,
  fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
});

function Badge({children,color}) {
  return <span style={{background:color||C.dimmer,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,letterSpacing:.4}}>{children}</span>;
}

// ═══════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════

const TABS = [
  {id:"board",label:"Draft Board",icon:"📋"},
  {id:"grid",label:"Draft Grid",icon:"🗓️"},
  {id:"tiers",label:"Tiers",icon:"📊"},
  {id:"team",label:"My Team",icon:"🏈"},
  {id:"edit",label:"Edit Rankings",icon:"✏️"},
  {id:"sleeper",label:"Sleeper",icon:"🌙"},
];
const POSITIONS = ["ALL","QB","RB","WR","TE"];

export default function App() {
  const saved = useRef(loadAll()).current;

  const [tab,setTab] = useState("board");
  const [players,setPlayers] = useState(()=> saved?.players || buildDefaultPlayers());
  const [tiers,setTiers] = useState(()=> saved?.tiers || DEFAULT_TIERS);
  const [posFilter,setPosFilter] = useState("ALL");
  const [search,setSearch] = useState("");
  const [showDrafted,setShowDrafted] = useState(false);
  const [showDeep,setShowDeep] = useState(true);
  const [currentPick,setCurrentPick] = useState(()=> saved?.currentPick || 1);

  // Sleeper
  const [slUser,setSlUser] = useState(()=> saved?.sleeperUsername || "");
  const [slData,setSlData] = useState(null);
  const [selLeague,setSelLeague] = useState(null);
  const [leagueDetail,setLeagueDetail] = useState(null);
  const [playerDb,setPlayerDb] = useState(null);
  const [slMsg,setSlMsg] = useState("");

  // Grid state
  const [numTeams] = useState(12);
  const [numRounds] = useState(16);
  const [myTeamSlot,setMyTeamSlot] = useState(()=> saved?.myTeamSlot || 1);
  const [teamNames,setTeamNames] = useState(()=> saved?.teamNames || Array.from({length:12},(_,i)=>`Team ${i+1}`));
  const [gridPicks,setGridPicks] = useState(()=> saved?.gridPicks || {}); // key: "round-slot" -> player id
  const [gridSearchCell,setGridSearchCell] = useState(null); // which cell is being searched
  const [gridSearchText,setGridSearchText] = useState("");
  const [gridRankView,setGridRankView] = useState("mine"); // "mine" or "sleeper"
  const [gridPosFilter,setGridPosFilter] = useState("ALL");

  // Edit mode
  const [editPos,setEditPos] = useState("RB");
  const [addName,setAddName] = useState("");
  const [addPos,setAddPos] = useState("QB");
  const [addTier,setAddTier] = useState("");
  const [addSlpRk,setAddSlpRk] = useState("");
  const [tierEditPos,setTierEditPos] = useState("QB");
  const [newTierName,setNewTierName] = useState("");

  // ─── Auto-save ───
  useEffect(()=>{
    const t = setTimeout(()=>saveAll({players,tiers,currentPick,sleeperUsername:slUser,myTeamSlot,teamNames,gridPicks}),400);
    return ()=>clearTimeout(t);
  },[players,tiers,currentPick,slUser,myTeamSlot,teamNames,gridPicks]);

  // ─── Derived ───
  const myPicks = players.filter(p=>p.isMyPick);

  const filtered = useMemo(()=>{
    return players.filter(p=>{
      if(!showDrafted&&p.drafted) return false;
      if(!showDeep&&!p.onBoard) return false;
      if(posFilter!=="ALL"&&p.pos!==posFilter) return false;
      if(search&&!p.player.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  },[players,posFilter,search,showDrafted,showDeep]);

  const posCounts = useMemo(()=>{
    const c={ALL:0,QB:0,RB:0,WR:0,TE:0};
    players.forEach(p=>{if(!p.drafted&&(showDeep||p.onBoard)){c.ALL++;if(c[p.pos]!==undefined)c[p.pos]++;}});
    return c;
  },[players,showDeep]);

  // ─── Draft actions ───
  const markDrafted=(rank,byMe)=>{
    setPlayers(prev=>prev.map(p=>p.rank===rank?{...p,drafted:true,draftedBy:byMe?"me":"other",isMyPick:byMe}:p));
    setCurrentPick(prev=>prev+1);
  };
  const undraft=(rank)=>{
    setPlayers(prev=>prev.map(p=>p.rank===rank?{...p,drafted:false,draftedBy:null,isMyPick:false}:p));
  };
  const resetDraft=()=>{
    if(!window.confirm("Reset all draft picks? Rankings and tiers will be kept.")) return;
    setPlayers(prev=>prev.map(p=>({...p,drafted:false,draftedBy:null,isMyPick:false})));
    setCurrentPick(1);
  };

  // ─── Edit actions ───
  const getPosList = (pos) => players.filter(p=>p.pos===pos).sort((a,b)=>a.posRk-b.posRk);

  const movePlayer = (id, dir) => {
    setPlayers(prev => {
      const p = prev.find(x=>x.id===id);
      if(!p) return prev;
      const posList = prev.filter(x=>x.pos===p.pos).sort((a,b)=>a.posRk-b.posRk);
      const idx = posList.findIndex(x=>x.id===id);
      const swapIdx = idx + dir;
      if(swapIdx<0||swapIdx>=posList.length) return prev;
      const swapId = posList[swapIdx].id;
      // Swap posRk values
      const myRk = p.posRk;
      const theirRk = posList[swapIdx].posRk;
      return prev.map(x=>{
        if(x.id===id) return {...x,posRk:theirRk};
        if(x.id===swapId) return {...x,posRk:myRk};
        return x;
      });
    });
  };

  const moveToRank = (id, newPosRk) => {
    setPlayers(prev => {
      const p = prev.find(x=>x.id===id);
      if(!p) return prev;
      const posList = prev.filter(x=>x.pos===p.pos).sort((a,b)=>a.posRk-b.posRk);
      const oldIdx = posList.findIndex(x=>x.id===id);
      const targetIdx = Math.max(0, Math.min(newPosRk-1, posList.length-1));
      if(oldIdx===targetIdx) return prev;

      // Remove and reinsert
      const reordered = [...posList];
      const [removed] = reordered.splice(oldIdx, 1);
      reordered.splice(targetIdx, 0, removed);

      // Reassign posRk
      const updates = new Map();
      reordered.forEach((pl,i)=>updates.set(pl.id, i+1));
      return prev.map(x=>updates.has(x.id)?{...x,posRk:updates.get(x.id)}:x);
    });
  };

  const addPlayer = () => {
    if(!addName.trim()) return;
    const posList = players.filter(p=>p.pos===addPos);
    const newPosRk = posList.length + 1;
    const newRank = players.length + 1;
    const newPlayer = {
      id: crypto.randomUUID(), player:addName.trim(), pos:addPos, posRk:newPosRk,
      rank:newRank, tier:addTier||"", slpRk:addSlpRk?parseInt(addSlpRk):null,
      onBoard:false, drafted:false, draftedBy:null, isMyPick:false,
    };
    setPlayers(prev=>[...prev,newPlayer]);
    setAddName(""); setAddSlpRk("");
  };

  const removePlayer = (id) => {
    if(!window.confirm("Remove this player?")) return;
    setPlayers(prev=>{
      const p = prev.find(x=>x.id===id);
      if(!p) return prev;
      const remaining = prev.filter(x=>x.id!==id);
      // Recompute posRk for that position
      let rk=1;
      return remaining.map(x=>x.pos===p.pos?{...x,posRk:rk++}:x);
    });
  };

  const setPlayerTier = (id, tier) => {
    setPlayers(prev=>prev.map(p=>p.id===id?{...p,tier}:p));
  };

  const setPlayerOnBoard = (id, onBoard) => {
    setPlayers(prev=>prev.map(p=>p.id===id?{...p,onBoard}:p));
  };

  const recalcOverallRanks = () => {
    // Rebuild overall ranking from current posRk ordering
    // Simple interleave: go through each position in posRk order,
    // place on-board players first sorted by rank, then off-board
    setPlayers(prev=>{
      const onBoard = prev.filter(p=>p.onBoard).sort((a,b)=>a.rank-b.rank);
      const offBoard = prev.filter(p=>!p.onBoard).sort((a,b)=>a.posRk-b.posRk);
      const all = [...onBoard,...offBoard];
      return all.map((p,i)=>({...p,rank:i+1}));
    });
  };

  // ─── Tier management ───
  const addTierDef = (pos) => {
    if(!newTierName.trim()) return;
    setTiers(prev=>{
      const posTiers = prev[pos]||{};
      const nextNum = Object.keys(posTiers).length+1;
      return {...prev,[pos]:{...posTiers,[`T${nextNum}`]:{name:newTierName.trim()}}};
    });
    setNewTierName("");
  };

  const removeTierDef = (pos, key) => {
    setTiers(prev=>{
      const copy = {...prev[pos]};
      delete copy[key];
      // Renumber
      const entries = Object.values(copy);
      const renumbered = {};
      entries.forEach((v,i)=>{renumbered[`T${i+1}`]=v;});
      // Update player tiers
      setPlayers(pp=>pp.map(p=>{
        if(p.pos!==pos) return p;
        if(p.tier===key) return {...p,tier:""};
        // Renumber player tiers
        const oldNum = parseInt(p.tier.replace("T",""));
        const deletedNum = parseInt(key.replace("T",""));
        if(isNaN(oldNum)) return p;
        if(oldNum>deletedNum) return {...p,tier:`T${oldNum-1}`};
        return p;
      }));
      return {...prev,[pos]:renumbered};
    });
  };

  const renameTierDef = (pos, key, newName) => {
    setTiers(prev=>({...prev,[pos]:{...prev[pos],[key]:{...prev[pos][key],name:newName}}}));
  };

  // ─── Tier groups for Tiers tab ───
  const tierGroups = useMemo(()=>{
    const targetPos=posFilter==="ALL"?["QB","RB","WR","TE"]:[posFilter];
    const groups=[];
    targetPos.forEach(pos=>{
      const posTiers=tiers[pos]||{};
      const posPlayers=players.filter(p=>p.pos===pos&&p.tier);
      if(!Object.keys(posTiers).length&&!posPlayers.length) return;
      const tierMap={};
      posPlayers.forEach(p=>{
        if(!showDrafted&&p.drafted)return;
        if(!showDeep&&!p.onBoard)return;
        if(!p.tier||!posTiers[p.tier])return;
        if(!tierMap[p.tier])tierMap[p.tier]=[];
        tierMap[p.tier].push(p);
      });
      Object.keys(posTiers).sort((a,b)=>parseInt(a.replace("T",""))-parseInt(b.replace("T","")))
        .forEach(tid=>{
          const ps=tierMap[tid]||[];
          if(!ps.length&&!showDrafted)return;
          groups.push({id:`${pos}-${tid}`,pos,tier:tid,name:posTiers[tid]?.name||tid,color:getTierColor(tid),players:ps.sort((a,b)=>a.posRk-b.posRk)});
        });
    });
    return groups;
  },[players,tiers,posFilter,showDrafted,showDeep]);

  // ─── Sleeper ───
  const connectSleeper=async()=>{
    if(!slUser.trim())return;setSlMsg("Finding user...");
    try{const user=await sleeperGet(`/user/${slUser.trim()}`);if(!user){setSlMsg("User not found");return;}
    const yr=new Date().getFullYear();let leagues=await sleeperGet(`/user/${user.user_id}/leagues/nfl/${yr}`);let season=yr;
    if(!leagues?.length){leagues=await sleeperGet(`/user/${user.user_id}/leagues/nfl/${yr-1}`);season=yr-1;}
    setSlData({user,leagues:leagues||[],season});setSlMsg("");}catch(e){setSlMsg("Error: "+e.message);}
  };
  const selectLeague=async(lg)=>{
    setSelLeague(lg);setSlMsg("Loading league...");
    try{const[rosters,users,drafts]=await Promise.all([sleeperGet(`/league/${lg.league_id}/rosters`),sleeperGet(`/league/${lg.league_id}/users`),sleeperGet(`/league/${lg.league_id}/drafts`)]);
    setLeagueDetail({rosters,users,drafts});if(!playerDb){setSlMsg("Loading player database...");const db=await sleeperGet("/players/nfl");setPlayerDb(db||{});}setSlMsg("");}catch(e){setSlMsg("Error: "+e.message);}
  };

  // ═══ RENDER ═══
  return (
    <div style={{minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 20px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
          <div style={{width:30,height:30,borderRadius:6,background:`linear-gradient(135deg,${C.accent},#0090a0)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>D</div>
          <div style={{flex:1,minWidth:120}}>
            <h1 style={{fontSize:16,fontWeight:800,margin:0,letterSpacing:-.5}}>Draft Tool</h1>
            <p style={{fontSize:9,color:C.dim,margin:0,textTransform:"uppercase",letterSpacing:1}}>
              2026-27 · {players.length} players{selLeague&&<> · {selLeague.name}</>}
            </p>
          </div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
            <div><span style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:C.accent}}>{posCounts.ALL}</span><span style={{fontSize:9,color:C.dim,marginLeft:3}}>avail</span></div>
            <div><span style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:C.amber}}>{myPicks.length}</span><span style={{fontSize:9,color:C.dim,marginLeft:3}}>mine</span></div>
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 8px",fontSize:11,color:C.amber}}>Pick <strong>#{currentPick}</strong></div>
            <button onClick={resetDraft} style={{...btn("#7f1d1d",true),fontSize:9,padding:"3px 8px"}}>Reset Draft</button>
          </div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none",border:"none",borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent",
              color:tab===t.id?C.accent:C.dim,padding:"7px 14px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"14px 20px",maxWidth:1100,margin:"0 auto"}}>

        {/* ═══ DRAFT BOARD ═══ */}
        {tab==="board"&&<>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10,alignItems:"center"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none",width:140}} />
            <div style={{display:"flex",gap:3}}>
              {POSITIONS.map(p=>(<button key={p} onClick={()=>setPosFilter(p)} style={{...btn(posFilter===p?(POS_C[p]||C.accent):C.dimmer,true),fontSize:10,padding:"4px 8px"}}>{p} <span style={{opacity:.5}}>{posCounts[p]||0}</span></button>))}
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
              <label style={{color:C.dim,fontSize:10,display:"flex",alignItems:"center",gap:3}}><input type="checkbox" checked={showDeep} onChange={e=>setShowDeep(e.target.checked)}/> Deep</label>
              <label style={{color:C.dim,fontSize:10,display:"flex",alignItems:"center",gap:3}}><input type="checkbox" checked={showDrafted} onChange={e=>setShowDrafted(e.target.checked)}/> Drafted</label>
            </div>
          </div>
          <div style={{overflowX:"auto",borderRadius:8,border:`1px solid ${C.border}`}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{background:C.card}}>
                {["#","Player","Pos","Pos Rk","Sleeper","vs Slp","Pick Val","Tier",""].map((h,i)=>(
                  <th key={i} style={{textAlign:i>=5&&i<=7?"center":i===8?"right":"left",padding:"7px 8px",color:C.dim,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:.3,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(p=>{
                  const slpDiff=p.slpRk?p.slpRk-p.posRk:null;
                  const pickVal=p.drafted?null:currentPick-p.rank;
                  const tierName=tiers[p.pos]?.[p.tier]?.name||"";
                  const tierColor=p.tier?getTierColor(p.tier):C.dimmer;
                  return (
                    <tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,opacity:p.drafted?.35:1,background:p.isMyPick?C.accentDim:p.drafted?"rgba(0,0,0,.12)":!p.onBoard?"rgba(96,165,250,.03)":"transparent"}}>
                      <td style={{padding:"7px 8px",fontFamily:"monospace",color:C.dim,fontWeight:700,fontSize:10}}>{p.rank}</td>
                      <td style={{padding:"7px 8px",fontWeight:600,color:p.drafted?C.dim:C.text,maxWidth:220}}>
                        {p.player}
                        {p.isMyPick&&<span style={{marginLeft:5,color:C.accent,fontSize:8,fontWeight:700}}>MINE</span>}
                        {!p.onBoard&&<span style={{marginLeft:5,color:C.dimmer,fontSize:8}}>DEEP</span>}
                      </td>
                      <td style={{padding:"7px 8px"}}><Badge color={POS_C[p.pos]}>{p.pos}</Badge></td>
                      <td style={{padding:"7px 8px",fontFamily:"monospace",fontSize:10,color:C.dim}}>{p.pos}{p.posRk}</td>
                      <td style={{padding:"7px 8px",fontFamily:"monospace",fontSize:10,color:C.dim}}>{p.slpRk?`${p.pos}${p.slpRk}`:"--"}</td>
                      <td style={{padding:"7px 8px",textAlign:"center"}}>
                        {slpDiff!==null?(<span style={{fontFamily:"monospace",fontWeight:700,fontSize:11,color:slpDiff>0?C.green:slpDiff<0?C.red:C.dim}}>
                          {slpDiff>0?`+${slpDiff}`:slpDiff}{Math.abs(slpDiff)>3&&<span style={{fontSize:8,marginLeft:2,opacity:.8}}>{slpDiff>0?"STEAL":"REACH"}</span>}
                        </span>):<span style={{color:C.dimmer}}>--</span>}
                      </td>
                      <td style={{padding:"7px 8px",textAlign:"center"}}>
                        {pickVal!==null?(<span style={{fontFamily:"monospace",fontWeight:700,fontSize:11,color:pickVal>5?C.green:pickVal>0?"#86efac":pickVal<-5?C.red:pickVal<0?"#fca5a5":C.dim}}>{pickVal>0?`+${pickVal}`:pickVal}</span>):<span style={{color:C.dimmer}}>--</span>}
                      </td>
                      <td style={{padding:"7px 8px",textAlign:"center"}}>
                        {tierName&&<span style={{fontSize:8,fontWeight:700,color:tierColor,background:tierColor+"18",padding:"1px 5px",borderRadius:3}}>{tierName.split("·")[0].split(",")[0].split("(")[0].trim().slice(0,18)}</span>}
                      </td>
                      <td style={{padding:"7px 8px",textAlign:"right"}}>
                        {p.drafted?(<button onClick={()=>undraft(p.rank)} style={btn(C.dimmer,true)}>Undo</button>):(
                          <div style={{display:"flex",gap:3,justifyContent:"flex-end"}}>
                            <button onClick={()=>markDrafted(p.rank,true)} style={btn(C.accent,true)}>Draft</button>
                            <button onClick={()=>markDrafted(p.rank,false)} style={btn(C.dimmer,true)}>Taken</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>}

        {/* ═══ DRAFT GRID ═══ */}
        {tab==="grid"&&(()=>{
          const getSlot = (round, col) => round % 2 === 1 ? col : numTeams - col + 1;
          const getOverallPick = (round, slot) => (round-1)*numTeams + slot;
          const cellKey = (r,c) => `${r}-${c}`;

          const gridAssign = (round, col, playerId) => {
            const key = cellKey(round, col);
            const slot = getSlot(round, col);
            const isMe = slot === myTeamSlot;
            setGridPicks(prev => ({...prev, [key]: playerId}));
            setPlayers(prev => prev.map(p => p.id === playerId ? {...p, drafted:true, draftedBy:isMe?"me":"other", isMyPick:isMe} : p));
            setCurrentPick(prev => prev + 1);
            setGridSearchCell(null);
            setGridSearchText("");
          };

          const gridClear = (round, col) => {
            const key = cellKey(round, col);
            const pid = gridPicks[key];
            if(!pid) return;
            setGridPicks(prev => {const copy={...prev}; delete copy[key]; return copy;});
            setPlayers(prev => prev.map(p => p.id === pid ? {...p, drafted:false, draftedBy:null, isMyPick:false} : p));
          };

          const availablePlayers = players.filter(p => !p.drafted);
          const searchResults = gridSearchText.trim()
            ? availablePlayers.filter(p => p.player.toLowerCase().includes(gridSearchText.toLowerCase())).slice(0, 8)
            : availablePlayers.sort((a,b) => a.rank - b.rank).slice(0, 8);

          // Rankings panel data
          const rankingsList = (() => {
            let list = availablePlayers;
            if(gridPosFilter!=="ALL") list = list.filter(p=>p.pos===gridPosFilter);
            if(gridRankView==="sleeper") {
              return list.sort((a,b)=>(a.slpOverall||999)-(b.slpOverall||999));
            }
            return list.sort((a,b)=>a.rank-b.rank);
          })();

          return <>
            {/* Settings row */}
            <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:C.dim}}>My pick position:</span>
                <select value={myTeamSlot} onChange={e=>setMyTeamSlot(parseInt(e.target.value))}
                  style={{background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 8px",fontSize:11,outline:"none"}}>
                  {Array.from({length:numTeams},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <span style={{fontSize:10,color:C.dim}}>Click team names to rename · Click cells to assign picks</span>
            </div>

            {/* Split layout */}
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>

              {/* LEFT: Grid */}
              <div style={{flex:"1 1 0",minWidth:0,overflowX:"auto",borderRadius:8,border:`1px solid ${C.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:700}}>
                  <thead>
                    <tr>
                      <th style={{padding:"6px 4px",color:C.dim,fontSize:9,borderBottom:`2px solid ${C.border}`,width:28,position:"sticky",left:0,background:C.card,zIndex:2}}>Rd</th>
                      {Array.from({length:numTeams},(_,i)=>{
                        const slot = i+1;
                        const isMe = slot === myTeamSlot;
                        return (
                          <th key={slot} style={{padding:"5px 3px",borderBottom:`2px solid ${C.border}`,background:isMe?C.accentDim:C.card,minWidth:64}}>
                            <input value={teamNames[i]} onChange={e=>{const copy=[...teamNames];copy[i]=e.target.value;setTeamNames(copy);}}
                              style={{background:"transparent",border:"none",color:isMe?C.accent:C.dim,fontSize:8,fontWeight:700,textAlign:"center",width:"100%",outline:"none",textTransform:"uppercase",letterSpacing:.3}} />
                            {isMe&&<div style={{fontSize:7,color:C.accent,marginTop:1}}>MY TEAM</div>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({length:numRounds},(_,r)=>{
                      const round = r+1;
                      return (
                        <tr key={round}>
                          <td style={{padding:"3px",textAlign:"center",fontFamily:"monospace",fontWeight:700,color:C.dim,fontSize:9,borderRight:`1px solid ${C.border}`,position:"sticky",left:0,background:C.card,zIndex:1}}>{round}</td>
                          {Array.from({length:numTeams},(_,c)=>{
                            const col = c+1;
                            const slot = getSlot(round, col);
                            const isMe = slot === myTeamSlot;
                            const overall = getOverallPick(round, slot);
                            const key = cellKey(round, col);
                            const pid = gridPicks[key];
                            const player = pid ? players.find(p=>p.id===pid) : null;
                            const isSearching = gridSearchCell === key;

                            return (
                              <td key={col} style={{padding:0,borderBottom:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,background:isMe?C.accentDim:"transparent",verticalAlign:"top",position:"relative"}}>
                                {player ? (
                                  <div onClick={()=>{if(window.confirm(`Remove ${player.player}?`))gridClear(round,col);}}
                                    style={{padding:"3px 4px",cursor:"pointer",minHeight:34}}>
                                    <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.2}}>{player.player}</div>
                                    <div style={{display:"flex",gap:3,alignItems:"center",marginTop:1}}>
                                      <span style={{fontSize:7,fontWeight:700,color:POS_C[player.pos]||C.dim}}>{player.pos}{player.posRk}</span>
                                      <span style={{fontSize:7,color:C.dimmer}}>#{overall}</span>
                                    </div>
                                  </div>
                                ) : isSearching ? (
                                  <div style={{padding:2,position:"relative"}}>
                                    <input autoFocus value={gridSearchText} onChange={e=>setGridSearchText(e.target.value)}
                                      onBlur={()=>setTimeout(()=>{setGridSearchCell(null);setGridSearchText("");},200)}
                                      onKeyDown={e=>{if(e.key==="Escape"){setGridSearchCell(null);setGridSearchText("");}
                                        if(e.key==="Enter"&&searchResults.length)gridAssign(round,col,searchResults[0].id);}}
                                      style={{width:"100%",background:C.bg,color:C.text,border:`1px solid ${C.accent}`,borderRadius:3,padding:"2px 4px",fontSize:9,outline:"none"}}
                                      placeholder="Search..." />
                                    {searchResults.length>0&&(
                                      <div style={{position:"absolute",top:"100%",left:0,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,zIndex:20,maxHeight:200,overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.5)"}}>
                                        {searchResults.map(p=>(
                                          <div key={p.id} onMouseDown={()=>gridAssign(round,col,p.id)}
                                            style={{padding:"4px 6px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:4,fontSize:9}}>
                                            <span style={{color:POS_C[p.pos],fontWeight:700,fontSize:8}}>{p.pos}{p.posRk}</span>
                                            <span style={{color:C.text,fontWeight:600}}>{p.player}</span>
                                            <span style={{color:C.dimmer,fontSize:7,marginLeft:"auto"}}>#{p.rank}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div onClick={()=>{setGridSearchCell(key);setGridSearchText("");}}
                                    style={{padding:"3px 4px",cursor:"pointer",minHeight:34,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <span style={{fontSize:7,color:C.dimmer}}>{overall}</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RIGHT: Rankings Panel */}
              <div style={{width:280,flexShrink:0,background:C.card,borderRadius:8,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",maxHeight:"calc(100vh - 140px)",position:"sticky",top:80}}>
                {/* Panel header */}
                <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:4,marginBottom:8}}>
                    <button onClick={()=>setGridRankView("mine")} style={{...btn(gridRankView==="mine"?C.accent:C.dimmer,true),fontSize:10,padding:"4px 10px",flex:1}}>My Rankings</button>
                    <button onClick={()=>setGridRankView("sleeper")} style={{...btn(gridRankView==="sleeper"?"#7c3aed":C.dimmer,true),fontSize:10,padding:"4px 10px",flex:1}}>Sleeper</button>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {POSITIONS.map(p=>(
                      <button key={p} onClick={()=>setGridPosFilter(p)} style={{...btn(gridPosFilter===p?(POS_C[p]||C.accent):C.dimmer,true),fontSize:8,padding:"2px 6px"}}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Scrollable list */}
                <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
                  {rankingsList.map((p,i)=>{
                    const tierName=tiers[p.pos]?.[p.tier]?.name||"";
                    const tierColor=p.tier?getTierColor(p.tier):C.dimmer;
                    // Show tier divider for "mine" view
                    const prevTier = i>0 ? rankingsList[i-1].tier : null;
                    const prevPos = i>0 ? rankingsList[i-1].pos : null;
                    const showTierBreak = gridRankView==="mine" && gridPosFilter!=="ALL" && p.tier && (p.tier!==prevTier || p.pos!==prevPos) && tierName;

                    return (
                      <div key={p.id}>
                        {showTierBreak&&(
                          <div style={{padding:"4px 12px 2px",marginTop:i>0?4:0}}>
                            <span style={{fontSize:8,fontWeight:700,color:tierColor,textTransform:"uppercase",letterSpacing:.3}}>{tierName.split("·")[0].trim().slice(0,30)}</span>
                          </div>
                        )}
                        <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderBottom:`1px solid ${C.border}10`,fontSize:10}}>
                          <span style={{fontFamily:"monospace",fontSize:9,color:C.dimmer,minWidth:20,textAlign:"right"}}>
                            {gridRankView==="sleeper" && p.slpOverall && p.slpOverall<999 ? p.slpOverall : p.rank}
                          </span>
                          <span style={{color:POS_C[p.pos],fontWeight:700,fontSize:8,minWidth:26}}>{p.pos}{p.posRk}</span>
                          <span style={{color:C.text,fontWeight:500,flex:1}}>{p.player}</span>
                          {gridRankView==="sleeper" && p.slpRk && (()=>{
                            const diff = p.slpRk - p.posRk;
                            if(Math.abs(diff)<=1) return null;
                            return <span style={{fontSize:8,fontWeight:700,color:diff>0?C.green:C.red,fontFamily:"monospace"}}>{diff>0?`+${diff}`:diff}</span>;
                          })()}
                        </div>
                      </div>
                    );
                  })}
                  {rankingsList.length===0&&<div style={{padding:16,textAlign:"center",color:C.dim,fontSize:11}}>No available players</div>}
                </div>

                {/* Panel footer */}
                <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`,fontSize:9,color:C.dim}}>
                  {rankingsList.length} available · {gridRankView==="mine"?"Sorted by your rank":"Sorted by Sleeper rank"}
                </div>
              </div>

            </div>
          </>;
        })()}

        {/* ═══ TIERS ═══ */}
        {tab==="tiers"&&<>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {POSITIONS.map(p=>(<button key={p} onClick={()=>setPosFilter(p)} style={{...btn(posFilter===p?(POS_C[p]||C.accent):C.dimmer,true),fontSize:10,padding:"4px 8px"}}>{p}</button>))}
          </div>
          {tierGroups.length===0&&<p style={{color:C.dim,fontSize:12}}>No tiers defined for this position. Go to Edit Rankings to create tiers.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tierGroups.map(g=>{
              const avail=g.players.filter(p=>!p.drafted).length;
              return (
                <div key={g.id} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",borderLeft:`3px solid ${g.color}`}}>
                  <div style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Badge color={POS_C[g.pos]}>{g.pos}</Badge>
                      <span style={{fontWeight:700,fontSize:12,color:g.color}}>{g.name}</span>
                      <span style={{fontSize:10,color:C.dim,marginLeft:"auto"}}>{avail}/{g.players.length}</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {g.players.map(p=>(<span key={p.id} style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:p.drafted?"rgba(0,0,0,.3)":C.bg,color:p.drafted?C.dimmer:C.text,border:`1px solid ${p.drafted?C.dimmer+"40":C.border}`,textDecoration:p.drafted?"line-through":"none",opacity:p.drafted?.35:1}}>
                        <span style={{color:g.color,fontSize:9,fontWeight:700,marginRight:3}}>{p.posRk}</span>{p.player}
                        {p.slpRk&&(()=>{const d=p.slpRk-p.posRk;return Math.abs(d)>2?<span style={{fontSize:9,marginLeft:4,color:d>0?C.green:C.red,fontWeight:700}}>{d>0?`+${d}`:d}</span>:null;})()}
                      </span>))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ═══ MY TEAM ═══ */}
        {tab==="team"&&<>
          <h2 style={{fontSize:15,fontWeight:700,margin:"0 0 14px"}}>My Roster ({myPicks.length})</h2>
          {myPicks.length===0?<p style={{color:C.dim,fontSize:12}}>No players drafted yet.</p>:(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
              {["QB","RB","WR","TE"].map(pos=>{
                const group=myPicks.filter(p=>p.pos===pos);if(!group.length)return null;
                return (<div key={pos} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><Badge color={POS_C[pos]}>{pos}</Badge><span style={{fontSize:11,color:C.dim}}>{group.length}</span></div>
                  {group.map(p=>(<div key={p.id} style={{padding:"5px 0",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12}}>{p.player}</span><span style={{fontSize:9,color:C.dim,fontFamily:"monospace"}}>#{p.rank}</span></div>))}
                </div>);
              })}
            </div>
          )}
          <div style={{marginTop:20,background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:"0 0 10px"}}>Needs</h3>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[{pos:"QB",n:1},{pos:"RB",n:2},{pos:"WR",n:3},{pos:"TE",n:1}].map(({pos,n})=>{
                const have=myPicks.filter(p=>p.pos===pos).length;
                return (<div key={pos} style={{display:"flex",alignItems:"center",gap:6}}><Badge color={POS_C[pos]}>{pos}</Badge><span style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:have>=n?C.green:C.amber}}>{have}/{n}</span></div>);
              })}
            </div>
          </div>
        </>}

        {/* ═══ EDIT RANKINGS ═══ */}
        {tab==="edit"&&<>
          {/* Add Player */}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,marginBottom:16}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:"0 0 10px"}}>Add Player</h3>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input value={addName} onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder="Player name"
                style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none",width:180}} />
              <select value={addPos} onChange={e=>setAddPos(e.target.value)} style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none"}}>
                {["QB","RB","WR","TE"].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <select value={addTier} onChange={e=>setAddTier(e.target.value)} style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none"}}>
                <option value="">No tier</option>
                {Object.entries(tiers[addPos]||{}).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
              </select>
              <input value={addSlpRk} onChange={e=>setAddSlpRk(e.target.value)} placeholder="Sleeper rank" type="number"
                style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none",width:100}} />
              <button onClick={addPlayer} style={btn(C.green,true)}>Add</button>
            </div>
          </div>

          {/* Tier Manager */}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,marginBottom:16}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:"0 0 10px"}}>Manage Tiers</h3>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["QB","RB","WR","TE"].map(p=>(<button key={p} onClick={()=>setTierEditPos(p)} style={{...btn(tierEditPos===p?(POS_C[p]):C.dimmer,true),fontSize:10,padding:"4px 8px"}}>{p} ({Object.keys(tiers[p]||{}).length})</button>))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {Object.entries(tiers[tierEditPos]||{}).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:C.bg,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:10,fontWeight:700,color:getTierColor(k),minWidth:24}}>{k}</span>
                  <input value={v.name} onChange={e=>renameTierDef(tierEditPos,k,e.target.value)}
                    style={{flex:1,background:"transparent",color:C.text,border:"none",fontSize:12,outline:"none"}} />
                  <button onClick={()=>removeTierDef(tierEditPos,k)} style={{...btn("#7f1d1d",true),fontSize:9,padding:"2px 6px"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={newTierName} onChange={e=>setNewTierName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTierDef(tierEditPos)}
                placeholder={`New ${tierEditPos} tier name`} style={{flex:1,background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none"}} />
              <button onClick={()=>addTierDef(tierEditPos)} style={btn(C.accent,true)}>Add Tier</button>
            </div>
          </div>

          {/* Player Reorder */}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <h3 style={{fontSize:13,fontWeight:700,margin:0}}>Reorder Players</h3>
              <div style={{display:"flex",gap:3,marginLeft:8}}>
                {["QB","RB","WR","TE"].map(p=>(<button key={p} onClick={()=>setEditPos(p)} style={{...btn(editPos===p?(POS_C[p]):C.dimmer,true),fontSize:10,padding:"4px 8px"}}>{p}</button>))}
              </div>
              <button onClick={recalcOverallRanks} style={{...btn(C.accent,true),marginLeft:"auto",fontSize:9}}>Recalc Overall Ranks</button>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {getPosList(editPos).map((p,idx,arr)=>{
                const tierName=tiers[editPos]?.[p.tier]?.name||"";
                const tierColor=p.tier?getTierColor(p.tier):C.dimmer;
                const posTiers=tiers[editPos]||{};
                // Show tier divider
                const prevTier=idx>0?arr[idx-1].tier:null;
                const showDivider=p.tier&&p.tier!==prevTier;

                return (<div key={p.id}>
                  {showDivider&&<div style={{padding:"4px 10px",marginTop:idx>0?6:0,marginBottom:2}}>
                    <span style={{fontSize:10,fontWeight:700,color:tierColor}}>{tierName}</span>
                  </div>}
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:C.bg,borderRadius:6,border:`1px solid ${C.border}`,borderLeft:`3px solid ${tierColor}`}}>
                    <span style={{fontFamily:"monospace",fontSize:10,color:C.dim,minWidth:28,fontWeight:700}}>{p.pos}{p.posRk}</span>
                    <span style={{flex:1,fontSize:12,fontWeight:600,color:C.text}}>{p.player}</span>

                    {/* Tier selector */}
                    <select value={p.tier} onChange={e=>setPlayerTier(p.id,e.target.value)}
                      style={{background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",fontSize:10,outline:"none",maxWidth:120}}>
                      <option value="">No tier</option>
                      {Object.entries(posTiers).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                    </select>

                    {/* On board toggle */}
                    <button onClick={()=>setPlayerOnBoard(p.id,!p.onBoard)} style={{...btn(p.onBoard?C.accent:C.dimmer,true),fontSize:8,padding:"2px 6px"}}>{p.onBoard?"Board":"Deep"}</button>

                    {/* Move buttons */}
                    <div style={{display:"flex",flexDirection:"column",gap:1}}>
                      <button onClick={()=>movePlayer(p.id,-1)} disabled={idx===0} style={{...btn(C.dimmer,true),fontSize:10,padding:"1px 6px",opacity:idx===0?.3:1}}>▲</button>
                      <button onClick={()=>movePlayer(p.id,1)} disabled={idx===arr.length-1} style={{...btn(C.dimmer,true),fontSize:10,padding:"1px 6px",opacity:idx===arr.length-1?.3:1}}>▼</button>
                    </div>

                    {/* Jump to rank */}
                    <input type="number" min={1} max={arr.length} value="" placeholder="#"
                      onChange={e=>{const v=parseInt(e.target.value);if(!isNaN(v))moveToRank(p.id,v);}}
                      style={{width:36,background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",fontSize:10,outline:"none",textAlign:"center"}} />

                    <button onClick={()=>removePlayer(p.id)} style={{...btn("#7f1d1d",true),fontSize:9,padding:"2px 6px"}}>✕</button>
                  </div>
                </div>);
              })}
            </div>
          </div>
        </>}

        {/* ═══ SLEEPER ═══ */}
        {tab==="sleeper"&&<>
          <h2 style={{fontSize:15,fontWeight:700,margin:"0 0 4px"}}>Sleeper Integration</h2>
          <p style={{color:C.dim,fontSize:11,margin:"0 0 14px"}}>Connect to pull rosters, standings, and draft data.</p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <input value={slUser} onChange={e=>setSlUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&connectSleeper()} placeholder="Sleeper username"
              style={{flex:1,maxWidth:250,background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",fontSize:12,outline:"none"}} />
            <button onClick={connectSleeper} style={btn(C.accent)}>Connect</button>
          </div>
          {slMsg&&<p style={{color:C.amber,fontSize:11,marginBottom:10}}>{slMsg}</p>}
          {slData&&<>
            <p style={{color:C.green,fontSize:12,marginBottom:10}}>Connected as <strong>{slData.user.display_name||slData.user.username}</strong> - {slData.leagues.length} league{slData.leagues.length!==1?"s":""} ({slData.season})</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {slData.leagues.map(lg=>(<button key={lg.league_id} onClick={()=>selectLeague(lg)} style={{...btn(selLeague?.league_id===lg.league_id?"rgba(0,194,209,.15)":C.card),textAlign:"left",padding:"10px 14px",border:`1px solid ${selLeague?.league_id===lg.league_id?C.accent:C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span><strong>{lg.name}</strong><span style={{color:C.dim,marginLeft:6,fontWeight:400,fontSize:10}}>{lg.total_rosters} teams · {lg.scoring_settings?.rec===1?"PPR":lg.scoring_settings?.rec===0.5?"Half PPR":"Standard"}</span></span>
                {selLeague?.league_id===lg.league_id&&<span style={{color:C.green,fontSize:10}}>Active</span>}
              </button>))}
            </div>
          </>}
          {leagueDetail&&playerDb&&<>
            <h3 style={{fontSize:13,fontWeight:700,margin:"14px 0 8px"}}>Rosters</h3>
            {leagueDetail.rosters?.map(roster=>{
              const owner=leagueDetail.users?.find(u=>u.user_id===roster.owner_id);
              const starters=(roster.starters||[]).map(pid=>{const pl=playerDb[pid];return pl?{name:`${pl.first_name} ${pl.last_name}`,pos:pl.position}:{name:pid,pos:"?"};});
              return (<details key={roster.roster_id} style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,padding:"8px 12px",marginBottom:6}}>
                <summary style={{cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",justifyContent:"space-between"}}>
                  <span>{owner?.display_name||owner?.username||`Roster ${roster.roster_id}`}</span>
                  <span style={{color:C.dim,fontFamily:"monospace",fontSize:10}}>{roster.settings?.wins||0}-{roster.settings?.losses||0} · {(roster.players||[]).length}p</span>
                </summary>
                <div style={{marginTop:6,fontSize:11,color:C.dim,lineHeight:1.7}}>
                  {starters.map((s,i)=>(<div key={i}><Badge color={POS_C[s.pos]}>{s.pos}</Badge> <span style={{marginLeft:4}}>{s.name}</span></div>))}
                </div>
              </details>);
            })}
          </>}
        </>}
      </div>
    </div>
  );
}
