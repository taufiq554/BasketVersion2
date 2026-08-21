// ============================================
// GaneMaX Basketball - Configuration
// ============================================

export const OPENROUTER_API_KEY = "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";
export const SUPABASE_URL = 'https://cwzbubiyvnvyhjuwtwqw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_XBjm_bsi2pXWKFPJMlr-2w_7CXGd-x3';

export const API_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 5,
  MAX_REQUESTS_PER_HOUR: 20,
  MAX_TOKENS_PER_DAY: 10000
};

export const LEAGUES_LIST = [
  { slug:'nba', name:'NBA', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
  { slug:'wnba', name:'WNBA', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/wnba.png' },
  { slug:'mens-college-basketball', name:'NCAA Men', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mens-college-basketball.png' },
  { slug:'womens-college-basketball', name:'NCAA Women', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/womens-college-basketball.png' },
  { slug:'fiba', name:'FIBA World', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/fiba.png' },
  { slug:'nba-development', name:'G League', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba-development.png' },
  { slug:'nbl', name:'NBL Australia', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nbl.png' },
  { slug:'mens-olympics-basketball', name:'Olympics Men', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mens-olympics-basketball.png' },
  { slug:'nba-summer-las-vegas', name:'Vegas Summer', logo:'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' }
];

export const getEspnUrl = {
  scoreboard: (l, d='') => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/scoreboard${d?'?dates='+d:''}`,
  news: (l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/news`,
  standings: (l) => `https://site.api.espn.com/apis/v2/sports/basketball/${l}/standings`,
  summary: (id,l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/summary?event=${id}`,
  teams: (l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/teams`,
  teamRoster: (id,l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/teams/${id}/roster`,
  injuries: (l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/injuries`,
  transactions: (l) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${l}/transactions`
};

export const INITIAL_INSTANT_EVENTS = [
  { id:'hero-1', leagueSlug:'nba', leagueName:'NBA', season:{slug:'NBA'}, status:{type:{state:'in',detail:'Q4 02:14 - LIVE',shortDetail:'Q4 02:14'}}, competitions:[{venue:{fullName:'Crypto.com Arena'}, competitors:[{homeAway:'home',score:'112',team:{displayName:'Lakers',name:'Lakers',abbreviation:'LAL',logo:'https://a.espncdn.com/i/teamlogos/nba/500/lal.png'},records:[{summary:'42-28'}]},{homeAway:'away',score:'108',team:{displayName:'Warriors',name:'Warriors',abbreviation:'GSW',logo:'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png'},records:[{summary:'39-31'}]}]}]},
  { id:'hero-2', leagueSlug:'nba', leagueName:'NBA', season:{slug:'NBA'}, status:{type:{state:'post',detail:'Final',shortDetail:'FINAL'}}, competitions:[{venue:{fullName:'TD Garden'}, competitors:[{homeAway:'home',score:'124',team:{displayName:'Celtics',name:'Celtics',abbreviation:'BOS',logo:'https://a.espncdn.com/i/teamlogos/nba/500/bos.png'},records:[{summary:'51-19'}]},{homeAway:'away',score:'118',team:{displayName:'Bucks',name:'Bucks',abbreviation:'MIL',logo:'https://a.espncdn.com/i/teamlogos/nba/500/mil.png'},records:[{summary:'44-26'}]}]}]},
  { id:'hero-3', leagueSlug:'nba', leagueName:'NBA', season:{slug:'NBA'}, status:{type:{state:'pre',detail:'08:30 WIB',shortDetail:'08:30 WIB'}}, competitions:[{venue:{fullName:'Ball Arena'}, competitors:[{homeAway:'home',score:'0',team:{displayName:'Nuggets',name:'Nuggets',abbreviation:'DEN',logo:'https://a.espncdn.com/i/teamlogos/nba/500/den.png'},records:[{summary:'46-24'}]},{homeAway:'away',score:'0',team:{displayName:'Suns',name:'Suns',abbreviation:'PHX',logo:'https://a.espncdn.com/i/teamlogos/nba/500/phx.png'},records:[{summary:'38-32'}]}]}]}
];

export function getFormattedDateStr(d) {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}${m}${day}`;
}

export let mockUsersDB = JSON.parse(localStorage.getItem('ganemax_mock_users')) || [
  { id:'user-admin-99', email:'taufiq.pagarnusa99@gmail.com', full_name:'Taufiq (Super Admin)', role:'admin', is_vip:true, vip_expires_at:'2099-12-31', subscription_status:'active' },
  { id:'user-demo-01', email:'budi@gmail.com', full_name:'Budi Santoso', role:'user', is_vip:false, vip_expires_at:'', subscription_status:'free' }
];

export function saveMockUsers() { localStorage.setItem('ganemax_mock_users', JSON.stringify(mockUsersDB)); }
export function getMockUsers() { return mockUsersDB; }
export function setMockUsers(newData) { mockUsersDB = newData; saveMockUsers(); }
