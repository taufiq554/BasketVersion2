// ============================================
// GaneMaX Basketball - Configuration File
// ============================================

// 1. OPENROUTER AI API KEY
export const OPENROUTER_API_KEY = "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";

// 2. SUPABASE CREDENTIALS
export const SUPABASE_URL = 'https://cwzbubiyvnvyhjuwtwqw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_XBjm_bsi2pXWKFPJMlr-2w_7CXGd-x3';

// 3. API USAGE CONTROLS
export const API_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 5,
  MAX_REQUESTS_PER_HOUR: 20,
  MAX_TOKENS_PER_DAY: 10000
};

// 4. LEAGUES CONFIGURATION
export const LEAGUES_LIST = [
  { slug: 'nba', name: 'NBA', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
  { slug: 'wnba', name: 'WNBA', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/wnba.png' },
  { slug: 'mens-college-basketball', name: 'NCAA Men', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mens-college-basketball.png' },
  { slug: 'womens-college-basketball', name: 'NCAA Women', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/womens-college-basketball.png' },
  { slug: 'fiba', name: 'FIBA World', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/fiba.png' },
  { slug: 'nba-development', name: 'G League', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba-development.png' },
  { slug: 'nbl', name: 'NBL Australia', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nbl.png' },
  { slug: 'mens-olympics-basketball', name: 'Olympics Men', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mens-olympics-basketball.png' },
  { slug: 'nba-summer-las-vegas', name: 'Vegas Summer', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' }
];

// 5. ESPN API URL BUILDER
export const getEspnUrl = {
  scoreboard: (leagueSlug, dateStr = '') => {
    let url = `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/scoreboard`;
    if (dateStr) url += `?dates=${dateStr}`;
    return url;
  },
  news: (leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/news`,
  standings: (leagueSlug) => `https://site.api.espn.com/apis/v2/sports/basketball/${leagueSlug}/standings`,
  summary: (eventId, leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/summary?event=${eventId}`,
  teams: (leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/teams`,
  teamRoster: (teamId, leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/teams/${teamId}/roster`,
  injuries: (leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/injuries`,
  transactions: (leagueSlug) => `https://site.api.espn.com/apis/site/v2/sports/basketball/${leagueSlug}/transactions`
};

// 6. INITIAL SEEDED DATA (INSTANT RENDER)
export const INITIAL_INSTANT_EVENTS = [
  {
    id: 'hero-game-1',
    leagueSlug: 'nba',
    leagueName: 'NBA',
    season: { slug: 'NBA' },
    status: { type: { state: 'in', detail: 'Q4 02:14 - LIVE BROADCAST', shortDetail: 'Q4 02:14' } },
    competitions: [{
      venue: { fullName: 'Crypto.com Arena, Los Angeles' },
      competitors: [
        { homeAway: 'home', score: '112', team: { displayName: 'Los Angeles Lakers', name: 'Lakers', abbreviation: 'LAL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' }, records: [{ summary: '42-28' }] },
        { homeAway: 'away', score: '108', team: { displayName: 'Golden State Warriors', name: 'Warriors', abbreviation: 'GSW', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png' }, records: [{ summary: '39-31' }] }
      ]
    }]
  },
  {
    id: 'hero-game-2',
    leagueSlug: 'nba',
    leagueName: 'NBA',
    season: { slug: 'NBA' },
    status: { type: { state: 'post', detail: 'Final', shortDetail: 'FINAL' } },
    competitions: [{
      venue: { fullName: 'TD Garden, Boston' },
      competitors: [
        { homeAway: 'home', score: '124', team: { displayName: 'Boston Celtics', name: 'Celtics', abbreviation: 'BOS', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' }, records: [{ summary: '51-19' }] },
        { homeAway: 'away', score: '118', team: { displayName: 'Milwaukee Bucks', name: 'Bucks', abbreviation: 'MIL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' }, records: [{ summary: '44-26' }] }
      ]
    }]
  },
  {
    id: 'hero-game-3',
    leagueSlug: 'nba',
    leagueName: 'NBA',
    season: { slug: 'NBA' },
    status: { type: { state: 'pre', detail: '08:30 WIB', shortDetail: '08:30 WIB' } },
    competitions: [{
      venue: { fullName: 'Ball Arena, Denver' },
      competitors: [
        { homeAway: 'home', score: '0', team: { displayName: 'Denver Nuggets', name: 'Nuggets', abbreviation: 'DEN', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' }, records: [{ summary: '46-24' }] },
        { homeAway: 'away', score: '0', team: { displayName: 'Phoenix Suns', name: 'Suns', abbreviation: 'PHX', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' }, records: [{ summary: '38-32' }] }
      ]
    }]
  }
];

// 7. HELPER FUNCTIONS
export function getFormattedDateStr(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj)) {
    dateObj = new Date();
  }
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// 8. MOCK USERS DB - GETTER & SETTER
let _mockUsersDB = null;

export function getMockUsersDB() {
  if (_mockUsersDB === null) {
    const stored = localStorage.getItem('ganemax_mock_users');
    if (stored) {
      try {
        _mockUsersDB = JSON.parse(stored);
      } catch (e) {
        _mockUsersDB = getDefaultUsers();
      }
    } else {
      _mockUsersDB = getDefaultUsers();
    }
  }
  return _mockUsersDB;
}

export function setMockUsersDB(newData) {
  _mockUsersDB = newData;
  localStorage.setItem('ganemax_mock_users', JSON.stringify(_mockUsersDB));
}

export function updateMockUsersDB(updater) {
  const current = getMockUsersDB();
  const updated = updater(current);
  setMockUsersDB(updated);
  return updated;
}

function getDefaultUsers() {
  return [
    {
      id: 'user-admin-99',
      email: 'taufiq.pagarnusa99@gmail.com',
      full_name: 'Taufiq (Super Admin)',
      role: 'admin',
      is_vip: true,
      vip_expires_at: '2099-12-31',
      subscription_status: 'active'
    },
    {
      id: 'user-demo-01',
      email: 'budi@gmail.com',
      full_name: 'Budi Santoso',
      role: 'user',
      is_vip: false,
      vip_expires_at: '',
      subscription_status: 'free'
    }
  ];
}

// 9. EXPORT DEFAULT
export default {
  OPENROUTER_API_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  API_CONFIG,
  LEAGUES_LIST,
  getEspnUrl,
  INITIAL_INSTANT_EVENTS,
  getMockUsersDB,
  setMockUsersDB,
  updateMockUsersDB,
  getFormattedDateStr
};
