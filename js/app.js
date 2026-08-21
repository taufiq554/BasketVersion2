// ============================================
// GaneMaX Basketball - MAIN APP (FIXED VERSION)
// ============================================

// ===== 1. IMPORT CONFIG =====
import {
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
} from './config.js';

// ===== 2. STATE =====
let currentLeagueSlug = 'nba';
let currentScheduleDateStr = getFormattedDateStr(new Date());
let standingsViewMode = 'overall';
let currentUser = JSON.parse(localStorage.getItem('ganemax_user_session')) || null;
let globalEventsData = [];
let rawStandingsData = null;
let currentFilter = 'all';
let selectedQrisAmount = 49000;
let selectedQrisPlanName = '1 Bulan VIP Pro';
let apiRequestTimestamps = [];
let tokensUsedToday = 0;
let aiIsLoading = false;

// ===== 3. HELPER FUNCTIONS =====
function isUserVipActive(user) {
  if (!user) return false;
  if (user?.email?.toLowerCase() === 'taufiq.pagarnusa99@gmail.com' || user?.role === 'admin') return true;
  if (!user?.is_vip) return false;
  if (user?.vip_expires_at) {
    const expDate = new Date(user.vip_expires_at);
    const now = new Date();
    return expDate >= now;
  }
  return user?.is_vip || false;
}

function checkApiRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const oneHourAgo = now - 3600000;
  apiRequestTimestamps = apiRequestTimestamps.filter(t => t > oneHourAgo);
  const lastMinute = apiRequestTimestamps.filter(t => t > oneMinuteAgo).length;
  if (lastMinute >= API_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    throw new Error(`❌ RATE LIMIT: Max ${API_CONFIG.MAX_REQUESTS_PER_MINUTE} requests per minute.`);
  }
  if (apiRequestTimestamps.length >= API_CONFIG.MAX_REQUESTS_PER_HOUR) {
    throw new Error(`❌ RATE LIMIT: Max ${API_CONFIG.MAX_REQUESTS_PER_HOUR} requests per hour.`);
  }
  return true;
}

function recordApiRequest(tokensUsed = 0) {
  apiRequestTimestamps.push(Date.now());
  tokensUsedToday += tokensUsed;
  localStorage.setItem('ganemax_tokens_today', String(tokensUsedToday));
}

function resetDailyTokens() {
  const lastReset = localStorage.getItem('ganemax_tokens_reset_date');
  const today = new Date().toDateString();
  if (lastReset !== today) {
    tokensUsedToday = 0;
    localStorage.setItem('ganemax_tokens_reset_date', today);
    localStorage.setItem('ganemax_tokens_today', '0');
  } else {
    tokensUsedToday = parseInt(localStorage.getItem('ganemax_tokens_today') || '0');
  }
}

// ===== 4. RENDER FUNCTIONS =====
function renderLeagueBadges() {
  const container = document.getElementById('league-badges-container');
  if (!container) return;
  container.innerHTML = LEAGUES_LIST.map(item => `
    <button onclick="window.changeLeague('${item.slug}')" id="league-badge-${item.slug}" 
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-action-blue active:scale-95 text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0">
      <img src="${item.logo}" class="w-5 h-5 object-contain shrink-0" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';">
      <span>${item.name}</span>
    </button>
  `).join('');
  highlightActiveLeagueBadge();
}

function highlightActiveLeagueBadge() {
  LEAGUES_LIST.forEach(item => {
    const btn = document.getElementById(`league-badge-${item.slug}`);
    if (btn) {
      if (item.slug === currentLeagueSlug) {
        btn.className = "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-action-blue bg-action-blue text-white text-xs font-bold whitespace-nowrap transition-all shadow-md shadow-action-blue/20 scale-105 shrink-0";
      } else {
        btn.className = "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-action-blue text-text-sub hover:text-text-main text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0";
      }
    }
  });
}

function renderTicker(events) {
  const container = document.getElementById('espn-ticker-container');
  if (!container) return;
  if (!events || events.length === 0) {
    container.innerHTML = `<span class="text-slate-400 text-xs">Tidak ada pertandingan aktif.</span>`;
    return;
  }
  container.innerHTML = events.slice(0, 10).map(event => {
    const comp = event?.competitions?.[0];
    if (!comp) return '';
    const home = comp?.competitors?.find(c => c.homeAway === 'home');
    const away = comp?.competitors?.find(c => c.homeAway === 'away');
    const isLive = event?.status?.type?.state === 'in';
    const isFinal = event?.status?.type?.state === 'post';
    const statusText = isLive 
      ? `<span class="text-live-red text-[10px] font-bold animate-pulse">${event?.status?.type?.shortDetail || 'LIVE'}</span>` 
      : (isFinal ? `<span class="text-slate-400 text-[10px]">FINAL</span>` : `<span class="text-action-blue text-[10px] font-mono">${event?.status?.type?.shortDetail || 'SCHEDULED'}</span>`);
    return `
      <div onclick="window.openMatchDetail('${event.id}')" class="bg-slate-800 hover:bg-slate-700 cursor-pointer px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-3 whitespace-nowrap transition-all shrink-0 active:scale-95">
        <span class="font-bold flex items-center gap-1.5">
          <img src="${away?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-4 h-4 object-contain shrink-0">
          ${away?.team?.abbreviation || away?.team?.name || '--'} ${away?.score || '0'}
        </span>
        ${statusText}
        <span class="font-bold flex items-center gap-1.5">
          <img src="${home?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-4 h-4 object-contain shrink-0">
          ${home?.team?.abbreviation || home?.team?.name || '--'} ${home?.score || '0'}
        </span>
      </div>
    `;
  }).join('');
}

function renderHeroCard(heroEvent) {
  const container = document.getElementById('hero-card-content');
  if (!container) return;
  if (!heroEvent) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-text-sub">Tidak ada pertandingan.</div>`;
    return;
  }
  const comp = heroEvent?.competitions?.[0];
  if (!comp) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-text-sub">Data pertandingan tidak lengkap.</div>`;
    return;
  }
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');
  const isLive = heroEvent?.status?.type?.state === 'in';
  const detailStatus = heroEvent?.status?.type?.detail || 'Basketball Match';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full ${isLive ? 'bg-live-red' : 'bg-action-blue'} text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-white ${isLive ? 'animate-pulse' : ''}"></span> ${isLive ? 'LIVE BROADCAST' : 'FEATURED MATCH'}
        </span>
        <span class="text-xs text-text-sub font-medium truncate max-w-[180px] sm:max-w-none">${comp?.venue?.fullName || 'Basketball Arena'}</span>
      </div>
      <span class="text-xs font-mono font-bold text-action-blue shrink-0">${detailStatus}</span>
    </div>
    <div class="grid grid-cols-12 items-center gap-2 sm:gap-4 py-2">
      <div class="col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
        <div class="flex items-center gap-2 sm:gap-3 w-full">
          <img src="${away?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-9 h-9 sm:w-14 sm:h-14 object-contain shrink-0" alt="${away?.team?.name || ''}">
          <div class="min-w-0 flex-1">
            <h2 class="font-display font-extrabold text-xs sm:text-xl tracking-tight text-text-main truncate">${away?.team?.displayName || '--'}</h2>
            <p class="text-[10px] sm:text-xs text-text-sub truncate">${away?.records?.[0]?.summary || 'Record --'}</p>
          </div>
        </div>
      </div>
      <div class="col-span-4 flex flex-col items-center justify-center text-center shrink-0">
        <div class="flex items-center justify-center gap-2 sm:gap-4 font-mono font-extrabold text-xl sm:text-4xl tracking-tight text-text-main">
          <span class="text-action-blue">${away?.score || '0'}</span>
          <span class="text-xs font-sans text-text-sub font-normal">VS</span>
          <span>${home?.score || '0'}</span>
        </div>
        <button onclick="window.openMatchDetail('${heroEvent.id}')" class="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full hover:bg-emerald-100 active:scale-95 transition-all">
          <i class="fa-solid fa-chart-line"></i> Boxscore Detail
        </button>
      </div>
      <div class="col-span-4 flex flex-col items-center sm:items-end text-center sm:text-right min-w-0">
        <div class="flex flex-row-reverse sm:flex-row items-center gap-2 sm:gap-3 w-full justify-end">
          <div class="min-w-0 flex-1">
            <h2 class="font-display font-extrabold text-xs sm:text-xl tracking-tight text-text-main truncate">${home?.team?.displayName || '--'}</h2>
            <p class="text-[10px] sm:text-xs text-text-sub truncate">${home?.records?.[0]?.summary || 'Record --'}</p>
          </div>
          <img src="${home?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-9 h-9 sm:w-14 sm:h-14 object-contain shrink-0" alt="${home?.team?.name || ''}">
        </div>
      </div>
    </div>
  `;
}

function renderMatchCards(events) {
  const container = document.getElementById('match-cards-container');
  if (!container) return;
  let filtered = events || [];
  if (currentFilter !== 'all') {
    filtered = filtered.filter(e => e?.status?.type?.state === currentFilter);
  }
  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center py-8 text-text-sub text-xs">Tidak ada pertandingan dalam kategori ini.</div>`;
    return;
  }
  container.innerHTML = filtered.map(event => {
    const comp = event?.competitions?.[0];
    if (!comp) return '';
    const home = comp?.competitors?.find(c => c.homeAway === 'home');
    const away = comp?.competitors?.find(c => c.homeAway === 'away');
    const isLive = event?.status?.type?.state === 'in';
    const isFinal = event?.status?.type?.state === 'post';
    const statusBadge = isLive 
      ? `<span class="px-2.5 py-0.5 rounded-full bg-rose-50 text-live-red border border-rose-200 font-bold text-[10px] animate-pulse">${event?.status?.type?.shortDetail || 'LIVE'}</span>` 
      : (isFinal ? `<span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">FINAL</span>` : `<span class="px-2.5 py-0.5 rounded-full bg-soft-blue text-action-blue font-bold text-[10px]">${event?.status?.type?.shortDetail || 'SCHEDULED'}</span>`);
    return `
      <div class="app-card p-4 hover:border-action-blue cursor-pointer relative active:scale-95 transition-all" onclick="window.openMatchDetail('${event.id}')">
        <div class="flex justify-between items-center text-xs mb-3 pb-2 border-b border-slate-100">
          <span class="text-text-sub font-semibold flex items-center gap-1.5"><i class="fa-solid fa-trophy text-court-gold"></i> ${event?.leagueName || event?.season?.slug || currentLeagueSlug.toUpperCase()}</span>
          ${statusBadge}
        </div>
        <div class="space-y-2.5">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <img src="${away?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-7 h-7 object-contain shrink-0">
              <span class="font-bold text-xs sm:text-sm text-text-main truncate">${away?.team?.displayName || '--'}</span>
            </div>
            <span class="font-mono font-extrabold text-base text-action-blue shrink-0">${away?.score || '--'}</span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <img src="${home?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-7 h-7 object-contain shrink-0">
              <span class="font-bold text-xs sm:text-sm text-text-main truncate">${home?.team?.displayName || '--'}</span>
            </div>
            <span class="font-mono font-extrabold text-base text-text-main shrink-0">${home?.score || '--'}</span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-text-sub">
          <span class="truncate max-w-[180px]"><i class="fa-solid fa-location-dot me-1"></i> ${comp?.venue?.fullName || 'Arena'}</span>
          <span class="text-action-blue font-semibold shrink-0">Boxscore <i class="fa-solid fa-chevron-right text-[9px]"></i></span>
        </div>
      </div>
    `;
  }).join('');
}

function renderAuthHeader() {
  const container = document.getElementById('auth-header-container');
  if (!container) return;
  if (currentUser) {
    const isSuperAdmin = currentUser?.email?.toLowerCase() === 'taufiq.pagarnusa99@gmail.com' || currentUser?.role === 'admin';
    const isVip = isUserVipActive(currentUser);
    const initial = currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U';
    container.innerHTML = `
      <button onclick="window.openProfileModal()" class="relative w-9 h-9 rounded-full bg-action-blue text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-md hover:scale-105 active:scale-90 transition-all shrink-0" title="${currentUser?.full_name || ''}">
        <span>${initial}</span>
        ${isSuperAdmin 
          ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border border-slate-900 flex items-center justify-center text-[7px] text-slate-950 font-black"><i class="fa-solid fa-crown"></i></span>'
          : (isVip ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-court-gold rounded-full border border-slate-900"></span>' : '')}
      </button>
    `;
  } else {
    container.innerHTML = `
      <button onclick="window.openAuthModal('login')" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-text-sub hover:text-action-blue flex items-center justify-center transition-all shadow-sm shrink-0 active:scale-90" title="Masuk / Daftar Akun">
        <i class="fa-solid fa-user-circle text-lg"></i>
      </button>
    `;
  }
  updateAdminNavVisibility();
}

function updateAdminNavVisibility() {
  const isAdmin = currentUser && (currentUser?.email?.toLowerCase() === 'taufiq.pagarnusa99@gmail.com' || currentUser?.role === 'admin');
  const navAdmin = document.getElementById('nav-admin');
  const mobNavAdmin = document.getElementById('mob-nav-admin');
  if (navAdmin) {
    if (isAdmin) navAdmin.classList.remove('hidden');
    else navAdmin.classList.add('hidden');
  }
  if (mobNavAdmin) {
    if (isAdmin) mobNavAdmin.classList.remove('hidden');
    else mobNavAdmin.classList.add('hidden');
  }
}

// ===== 5. CORE FUNCTIONS (EXPOSED TO WINDOW) =====

function switchTab(tabName) {
  console.log('switchTab called:', tabName);
  const tabs = ['scores', 'schedule', 'standings', 'news', 'teams', 'ai', 'injuries', 'transactions', 'admin'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navEl = document.getElementById(`nav-${t}`);
    const mobNavEl = document.getElementById(`mob-nav-${t}`);
    if (el) el.classList.add('hidden');
    if (navEl) {
      navEl.classList.remove('tab-btn-active');
      navEl.classList.add('text-text-sub');
    }
    if (mobNavEl) mobNavEl.classList.remove('active');
  });
  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.remove('hidden');
  const targetNav = document.getElementById(`nav-${tabName}`);
  if (targetNav) {
    targetNav.classList.add('tab-btn-active');
    targetNav.classList.remove('text-text-sub');
  }
  const targetMobNav = document.getElementById(`mob-nav-${tabName}`);
  if (targetMobNav) targetMobNav.classList.add('active');

  const hero = document.getElementById('scoreboard-hero');
  const ticker = document.getElementById('games-ticker-section');
  if (hero && ticker) {
    if (tabName !== 'scores') {
      hero.classList.add('hidden');
      ticker.classList.add('hidden');
    } else {
      hero.classList.remove('hidden');
      ticker.classList.remove('hidden');
    }
  }

  if (tabName === 'scores') fetchAllLeaguesScoreboard();
  if (tabName === 'ai') checkAiAccessPermission();
  if (tabName === 'schedule') fetchEspnSchedule(currentScheduleDateStr);
  if (tabName === 'teams') fetchEspnTeams();
  if (tabName === 'injuries') fetchEspnInjuries();
  if (tabName === 'transactions') fetchEspnTransactions();
  if (tabName === 'standings') fetchEspnStandings();
}

function changeLeague(newSlug) {
  currentLeagueSlug = newSlug;
  highlightActiveLeagueBadge();
  const currentLeagueObj = LEAGUES_LIST.find(l => l.slug === newSlug);
  const name = currentLeagueObj ? currentLeagueObj.name : newSlug.toUpperCase();
  const badge = document.getElementById('active-league-badge-text');
  if (badge) badge.textContent = `GaneMaX Live: ${name}`;
  const tickerLabel = document.getElementById('ticker-league-label');
  if (tickerLabel) tickerLabel.innerHTML = `<i class="fa-solid fa-bolt text-court-gold animate-pulse"></i> ${name.toUpperCase()} LIVE TICKER`;
  refreshCurrentLeagueData(false);
}

function refreshCurrentLeagueData(showSpinner = false) {
  fetchEspnScoreboard(showSpinner);
  fetchEspnNews();
  fetchEspnStandings();
}

function filterMatchCategory(cat) {
  currentFilter = cat;
  ['all', 'in', 'post', 'pre'].forEach(c => {
    const btn = document.getElementById(`btn-filter-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = 'px-3.5 py-1.5 rounded-xl bg-action-blue text-white font-bold transition-all active:scale-95';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl bg-slate-100 text-text-sub hover:text-text-main transition-all active:scale-95';
      }
    }
  });
  renderMatchCards(globalEventsData);
}

// ===== 6. FETCH FUNCTIONS =====

async function fetchAllLeaguesScoreboard() {
  const refreshIcon = document.getElementById('api-refresh-icon');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');
  try {
    const allEvents = [];
    const fetchPromises = LEAGUES_LIST.map(league => 
      fetch(getEspnUrl.scoreboard(league.slug))
        .then(res => res.json())
        .then(data => {
          if (data.events && data.events.length > 0) {
            return data.events.map(event => ({
              ...event,
              leagueSlug: league.slug,
              leagueName: league.name
            }));
          }
          return [];
        })
        .catch(() => [])
    );
    const results = await Promise.all(fetchPromises);
    const combinedEvents = results.flat();
    combinedEvents.sort((a, b) => {
      const stateOrder = { 'in': 0, 'pre': 1, 'post': 2 };
      const stateA = a?.status?.type?.state || 'post';
      const stateB = b?.status?.type?.state || 'post';
      return (stateOrder[stateA] || 2) - (stateOrder[stateB] || 2);
    });
    if (combinedEvents.length > 0) {
      globalEventsData = combinedEvents;
      renderTicker(globalEventsData);
      renderHeroCard(globalEventsData[0]);
      renderMatchCards(globalEventsData);
    } else {
      // Jika kosong, gunakan data awal
      if (globalEventsData.length === 0) {
        globalEventsData = INITIAL_INSTANT_EVENTS;
        renderTicker(globalEventsData);
        renderHeroCard(globalEventsData[0]);
        renderMatchCards(globalEventsData);
      }
    }
    const liveHeader = document.getElementById('live-status-header-text');
    if (liveHeader) {
      const liveCount = combinedEvents.filter(e => e?.status?.type?.state === 'in').length;
      liveHeader.textContent = `GaneMaX Engine: ${liveCount} Match Live (All Leagues)`;
    }
  } catch (error) {
    console.error('Error fetching all leagues:', error);
    // Fallback ke data awal
    if (globalEventsData.length === 0) {
      globalEventsData = INITIAL_INSTANT_EVENTS;
      renderTicker(globalEventsData);
      renderHeroCard(globalEventsData[0]);
      renderMatchCards(globalEventsData);
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }
}

async function fetchEspnScoreboard(showSpinner = false) {
  const refreshIcon = document.getElementById('api-refresh-icon');
  if (showSpinner && refreshIcon) refreshIcon.classList.add('animate-spin');
  try {
    const response = await fetch(getEspnUrl.scoreboard(currentLeagueSlug));
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    if (data.events && data.events.length > 0) {
      const enrichedEvents = data.events.map(event => ({
        ...event,
        leagueSlug: currentLeagueSlug,
        leagueName: LEAGUES_LIST.find(l => l.slug === currentLeagueSlug)?.name || currentLeagueSlug.toUpperCase()
      }));
      globalEventsData = enrichedEvents;
      renderTicker(globalEventsData);
      renderHeroCard(globalEventsData[0]);
      renderMatchCards(globalEventsData);
    } else {
      // Jika tidak ada event, gunakan data awal
      if (globalEventsData.length === 0) {
        globalEventsData = INITIAL_INSTANT_EVENTS;
        renderTicker(globalEventsData);
        renderHeroCard(globalEventsData[0]);
        renderMatchCards(globalEventsData);
      }
    }
    const liveHeader = document.getElementById('live-status-header-text');
    if (liveHeader) {
      const liveCount = globalEventsData.filter(e => e?.status?.type?.state === 'in').length;
      liveHeader.textContent = `GaneMaX Engine: ${liveCount} Match Live`;
    }
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    if (globalEventsData.length === 0) {
      globalEventsData = INITIAL_INSTANT_EVENTS;
      renderTicker(globalEventsData);
      renderHeroCard(globalEventsData[0]);
      renderMatchCards(globalEventsData);
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }
}

// ===== 7. SCHEDULE, STANDINGS, NEWS, TEAMS, ETC =====

function setScheduleDate(type) {
  const now = new Date();
  let targetDate = new Date();
  ['yesterday', 'today', 'tomorrow', 'nextday'].forEach(t => {
    const b = document.getElementById(`sched-date-${t}`);
    if (b) b.className = "px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all whitespace-nowrap";
  });
  if (type === 'yesterday') {
    targetDate.setDate(now.getDate() - 1);
    const btn = document.getElementById('sched-date-yesterday');
    if (btn) btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-action-blue text-white shadow-sm active:scale-95 transition-all whitespace-nowrap";
  } else if (type === 'today') {
    targetDate = now;
    const btn = document.getElementById('sched-date-today');
    if (btn) btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-action-blue text-white shadow-sm active:scale-95 transition-all whitespace-nowrap";
  } else if (type === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1);
    const btn = document.getElementById('sched-date-tomorrow');
    if (btn) btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-action-blue text-white shadow-sm active:scale-95 transition-all whitespace-nowrap";
  } else if (type === 'nextday') {
    targetDate.setDate(now.getDate() + 2);
    const btn = document.getElementById('sched-date-nextday');
    if (btn) btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-action-blue text-white shadow-sm active:scale-95 transition-all whitespace-nowrap";
  } else if (type === 'custom') {
    const customVal = document.getElementById('schedule-custom-date')?.value;
    if (customVal) {
      const parts = customVal.split('-');
      targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  currentScheduleDateStr = getFormattedDateStr(targetDate);
  fetchEspnSchedule(currentScheduleDateStr);
}

async function fetchEspnSchedule(dateStr = currentScheduleDateStr) {
  const container = document.getElementById('schedule-list-container');
  const subtitle = document.getElementById('schedule-league-subtitle');
  if (!container) return;
  const leagueObj = LEAGUES_LIST.find(l => l.slug === currentLeagueSlug);
  const leagueName = leagueObj ? leagueObj.name : currentLeagueSlug.toUpperCase();
  if (subtitle) subtitle.textContent = `Jadwal resmi pertandingan ${leagueName} (${dateStr}).`;
  try {
    const res = await fetch(getEspnUrl.scoreboard(currentLeagueSlug, dateStr));
    const data = await res.json();
    const events = data.events || [];
    if (events.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-xs text-text-sub bg-slate-50 rounded-2xl border border-slate-200 p-4">
          <i class="fa-solid fa-calendar-xmark text-2xl text-slate-300 mb-2"></i>
          <p>Tidak ada jadwal pertandingan ${leagueName} pada tanggal ${dateStr}.</p>
          <button onclick="window.setScheduleDate('today')" class="mt-3 px-3.5 py-1.5 bg-action-blue text-white font-bold rounded-xl text-xs active:scale-95 transition-all">Lihat Hari Ini</button>
        </div>
      `;
      return;
    }
    container.innerHTML = events.map(event => {
      const comp = event?.competitions?.[0];
      if (!comp) return '';
      const home = comp?.competitors?.find(c => c.homeAway === 'home');
      const away = comp?.competitors?.find(c => c.homeAway === 'away');
      const statusText = event?.status?.type?.shortDetail || 'SCHEDULED';
      const venue = comp?.venue?.fullName || 'Arena';
      return `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-action-blue transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <span class="px-2.5 py-1 rounded-lg bg-soft-blue text-action-blue font-mono font-bold text-xs shrink-0">${statusText}</span>
            <div class="flex items-center gap-2 text-text-main font-bold text-xs sm:text-sm truncate">
              <span class="flex items-center gap-1.5 min-w-0">
                <img src="${away?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-5 h-5 object-contain shrink-0">
                <span class="truncate">${away?.team?.displayName || '--'}</span>
              </span>
              <span class="text-text-sub text-xs shrink-0">VS</span>
              <span class="flex items-center gap-1.5 min-w-0">
                <img src="${home?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-5 h-5 object-contain shrink-0">
                <span class="truncate">${home?.team?.displayName || '--'}</span>
              </span>
            </div>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
            <span class="text-text-sub text-[11px] truncate"><i class="fa-solid fa-location-dot me-1"></i> ${venue}</span>
            <button onclick="window.setAiPrompt('Analisis prediksi jadwal ${away?.team?.displayName || ''} vs ${home?.team?.displayName || ''}'); window.switchTab('ai');" class="px-3 py-1 rounded-xl bg-action-blue text-white font-bold text-[10px] hover:bg-action-hover active:scale-95 transition-all shrink-0">
              <i class="fa-solid fa-brain me-1"></i> Prediksi AI
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-rose-500">Gagal memuat jadwal pertandingan.</div>`;
  }
}

function setStandingsViewMode(mode) {
  standingsViewMode = mode;
  const btnOverall = document.getElementById('btn-standings-overall');
  const btnDivided = document.getElementById('btn-standings-divided');
  if (mode === 'overall') {
    if (btnOverall) btnOverall.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold bg-action-blue text-white shadow-sm transition-all active:scale-95";
    if (btnDivided) btnDivided.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium text-text-sub hover:text-text-main transition-all active:scale-95";
  } else {
    if (btnDivided) btnDivided.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold bg-action-blue text-white shadow-sm transition-all active:scale-95";
    if (btnOverall) btnOverall.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium text-text-sub hover:text-text-main transition-all active:scale-95";
  }
  if (rawStandingsData) {
    renderStandingsFromData(rawStandingsData);
  }
}

async function fetchEspnStandings() {
  const container = document.getElementById('standings-sections-container');
  const titleText = document.getElementById('standings-title-text');
  if (!container) return;
  const leagueObj = LEAGUES_LIST.find(l => l.slug === currentLeagueSlug);
  const leagueName = leagueObj ? leagueObj.name : currentLeagueSlug.toUpperCase();
  if (titleText) titleText.textContent = `Klasemen ${leagueName} Season Realtime`;
  try {
    const res = await fetch(getEspnUrl.standings(currentLeagueSlug));
    const data = await res.json();
    rawStandingsData = data;
    renderStandingsFromData(data);
  } catch (err) {
    container.innerHTML = `<div class="p-4 text-xs text-rose-500 text-center">Gagal memuat klasemen liga.</div>`;
  }
}

function renderStandingsFromData(data) {
  const container = document.getElementById('standings-sections-container');
  if (!container) return;
  const leagueObj = LEAGUES_LIST.find(l => l.slug === currentLeagueSlug);
  const leagueName = leagueObj ? leagueObj.name : currentLeagueSlug.toUpperCase();
  let sections = [];
  let allTeamsEntries = [];
  if (data?.children && data.children.length > 0) {
    data.children.forEach(child => {
      const confName = child.name || child.abbreviation || 'Conference';
      let confEntries = [];
      if (child?.standings?.entries) {
        confEntries = child.standings.entries;
      } else if (child?.children && child.children.length > 0) {
        child.children.forEach(sub => {
          if (sub?.standings?.entries) {
            confEntries.push(...sub.standings.entries);
          }
        });
      }
      if (confEntries.length > 0) {
        sections.push({ title: confName, entries: confEntries });
        allTeamsEntries.push(...confEntries);
      }
    });
  } else if (data?.standings?.entries) {
    sections.push({ title: 'Overall Standings', entries: data.standings.entries });
    allTeamsEntries = data.standings.entries;
  }
  if (allTeamsEntries.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-xs text-text-sub bg-slate-50 rounded-2xl border border-slate-200">Data klasemen belum tersedia untuk liga ${leagueName}.</div>`;
    return;
  }
  if (standingsViewMode === 'overall') {
    const uniqueTeamsMap = new Map();
    allTeamsEntries.forEach(entry => {
      if (entry?.team?.id) uniqueTeamsMap.set(entry.team.id, entry);
    });
    const sortedOverallTeams = Array.from(uniqueTeamsMap.values()).sort((a, b) => {
      const pctA = parseFloat(a?.stats?.find(s => s.name === 'winPercent')?.value || 0);
      const pctB = parseFloat(b?.stats?.find(s => s.name === 'winPercent')?.value || 0);
      const winsA = parseInt(a?.stats?.find(s => s.name === 'wins')?.value || 0);
      const winsB = parseInt(b?.stats?.find(s => s.name === 'wins')?.value || 0);
      if (pctB !== pctA) return pctB - pctA;
      return winsB - winsA;
    });
    container.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
          <h4 class="font-bold text-xs text-action-blue uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-trophy text-court-gold"></i> OVERALL ALL STANDINGS (${leagueName})
          </h4>
          <span class="text-[10px] text-text-sub font-mono font-semibold">${sortedOverallTeams.length} Total Tim</span>
        </div>
        <div class="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-text-sub font-semibold uppercase border-b border-slate-200">
              <tr><th class="p-3">Pos / Tim</th><th class="p-3 text-center">M (W)</th><th class="p-3 text-center">K (L)</th><th class="p-3 text-center">PCT</th><th class="p-3 text-center">GB</th><th class="p-3 text-center">STRK</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${sortedOverallTeams.map((entry, idx) => {
                const team = entry.team;
                const stats = entry.stats || [];
                const wins = stats.find(s => s.name === 'wins')?.value || 0;
                const losses = stats.find(s => s.name === 'losses')?.value || 0;
                const pct = stats.find(s => s.name === 'winPercent')?.displayValue || '.000';
                const gb = stats.find(s => s.name === 'gamesBehind')?.displayValue || '-';
                const streak = stats.find(s => s.name === 'streak')?.displayValue || '-';
                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-3 font-bold flex items-center gap-2.5 text-text-main min-w-[180px]">
                      <span class="w-5 text-center ${idx < 4 ? 'text-court-gold font-extrabold' : 'text-text-sub'}">${idx + 1}</span>
                      <img src="${team?.logos?.[0]?.href || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-5 h-5 object-contain shrink-0">
                      <span class="truncate">${team?.displayName || '--'}</span>
                    </td>
                    <td class="p-3 text-center font-mono font-bold">${wins}</td>
                    <td class="p-3 text-center font-mono text-text-sub">${losses}</td>
                    <td class="p-3 text-center font-mono font-bold text-emerald-600">${pct}</td>
                    <td class="p-3 text-center font-mono text-text-sub">${gb}</td>
                    <td class="p-3 text-center font-bold text-emerald-600">${streak}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return;
  }
  container.innerHTML = sections.map(sec => `
    <div class="space-y-3">
      <div class="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
        <h4 class="font-bold text-xs text-action-blue uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group"></i> ${sec.title}
        </h4>
        <span class="text-[10px] text-text-sub font-mono font-semibold">${sec.entries.length} Tim</span>
      </div>
      <div class="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-text-sub font-semibold uppercase border-b border-slate-200">
            <tr><th class="p-3">Pos / Tim</th><th class="p-3 text-center">M (W)</th><th class="p-3 text-center">K (L)</th><th class="p-3 text-center">PCT</th><th class="p-3 text-center">GB</th><th class="p-3 text-center">STRK</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            ${sec.entries.map((entry, idx) => {
              const team = entry.team;
              const stats = entry.stats || [];
              const wins = stats.find(s => s.name === 'wins')?.value || 0;
              const losses = stats.find(s => s.name === 'losses')?.value || 0;
              const pct = stats.find(s => s.name === 'winPercent')?.displayValue || '.000';
              const gb = stats.find(s => s.name === 'gamesBehind')?.displayValue || '-';
              const streak = stats.find(s => s.name === 'streak')?.displayValue || '-';
              return `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="p-3 font-bold flex items-center gap-2.5 text-text-main min-w-[180px]">
                    <span class="w-5 text-center ${idx < 3 ? 'text-court-gold font-extrabold' : 'text-text-sub'}">${idx + 1}</span>
                    <img src="${team?.logos?.[0]?.href || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-5 h-5 object-contain shrink-0">
                    <span class="truncate">${team?.displayName || '--'}</span>
                  </td>
                  <td class="p-3 text-center font-mono font-bold">${wins}</td>
                  <td class="p-3 text-center font-mono text-text-sub">${losses}</td>
                  <td class="p-3 text-center font-mono font-bold text-emerald-600">${pct}</td>
                  <td class="p-3 text-center font-mono text-text-sub">${gb}</td>
                  <td class="p-3 text-center font-bold text-emerald-600">${streak}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('');
}

// ===== 8. NEWS, TEAMS, INJURIES, TRANSACTIONS =====

async function fetchEspnNews() {
  const container = document.getElementById('espn-news-container');
  if (!container) return;
  try {
    const res = await fetch(getEspnUrl.news(currentLeagueSlug));
    const data = await res.json();
    const articles = data.articles || [];
    if (articles.length === 0) {
      container.innerHTML = `<div class="col-span-3 text-center py-6 text-xs text-text-sub">Belum ada berita terbaru.</div>`;
      return;
    }
    container.innerHTML = articles.slice(0, 6).map((art, idx) => `
      <div class="app-card p-4 flex flex-col justify-between ${idx === 0 ? 'md:col-span-2' : ''}" id="news-card-${idx}">
        <div>
          ${art?.images?.[0]?.url ? `<img src="${art.images[0].url}" class="w-full h-40 object-cover rounded-xl mb-3" onerror="this.style.display='none'">` : `<div class="w-full h-40 bg-gradient-to-br from-slate-200 to-slate-100 rounded-xl mb-3 flex items-center justify-center"><i class="fa-solid fa-basketball text-slate-400 text-3xl"></i></div>`}
          <span class="text-[10px] font-bold text-action-blue uppercase tracking-wider">BERITA UTAMA • ${currentLeagueSlug.toUpperCase()}</span>
          <h4 class="font-display font-bold ${idx === 0 ? 'text-lg' : 'text-sm'} mt-1 mb-2 text-text-main news-headline-${idx}">${art.headline || ''}</h4>
          <p class="text-xs text-text-sub line-clamp-3 mb-4 news-desc-${idx}">${art.description || ''}</p>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center text-[11px] text-text-sub border-t border-slate-100 pt-2">
            <span>${art.published ? new Date(art.published).toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}) + ' WIB' : ''}</span>
            <a href="${art?.links?.web?.href || '#'}" target="_blank" class="text-action-blue font-bold hover:underline">Baca <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>
          </div>
          <button type="button" class="translate-news-btn w-full py-1.5 bg-soft-blue hover:bg-action-blue/10 text-action-blue rounded-lg font-bold text-[10px] active:scale-95 transition-all flex items-center justify-center gap-1 border border-action-blue/20" data-card-idx="${idx}">
            <i class="fa-solid fa-language"></i> Terjemahkan ke ID
          </button>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.translate-news-btn').forEach((btn) => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const cardIdx = this.dataset.cardIdx;
        const headlineEl = document.querySelector(`.news-headline-${cardIdx}`);
        const descEl = document.querySelector(`.news-desc-${cardIdx}`);
        if (!headlineEl || !descEl) return;
        const headline = headlineEl.textContent.trim();
        const description = descEl.textContent.trim();
        await translateNewsArticle(cardIdx, headline, description, this);
      });
    });
  } catch (err) {
    console.error('Error fetching news:', err);
  }
}

async function fetchEspnTeams() {
  const container = document.getElementById('espn-teams-container');
  if (!container) return;
  try {
    const res = await fetch(getEspnUrl.teams(currentLeagueSlug));
    const data = await res.json();
    const teams = data?.sports?.[0]?.leagues?.[0]?.teams || [];
    if (teams.length === 0) {
      container.innerHTML = `<div class="col-span-5 text-center py-6 text-xs text-text-sub">Tidak ada tim terdaftar.</div>`;
      return;
    }
    container.innerHTML = teams.map(item => {
      const t = item.team;
      return `
        <div onclick="window.inspectTeamRoster('${t.id}', '${t.displayName}')" class="app-card p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:border-action-blue active:scale-95 transition-all">
          <img src="${t?.logos?.[0]?.href || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-10 h-10 object-contain mb-2 shrink-0">
          <span class="font-bold text-xs line-clamp-1 text-text-main">${t?.shortDisplayName || t?.name || '--'}</span>
          <span class="text-[10px] text-action-blue font-semibold mt-1">Roster <i class="fa-solid fa-chevron-right text-[8px]"></i></span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error fetching teams:', err);
  }
}

async function inspectTeamRoster(teamId, teamName) {
  const modal = document.getElementById('team-roster-modal');
  const content = document.getElementById('team-roster-content');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="py-12 text-center text-xs"><i class="fa-solid fa-spinner animate-spin text-2xl text-purple-600 mb-2"></i><p>Memuat Roster Pemain ${teamName}...</p></div>`;
  try {
    const res = await fetch(getEspnUrl.teamRoster(teamId, currentLeagueSlug));
    const data = await res.json();
    const athletes = data.athletes || [];
    content.innerHTML = `
      <div class="space-y-4">
        <div class="pb-3 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 class="font-display font-extrabold text-lg text-purple-700">${teamName}</h3>
            <p class="text-xs text-text-sub">Roster Pemain Resmi</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">${athletes.length} Pemain</span>
        </div>
        <div class="space-y-2">
          ${athletes.map(a => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-action-blue w-6 text-center">#${a.jersey || '-'}</span>
                <span class="font-bold text-text-main">${a.displayName || '--'}</span>
              </div>
              <div class="flex items-center gap-2 text-text-sub">
                <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono">${a?.position?.abbreviation || 'F'}</span>
                <span>${a.displayHeight || ''}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-4 text-xs text-rose-500 text-center">Gagal memuat roster.</div>`;
  }
}

async function fetchEspnInjuries() {
  const container = document.getElementById('espn-injuries-container');
  if (!container) return;
  try {
    const res = await fetch(getEspnUrl.injuries(currentLeagueSlug));
    const data = await res.json();
    const injuries = data.injuries || [];
    if (injuries.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-text-sub">Tidak ada laporan cedera aktif.</div>`;
      return;
    }
    container.innerHTML = injuries.slice(0, 10).map(inj => `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
        <div>
          <span class="font-bold text-rose-500 me-2">[${inj.status || 'OUT'}]</span>
          <span class="font-bold text-text-main">${inj?.athlete?.displayName || 'Pemain'}</span>
          <span class="text-text-sub text-[11px] block sm:inline sm:ms-2">${inj?.details?.type || 'Cedera'}</span>
        </div>
        <span class="text-[10px] text-text-sub font-mono">${inj.date ? new Date(inj.date).toLocaleDateString('id-ID') : 'Hari ini'}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching injuries:', err);
  }
}

async function fetchEspnTransactions() {
  const container = document.getElementById('espn-transactions-container');
  if (!container) return;
  try {
    const res = await fetch(getEspnUrl.transactions(currentLeagueSlug));
    const data = await res.json();
    const transactions = data.transactions || [];
    if (transactions.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-text-sub">Belum ada transaksi resmi tercatat.</div>`;
      return;
    }
    container.innerHTML = transactions.slice(0, 10).map(tr => `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div class="flex justify-between items-center text-text-sub text-[10px]">
          <span class="font-mono">${tr.date ? new Date(tr.date).toLocaleDateString('id-ID') : 'Terbaru'}</span>
          <span class="text-amber-600 font-bold uppercase">${tr.type || 'TRADE'}</span>
        </div>
        <p class="font-bold text-text-main">${tr.description || tr.detail || 'Transaksi Roster Pemain'}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

// ===== 9. AI FUNCTIONS =====

function setAiPrompt(text) {
  const input = document.getElementById('ai-prompt-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

async function runAiPrediction() {
  if (aiIsLoading) {
    alert('⏳ GaneMaX.ai sedang menganalisis. Tunggu sebentar...');
    return;
  }
  const promptInput = document.getElementById('ai-prompt-input');
  const responseBox = document.getElementById('ai-response-box');
  const text = promptInput?.value?.trim();
  if (!text || text.length < 5) {
    alert('❌ Tulis prompt minimal 5 karakter!');
    return;
  }
  try {
    resetDailyTokens();
    checkApiRateLimit();
    if (tokensUsedToday >= API_CONFIG.MAX_TOKENS_PER_DAY) {
      throw new Error('❌ Daily limit reached. Coba besok.');
    }
  } catch (err) {
    alert(err.message);
    return;
  }
  aiIsLoading = true;
  if (responseBox) {
    responseBox.classList.remove('hidden');
    responseBox.innerHTML = `
      <div class="flex items-center gap-2 text-action-blue font-semibold py-3">
        <i class="fa-solid fa-spinner animate-spin text-base"></i>
        <span>🤖 GaneMaX.ai sedang menganalisis...</span>
      </div>
    `;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const systemPrompt = `Anda adalah GaneMaX.ai - Analis Basketball Profesional. Berikan analisis REAL dan AKURAT. Gunakan Bahasa Indonesia, bullet points, struktur jelas.`;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ganemax.ai",
        "X-OpenRouter-Title": "GaneMaX.ai Basketball"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        max_tokens: 1200,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.text();
      let msg = `❌ API Error ${response.status}`;
      if (response.status === 402) msg = '❌ API Credit habis. Hubungi admin.';
      else if (response.status === 401) msg = '❌ API Key invalid.';
      else if (response.status === 429) msg = '❌ Rate limit exceeded. Tunggu beberapa menit.';
      else if (response.status >= 500) msg = '❌ Server error. Coba lagi nanti.';
      throw new Error(msg);
    }
    recordApiRequest(1200);
    const data = await response.json();
    const aiMessage = data?.choices?.[0]?.message?.content?.trim();
    if (!aiMessage) throw new Error('❌ API tidak return hasil. Coba lagi.');
    if (responseBox) {
      responseBox.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center justify-between pb-2 border-b border-slate-700">
            <span class="text-court-gold font-bold text-xs flex items-center gap-1">
              <i class="fa-solid fa-brain"></i> ANALISIS GANEMAX.AI
            </span>
            <span class="text-[9px] text-slate-400">${new Date().toLocaleTimeString('id-ID')}</span>
          </div>
          <div class="text-slate-100 text-xs leading-relaxed whitespace-pre-wrap">${aiMessage}</div>
        </div>
      `;
    }
    if (promptInput) promptInput.value = '';
  } catch (err) {
    console.error('AI Error:', err);
    if (responseBox) {
      responseBox.innerHTML = `
        <div class="text-rose-300 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs space-y-1">
          <div><i class="fa-solid fa-exclamation-circle me-1"></i> ${err.message || 'Analisis gagal.'}</div>
          <div class="text-[9px] text-rose-200">Check console (F12) untuk detail.</div>
        </div>
      `;
    }
  } finally {
    aiIsLoading = false;
  }
}

// ===== 10. TRANSLATION =====

async function translateNewsArticle(cardIdx, headline, description, btnEl) {
  const h_el = document.querySelector(`.news-headline-${cardIdx}`);
  const d_el = document.querySelector(`.news-desc-${cardIdx}`);
  if (!h_el || !d_el) return;
  if (!headline || !headline.trim()) return;
  const h = headline.trim();
  const d = (description || '').trim();
  h_el.textContent = '⏳ Translate...';
  d_el.textContent = '⏳ Wait...';
  if (btnEl) btnEl.disabled = true;
  try {
    resetDailyTokens();
    checkApiRateLimit();
    if (tokensUsedToday >= API_CONFIG.MAX_TOKENS_PER_DAY) throw new Error("DAILY LIMIT");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Translate to Indonesian:\n\n${h}\n${d}\n\nResult only:` }],
        max_tokens: 200
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    recordApiRequest(200);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const txt = data?.choices?.[0]?.message?.content?.trim() || '';
    const lines = txt.split('\n').filter(x => x.trim());
    h_el.textContent = lines[0]?.trim() || h;
    d_el.textContent = lines[1]?.trim() || d;
    if (btnEl) {
      btnEl.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i> ✓';
      btnEl.disabled = true;
      btnEl.style.background = '#ecfdf5';
      btnEl.style.color = '#059669';
    }
  } catch (e) {
    console.error('Translate error:', e);
    h_el.textContent = h;
    d_el.textContent = d;
    if (btnEl) {
      btnEl.innerHTML = '<i class="fa-solid fa-x text-rose-500"></i> ✗';
      btnEl.disabled = false;
      btnEl.style.background = '#fef2f2';
      btnEl.style.color = '#dc2626';
    }
  }
}

// ===== 11. MATCH DETAIL =====

async function openMatchDetail(eventId) {
  const modal = document.getElementById('match-detail-modal');
  const content = document.getElementById('match-detail-content');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="py-12 text-center text-xs"><i class="fa-solid fa-spinner animate-spin text-2xl text-action-blue mb-2"></i><p>Memuat Boxscore Detail...</p></div>`;
  try {
    const res = await fetch(getEspnUrl.summary(eventId, currentLeagueSlug));
    const data = await res.json();
    const header = data.header || {};
    const comp = header?.competitions?.[0] || {};
    const home = comp?.competitors?.find(c => c.homeAway === 'home') || {};
    const away = comp?.competitors?.find(c => c.homeAway === 'away') || {};
    content.innerHTML = `
      <div class="space-y-4">
        <div class="text-center pb-4 border-b border-slate-200">
          <span class="text-xs font-semibold text-action-blue">${comp?.venue?.fullName || 'Basketball Arena'}</span>
          <h3 class="font-display font-extrabold text-xl mt-1 text-text-main">${away?.team?.displayName || '--'} vs ${home?.team?.displayName || '--'}</h3>
          <p class="text-xs text-text-sub">${header?.season?.name || 'Tournament Game'}</p>
        </div>
        <div class="flex justify-around items-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="text-center">
            <img src="${away?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-12 h-12 mx-auto mb-1 object-contain">
            <span class="font-bold text-xs">${away?.team?.abbreviation || away?.team?.name || '--'}</span>
            <div class="text-2xl font-mono font-bold text-action-blue">${away?.score || '0'}</div>
          </div>
          <div class="text-xs font-bold text-text-sub">VS</div>
          <div class="text-center">
            <img src="${home?.team?.logo || ''}" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';" class="w-12 h-12 mx-auto mb-1 object-contain">
            <span class="font-bold text-xs">${home?.team?.abbreviation || home?.team?.name || '--'}</span>
            <div class="text-2xl font-mono font-bold text-text-main">${home?.score || '0'}</div>
          </div>
        </div>
        <button onclick="window.setAiPrompt('Analisis pertandingan ${away?.team?.displayName || ''} vs ${home?.team?.displayName || ''}'); window.closeModal('match-detail-modal'); window.switchTab('ai');" class="w-full py-3 bg-action-blue text-white rounded-xl font-bold text-xs hover:bg-action-hover active:scale-95 transition-all shadow-md">
          <i class="fa-solid fa-brain me-1"></i> Minta Analisis GaneMaX.ai
        </button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-4 text-xs text-rose-500 text-center">Gagal memuat detail boxscore.</div>`;
  }
}

// ===== 12. AUTH FUNCTIONS =====

function openAuthModal(mode = 'login') {
  authTabMode = mode;
  switchAuthTab(mode);
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('hidden');
}

function switchAuthTab(mode) {
  authTabMode = mode;
  const loginBtn = document.getElementById('auth-tab-login-btn');
  const regBtn = document.getElementById('auth-tab-register-btn');
  const nameGroup = document.getElementById('form-group-name');
  const submitBtn = document.getElementById('auth-submit-btn');
  if (mode === 'login') {
    if (loginBtn) loginBtn.className = 'flex-1 pb-3 text-sm font-bold border-b-2 border-action-blue text-action-blue';
    if (regBtn) regBtn.className = 'flex-1 pb-3 text-sm font-bold border-b-2 border-transparent text-text-sub hover:text-text-main';
    if (nameGroup) nameGroup.classList.add('hidden');
    if (submitBtn) submitBtn.textContent = 'Masuk Sekarang';
  } else {
    if (regBtn) regBtn.className = 'flex-1 pb-3 text-sm font-bold border-b-2 border-action-blue text-action-blue';
    if (loginBtn) loginBtn.className = 'flex-1 pb-3 text-sm font-bold border-b-2 border-transparent text-text-sub hover:text-text-main';
    if (nameGroup) nameGroup.classList.remove('hidden');
    if (submitBtn) submitBtn.textContent = 'Daftar Akun Baru';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  const fullName = document.getElementById('auth-fullname')?.value.trim();
  const isSuperAdminEmail = email.toLowerCase() === 'taufiq.pagarnusa99@gmail.com';
  if (isSuperAdminEmail && password !== '321') {
    const errorMsg = document.getElementById('auth-error-msg');
    if (errorMsg) {
      errorMsg.textContent = "Kata sandi Super Admin salah.";
      errorMsg.classList.remove('hidden');
    }
    return;
  }
  let mockUsers = getMockUsersDB();
  let existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    existing = {
      id: 'user-' + Date.now(),
      email: email,
      full_name: fullName || (isSuperAdminEmail ? 'Taufiq (Super Admin)' : email.split('@')[0]),
      role: isSuperAdminEmail ? 'admin' : 'user',
      is_vip: isSuperAdminEmail ? true : false,
      vip_expires_at: isSuperAdminEmail ? '2099-12-31' : '',
      subscription_status: isSuperAdminEmail ? 'active' : 'free'
    };
    mockUsers.push(existing);
    setMockUsersDB(mockUsers);
  } else if (isSuperAdminEmail) {
    existing.role = 'admin';
    existing.is_vip = true;
    existing.vip_expires_at = '2099-12-31';
    existing.subscription_status = 'active';
    setMockUsersDB(mockUsers);
  }
  currentUser = existing;
  localStorage.setItem('ganemax_user_session', JSON.stringify(currentUser));
  closeModal('auth-modal');
  renderAuthHeader();
  if (currentUser?.role === 'admin') switchTab('admin');
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('ganemax_user_session');
  closeModal('profile-modal');
  renderAuthHeader();
  switchTab('scores');
}

function openProfileModal() {
  if (!currentUser) return;
  const nameEl = document.getElementById('profile-user-name');
  const emailEl = document.getElementById('profile-user-email');
  const badgeContainer = document.getElementById('profile-badge-container');
  const statusText = document.getElementById('profile-vip-status-text');
  const expiryText = document.getElementById('profile-vip-expiry-text');
  if (nameEl) nameEl.textContent = currentUser.full_name || 'User';
  if (emailEl) emailEl.textContent = currentUser.email;
  const isSuperAdmin = currentUser?.email?.toLowerCase() === 'taufiq.pagarnusa99@gmail.com' || currentUser?.role === 'admin';
  const isVip = isUserVipActive(currentUser);
  if (badgeContainer) {
    if (isSuperAdmin) badgeContainer.innerHTML = `<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs border border-amber-300"><i class="fa-solid fa-shield me-1"></i> Super Admin</span>`;
    else if (isVip) badgeContainer.innerHTML = `<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-court-gold font-bold text-xs border border-amber-300"><i class="fa-solid fa-crown me-1"></i> VIP PRO</span>`;
    else badgeContainer.innerHTML = `<span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">Free Tier</span>`;
  }
  if (statusText) {
    if (isSuperAdmin) statusText.textContent = 'Unlimited Owner Access';
    else if (isVip) statusText.textContent = 'Aktif VIP Pro';
    else statusText.textContent = 'Gratis';
  }
  if (expiryText) {
    if (isSuperAdmin) expiryText.textContent = 'Selamanya (2099)';
    else if (isVip) expiryText.textContent = currentUser.vip_expires_at ? new Date(currentUser.vip_expires_at).toLocaleDateString('id-ID', {year:'numeric', month:'long', day:'numeric'}) : 'Aktif';
    else expiryText.textContent = 'Belum Langganan';
  }
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.remove('hidden');
}

function handleProfileNavClick() {
  if (currentUser) openProfileModal();
  else openAuthModal('login');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
  const updatedUser = JSON.parse(localStorage.getItem('ganemax_user_session'));
  if (updatedUser) {
    currentUser = updatedUser;
    if (modalId === 'qris-modal' || modalId === 'vip-payment-modal' || modalId === 'vip-success-modal') {
      renderAuthHeader();
      checkAiAccessPermission();
    }
  }
}

// ===== 13. PAYWALL & ADMIN =====

function openQrisModal() {
  openQrisModalWithPlan(49000, '1 Bulan VIP Pro');
}

function openQrisModalWithPlan(amount, planName) {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }
  selectedQrisAmount = amount;
  selectedQrisPlanName = planName;
  const titleEl = document.getElementById('qris-modal-title');
  const priceEl = document.getElementById('qris-price-display');
  if (titleEl) titleEl.textContent = `Pembayaran ${planName}`;
  if (priceEl) priceEl.textContent = `Rp ${amount.toLocaleString('id-ID')}`;
  closeModal('profile-modal');
  const modal = document.getElementById('qris-modal');
  if (modal) modal.classList.remove('hidden');
}

function simulateQrisPayment() {
  if (!currentUser) return;
  let daysToAdd = 30;
  if (selectedQrisAmount === 99000) daysToAdd = 60;
  if (selectedQrisAmount === 559000) daysToAdd = 365;
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + daysToAdd);
  currentUser.is_vip = false;
  currentUser.subscription_status = 'pending_approval';
  currentUser.payment_method = 'qris';
  currentUser.payment_plan = selectedQrisPlanName;
  currentUser.payment_date = new Date().toISOString().split('T')[0];
  currentUser.vip_expires_at = expDate.toISOString().split('T')[0];
  localStorage.setItem('ganemax_user_session', JSON.stringify(currentUser));
  const mockUsers = getMockUsersDB();
  const uIndex = mockUsers.findIndex(u => u.email === currentUser.email);
  if (uIndex !== -1) {
    mockUsers[uIndex].is_vip = false;
    mockUsers[uIndex].subscription_status = 'pending_approval';
    mockUsers[uIndex].payment_method = 'qris';
    mockUsers[uIndex].payment_plan = selectedQrisPlanName;
    mockUsers[uIndex].payment_date = currentUser.payment_date;
    mockUsers[uIndex].vip_expires_at = currentUser.vip_expires_at;
    setMockUsersDB(mockUsers);
  }
  closeModal('qris-modal');
  renderAuthHeader();
  renderAdminUserTable();
  alert(`✅ Pembayaran QRIS ${selectedQrisPlanName} BERHASIL!\n\nStatus: MENUNGGU AKTIVASI ADMIN\nKirim bukti ke Telegram @mrpangeranz`);
}

function renderAdminUserTable() {
  const tbody = document.getElementById('admin-user-table-body');
  if (!tbody) return;
  const mockUsers = getMockUsersDB();
  tbody.innerHTML = mockUsers.map(u => {
    const isVipActive = isUserVipActive(u);
    const expValue = u.vip_expires_at || '';
    return `
      <tr class="hover:bg-slate-50">
        <td class="p-3">
          <div class="font-bold text-text-main">${u.full_name || '--'}</div>
          <div class="text-[10px] text-text-sub">${u.email}</div>
        </td>
        <td class="p-3 font-mono">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}">
            ${(u.role || 'user').toUpperCase()}
          </span>
        </td>
        <td class="p-3 font-mono">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isVipActive ? 'bg-emerald-100 text-emerald-700' : u.subscription_status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}">
            ${isVipActive ? 'VIP PRO AKTIF' : u.subscription_status === 'pending_approval' ? '⏳ PENDING' : 'FREE / EXPIRED'}
          </span>
        </td>
        <td class="p-3">
          <input type="date" id="vip-date-input-${u.id}" value="${expValue}" 
            onchange="window.updateUserVipExpiryDate('${u.id}', this.value)"
            class="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-action-blue font-mono cursor-pointer">
        </td>
        <td class="p-3">
          <div class="flex gap-1 flex-wrap">
            ${u.subscription_status === 'pending_approval' ? `
              <button onclick="window.activateUserVip('${u.id}')" class="px-2 py-1 bg-emerald-500 text-white rounded font-bold text-[10px] hover:bg-emerald-600 active:scale-95 transition-all">✅ Activate</button>
              <button onclick="window.rejectUserPayment('${u.id}')" class="px-2 py-1 bg-rose-500 text-white rounded font-bold text-[10px] hover:bg-rose-600 active:scale-95 transition-all">❌ Tolak</button>
            ` : `
              <button onclick="window.extendUserVip('${u.id}', 30)" class="px-2 py-1 bg-action-blue text-white rounded font-bold text-[10px] hover:bg-action-hover active:scale-95 transition-all">+1 Bln</button>
              <button onclick="window.extendUserVip('${u.id}', 365)" class="px-2 py-1 bg-court-gold text-white rounded font-bold text-[10px] hover:brightness-110 active:scale-95 transition-all">+1 Thn</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function activateUserVip(userId) {
  const mockUsers = getMockUsersDB();
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;
  user.is_vip = true;
  user.subscription_status = 'active';
  setMockUsersDB(mockUsers);
  renderAdminUserTable();
  if (currentUser && currentUser.id === userId) {
    currentUser.is_vip = true;
    currentUser.subscription_status = 'active';
    localStorage.setItem('ganemax_user_session', JSON.stringify(currentUser));
    renderAuthHeader();
    checkAiAccessPermission();
  }
  alert(`✅ VIP ${user.full_name || 'User'} berhasil diaktifkan!`);
}

function rejectUserPayment(userId) {
  const mockUsers = getMockUsersDB();
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;
  if (!confirm(`Tolak pembayaran ${user.full_name || 'User'}?`)) return;
  user.is_vip = false;
  user.subscription_status = 'free';
  user.payment_method = null;
  user.payment_date = null;
  setMockUsersDB(mockUsers);
  renderAdminUserTable();
  if (currentUser && currentUser.id === userId) {
    currentUser.is_vip = false;
    currentUser.subscription_status = 'free';
    currentUser.payment_method = null;
    localStorage.setItem('ganemax_user_session', JSON.stringify(currentUser));
    renderAuthHeader();
    checkAiAccessPermission();
  }
  alert(`❌ Pembayaran ${user.full_name || 'User'} ditolak.`);
}

function extendUserVip(userId, days) {
  const mockUsers = getMockUsersDB();
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;
  const baseDate = user.vip_expires_at ? new Date(user.vip_expires_at) : new Date();
  baseDate.setDate(baseDate.getDate() + days);
  const newExpStr = baseDate.toISOString().split('T')[0];
  updateUserVipExpiryDate(userId, newExpStr);
}

function updateUserVipExpiryDate(userId, dateString) {
  const mockUsers = getMockUsersDB();
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.vip_expires_at = dateString;
    user.is_vip = dateString ? new Date(dateString) >= new Date() : false;
    setMockUsersDB(mockUsers);
    renderAdminUserTable();
    if (currentUser && currentUser.id === userId) {
      currentUser.vip_expires_at = user.vip_expires_at;
      currentUser.is_vip = user.is_vip;
      localStorage.setItem('ganemax_user_session', JSON.stringify(currentUser));
      renderAuthHeader();
      checkAiAccessPermission();
    }
  }
}

function refreshAdminData() {
  renderAdminUserTable();
  refreshCurrentLeagueData(true);
}

function checkAiAccessPermission() {
  const overlay = document.getElementById('ai-paywall-overlay');
  const content = document.getElementById('ai-unlocked-content');
  const isVipActive = isUserVipActive(currentUser);
  if (isVipActive) {
    if (overlay) overlay.classList.add('hidden');
    if (content) content.classList.remove('hidden');
  } else {
    if (overlay) overlay.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  }
}

// ===== 14. EXPOSE ALL FUNCTIONS TO WINDOW =====
window.switchTab = switchTab;
window.changeLeague = changeLeague;
window.refreshCurrentLeagueData = refreshCurrentLeagueData;
window.filterMatchCategory = filterMatchCategory;
window.setScheduleDate = setScheduleDate;
window.setStandingsViewMode = setStandingsViewMode;
window.openMatchDetail = openMatchDetail;
window.openAuthModal = openAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleAuthSubmit = handleAuthSubmit;
window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.closeModal = closeModal;
window.openQrisModal = openQrisModal;
window.openQrisModalWithPlan = openQrisModalWithPlan;
window.simulateQrisPayment = simulateQrisPayment;
window.setAiPrompt = setAiPrompt;
window.runAiPrediction = runAiPrediction;
window.fetchEspnNews = fetchEspnNews;
window.fetchEspnTeams = fetchEspnTeams;
window.fetchEspnInjuries = fetchEspnInjuries;
window.fetchEspnTransactions = fetchEspnTransactions;
window.refreshAdminData = refreshAdminData;
window.handleProfileNavClick = handleProfileNavClick;
window.activateUserVip = activateUserVip;
window.rejectUserPayment = rejectUserPayment;
window.extendUserVip = extendUserVip;
window.updateUserVipExpiryDate = updateUserVipExpiryDate;
window.translateNewsArticle = translateNewsArticle;
window.inspectTeamRoster = inspectTeamRoster;

// ===== 15. INIT ON DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 GaneMaX App Initializing...');
  renderLeagueBadges();
  renderAuthHeader();
  updateAdminNavVisibility();
  renderAdminUserTable();

  // Gunakan data awal jika belum ada
  if (globalEventsData.length === 0) {
    globalEventsData = INITIAL_INSTANT_EVENTS;
  }
  renderTicker(globalEventsData);
  renderHeroCard(globalEventsData[0]);
  renderMatchCards(globalEventsData);

  refreshCurrentLeagueData(false);

  setInterval(() => { fetchEspnScoreboard(false); }, 30000);
  console.log('✅ GaneMaX App Ready!');
});

console.log('📦 GaneMaX app.js loaded');
