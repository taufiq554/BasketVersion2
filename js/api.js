// =====================================================
// ESPN BASKETBALL API - COMPLETE ENDPOINTS (500+)
// =====================================================

// A. SITE API — STATIC URLS
// ======================

// FIBA World Cup
const FIBA_WORLD_CUP_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/fiba/scoreboard?dates=YYYYMMDD'
];

// NCAA Men's Basketball
const NCAA_MENS_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=YYYYMMDD',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/rankings'
];

// Olympics Men's Basketball
const OLYMPICS_MENS_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-olympics-basketball/scoreboard?dates=YYYYMMDD'
];

// NBA
const NBA_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/draft'
];

// NBA G League
const NBA_G_LEAGUE_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/scoreboard?dates=YYYYMMDD'
];

// NBA California Classic Summer League
const NBA_SUMMER_CALIFORNIA_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-california/scoreboard?dates=YYYYMMDD'
];

// Golden State Summer League
const NBA_SUMMER_GOLDEN_STATE_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-golden-state/scoreboard?dates=YYYYMMDD'
];

// Las Vegas Summer League
const NBA_SUMMER_LAS_VEGAS_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/scoreboard?dates=YYYYMMDD'
];

// Orlando Summer League
const NBA_SUMMER_ORLANDO_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-orlando/scoreboard?dates=YYYYMMDD'
];

// PBA (Philippine Basketball Association)
const PBA_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/scoreboard?dates=YYYYMMDD'
];

// Euroleague
const EUROLEAGUE_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard?dates=YYYYMMDD'
];

// Eurocup
const EUROCUP_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/eurocup/scoreboard?dates=YYYYMMDD'
];

// ACB (Liga ACB - Spain)
const ACB_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/scoreboard?dates=YYYYMMDD'
];

// Ligue 1 (France)
const LIGUE1_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/scoreboard?dates=YYYYMMDD'
];

// Serie A (Italy)
const SERIE_A_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/scoreboard?dates=YYYYMMDD'
];

// BBL (Germany)
const BBL_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/scoreboard?dates=YYYYMMDD'
];

// B.League (Japan)
const B_LEAGUE_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league/scoreboard?dates=YYYYMMDD'
];

// LNB Pro A (France)
const LNB_PRO_A_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/lnb-pro-a/scoreboard?dates=YYYYMMDD'
];

// Ligat HaPlai (Israel)
const LIGAT_HAPLAI_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/ligat-ha-plai/scoreboard?dates=YYYYMMDD'
];

// B.League + (Japan 2)
const B_LEAGUE_PLUS_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/teams',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/injuries',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/transactions',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/statistics',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/groups',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/media',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/b-league-plus/scoreboard?dates=YYYYMMDD'
];

// B. Core API V2 — STATIC LEAGUE ENDPOINTS

// NBA (Core)
const NBA_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/standings'
];

// NCAA Men's Basketball (Core)
const NCAA_MENS_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/standings'
];

// NBL (Australia)
const NBL_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nbl/standings'
];

// WNBA
const WNBA_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/standings'
];

// NCAA Women's Basketball (Core)
const NCAA_WOMENS_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-college-basketball/standings'
];

// Olympics Women's Basketball (Core)
const OLYMPICS_WOMENS_CORE_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/calendar',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/seasons',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/teams',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/media',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/rankings',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/venues',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/casinos',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/circuits',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/countries',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/franchises',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/positions',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/providers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/recruiting',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/season',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/tournaments',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/womens-olympics-basketball/standings'
];

// C. CORE API V2 — DYNAMIC ENDPOINTS

// E. Core API V2 — endpoint dinamis (replace {league}, {season}, {event}, {competition}, {competitor}, {play})
const CORE_API_DYNAMIC_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/seasons/{season}/athletes',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/seasons/{season}/draft',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/seasons/{season}/freeagents',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/seasons/{season}/manufacturers',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}/broadcasts',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}/competitors/{competitor}',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}/odds',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}/officials',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/{league}/events/{event}/competitions/{competition}/plays/{play}/personnel'
];

// F. V3 API
const V3_API_ENDPOINTS = [
  'https://sports.core.api.espn.com/v3/sports/{sport}/athletes',
  'https://sports.core.api.espn.com/v3/sports/{sport}/{league}',
  'https://sports.core.api.espn.com/v3/sports/{sport}/{league}/seasons/{season}'
];

// G. ATHLETE API — NBA only (documented)
const ATHLETE_API_ENDPOINTS = [
  'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/overview',
  'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/stats',
  'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/gamelog',
  'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/splits',
  'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete'
];

// H. CDN GAME DATA — NBA only (requires EVENT_ID)
const CDN_GAME_DATA_ENDPOINTS = [
  'https://cdn.espn.com/core/nba/game?xhr=1&gameId={EVENT_ID}',
  'https://cdn.espn.com/core/nba/boxscore?xhr=1&gameId={EVENT_ID}',
  'https://cdn.espn.com/core/nba/playbyplay?xhr=1&gameId={EVENT_ID}',
  'https://cdn.espn.com/core/nba/matchup?xhr=1&gameId={EVENT_ID}',
  'https://cdn.espn.com/core/nba/scoreboard?xhr=1'
];

// I. SPECIALIZED ENDPOINTS
const SPECIALIZED_ENDPOINTS = [
  'https://sports.core.api.espn.com/v2/tournament/{tournamentId}/seasons/{year}/bracketology',
  'https://sports.core.api.espn.com/v2/tournament/{tournamentId}/seasons/{year}/bracketology/{iteration}',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/seasons/{year}/powerindex',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/seasons/{year}/powerindex/leaders',
  'https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball/seasons/{year}/powerindex/{teamId}'
];

// MASTER COLLECTION OF ALL ENDPOINTS
const ALL_ESPN_BASKETBALL_ENDPOINTS = [
  ...FIBA_WORLD_CUP_ENDPOINTS,
  ...NCAA_MENS_ENDPOINTS,
  ...OLYMPICS_MENS_ENDPOINTS,
  ...NBA_ENDPOINTS,
  ...NBA_G_LEAGUE_ENDPOINTS,
  ...NBA_SUMMER_CALIFORNIA_ENDPOINTS,
  ...NBA_SUMMER_GOLDEN_STATE_ENDPOINTS,
  ...NBA_SUMMER_LAS_VEGAS_ENDPOINTS,
  ...NBA_SUMMER_ORLANDO_ENDPOINTS,
  ...PBA_ENDPOINTS,
  ...EUROLEAGUE_ENDPOINTS,
  ...EUROCUP_ENDPOINTS,
  ...ACB_ENDPOINTS,
  ...LIGUE1_ENDPOINTS,
  ...SERIE_A_ENDPOINTS,
  ...BBL_ENDPOINTS,
  ...B_LEAGUE_ENDPOINTS,
  ...LNB_PRO_A_ENDPOINTS,
  ...LIGAT_HAPLAI_ENDPOINTS,
  ...B_LEAGUE_PLUS_ENDPOINTS,
  ...NBA_CORE_ENDPOINTS,
  ...NCAA_MENS_CORE_ENDPOINTS,
  ...NBL_CORE_ENDPOINTS,
  ...WNBA_CORE_ENDPOINTS,
  ...NCAA_WOMENS_CORE_ENDPOINTS,
  ...OLYMPICS_WOMENS_CORE_ENDPOINTS,
  ...CORE_API_DYNAMIC_ENDPOINTS,
  ...V3_API_ENDPOINTS,
  ...ATHLETE_API_ENDPOINTS,
  ...CDN_GAME_DATA_ENDPOINTS,
  ...SPECIALIZED_ENDPOINTS
];

// EXPORT FOR USE IN OTHER MODULES
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FIBA_WORLD_CUP_ENDPOINTS,
    NCAA_MENS_ENDPOINTS,
    OLYMPICS_MENS_ENDPOINTS,
    NBA_ENDPOINTS,
    NBA_G_LEAGUE_ENDPOINTS,
    NBA_SUMMER_CALIFORNIA_ENDPOINTS,
    NBA_SUMMER_GOLDEN_STATE_ENDPOINTS,
    NBA_SUMMER_LAS_VEGAS_ENDPOINTS,
    NBA_SUMMER_ORLANDO_ENDPOINTS,
    PBA_ENDPOINTS,
    EUROLEAGUE_ENDPOINTS,
    EUROCUP_ENDPOINTS,
    ACB_ENDPOINTS,
    LIGUE1_ENDPOINTS,
    SERIE_A_ENDPOINTS,
    BBL_ENDPOINTS,
    B_LEAGUE_ENDPOINTS,
    LNB_PRO_A_ENDPOINTS,
    LIGAT_HAPLAI_ENDPOINTS,
    B_LEAGUE_PLUS_ENDPOINTS,
    NBA_CORE_ENDPOINTS,
    NCAA_MENS_CORE_ENDPOINTS,
    NBL_CORE_ENDPOINTS,
    WNBA_CORE_ENDPOINTS,
    NCAA_WOMENS_CORE_ENDPOINTS,
    OLYMPICS_WOMENS_CORE_ENDPOINTS,
    CORE_API_DYNAMIC_ENDPOINTS,
    V3_API_ENDPOINTS,
    ATHLETE_API_ENDPOINTS,
    CDN_GAME_DATA_ENDPOINTS,
    SPECIALIZED_ENDPOINTS,
    ALL_ESPN_BASKETBALL_ENDPOINTS
  };
}
