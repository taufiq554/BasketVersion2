/**
 * GaneMaX Basketball Controller
 * Mengelola Navigasi Multi-Liga, Overall Standings, Modal BoxScore, H2H, dan Gemini AI
 */

const LEAGUES = [
  { id: 'nba', name: 'NBA', logo: 'https://a.espncdn.com/i/leaguelogos/nba/500/nba.png' },
  { id: 'wnba', name: 'WNBA', logo: 'https://a.espncdn.com/i/leaguelogos/wnba/500/wnba.png' },
  { id: 'mens-college-basketball', name: 'NCAA Basketball', logo: 'https://a.espncdn.com/i/leaguelogos/mens-college-basketball/500/mens-college-basketball.png' },
  { id: 'fiba', name: 'FIBA World', logo: 'https://a.espncdn.com/i/leaguelogos/fiba/500/fiba.png' },
  { id: 'nba-development', name: 'NBA G-League', logo: 'https://a.espncdn.com/i/leaguelogos/nba-development/500/nba-development.png' },
  { id: 'mens-olympics-basketball', name: 'Olympics', logo: 'https://a.espncdn.com/i/leaguelogos/mens-olympics-basketball/500/mens-olympics-basketball.png' }
];

const AppState = {
  currentLeague: 'nba',
  currentDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
  currentTab: 'live',
  statusFilter: 'all',
  searchQuery: '',
  oddsVisible: true,
  autoRefresh: true,
  refreshInterval: null,
  eventsCache: [],
  standingsCache: null,
  newsCache: []
};

document.addEventListener('DOMContentLoaded', () => {
  renderLeaguePills();
  initDatePicker();
  setupEventListeners();
  loadDashboardData();
  startAutoRefreshTimer();
});

function renderLeaguePills() {
  const container = document.getElementById('league-pills-container');
  if (!container) return;

  container.innerHTML = LEAGUES.map(league => `
    <button onclick="selectLeague('${league.id}')" id="pill-league-${league.id}" 
      class="league-pill flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-card-border bg-surface-light text-text-muted hover:text-text-dark text-xs font-bold transition-all whitespace-nowrap shadow-sm">
      <img src="${league.logo}" alt="${league.name}" class="w-4 h-4 object-contain" onerror="this.src='https://a.espncdn.com/i/leaguelogos/nba/500/nba.png'" />
      <span>${league.name}</span>
    </button>
  `).join('');

  updateActiveLeaguePill();
}

function selectLeague(leagueId) {
  AppState.currentLeague = leagueId;
  AppState.standingsCache = null;
  updateActiveLeaguePill();
  loadDashboardData();
  if (AppState.currentTab === 'standings') loadStandingsData();
  if (AppState.currentTab === 'news') loadNewsData();
}

function updateActiveLeaguePill() {
  LEAGUES.forEach(l => {
    const pill = document.getElementById(`pill-league-${l.id}`);
    if (pill) {
      if (l.id === AppState.currentLeague) {
        pill.classList.add('league-pill-active');
        pill.classList.remove('bg-surface-light', 'text-text-muted');
      } else {
        pill.classList.remove('league-pill-active');
        pill.classList.add('bg-surface-light', 'text-text-muted');
      }
    }
  });
}

function initDatePicker() {
  const dateInput = document.getElementById('date-picker');
  if (dateInput) {
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
  }
}

function setQuickDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const formattedIso = d.toISOString().split('T')[0];
  
  const dateInput = document.getElementById('date-picker');
  if (dateInput) dateInput.value = formattedIso;

  AppState.currentDate = formattedIso.replace(/-/g, '');
  loadDashboardData();
}

function changeDate(daysOffset) {
  const dateInput = document.getElementById('date-picker');
  if (!dateInput.value) return;

  const current = new Date(dateInput.value);
  current.setDate(current.getDate() + daysOffset);
  
  const formattedIso = current.toISOString().split('T')[0];
  dateInput.value = formattedIso;
  AppState.currentDate = formattedIso.replace(/-/g, '');
  loadDashboardData();
}

function setupEventListeners() {
  document.getElementById('date-picker')?.addEventListener('change', (e) => {
    if (e.target.value) {
      AppState.currentDate = e.target.value.replace(/-/g, '');
      loadDashboardData();
    }
  });

  document.getElementById('btn-refresh-desktop')?.addEventListener('click', triggerManualRefresh);
  document.getElementById('btn-refresh-mobile')?.addEventListener('click', triggerManualRefresh);

  document.getElementById('btn-toggle-odds')?.addEventListener('click', () => {
    AppState.oddsVisible = !AppState.oddsVisible;
    const textEl = document.getElementById('odds-toggle-text');
    if (textEl) textEl.textContent = `Odds: ${AppState.oddsVisible ? 'ON' : 'OFF'}`;
    renderLiveScores(getFilteredEvents());
  });

  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('btn-clear-search');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.toLowerCase().trim();
      if (clearBtn) {
        if (AppState.searchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
      applyGlobalSearchFilter();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      AppState.searchQuery = '';
      clearBtn.classList.add('hidden');
      applyGlobalSearchFilter();
    });
  }
}

function applyGlobalSearchFilter() {
  const filteredEvents = getFilteredEvents();
  renderLiveScores(filteredEvents);
  renderGamesList(filteredEvents);
  if (AppState.currentTab === 'ai') renderAIPredictions(filteredEvents);
}

function getFilteredEvents() {
  if (!AppState.eventsCache) return [];

  return AppState.eventsCache.filter(g => {
    const matchesSearch = AppState.searchQuery === '' ||
      g.homeTeam.displayName.toLowerCase().includes(AppState.searchQuery) ||
      g.awayTeam.displayName.toLowerCase().includes(AppState.searchQuery) ||
      g.homeTeam.abbreviation.toLowerCase().includes(AppState.searchQuery) ||
      g.awayTeam.abbreviation.toLowerCase().includes(AppState.searchQuery);

    const matchesStatus = AppState.statusFilter === 'all' ||
      (AppState.statusFilter === 'live' && g.status.state === 'in') ||
      (AppState.statusFilter === 'upcoming' && g.status.state === 'pre') ||
      (AppState.statusFilter === 'finished' && g.status.state === 'post');

    return matchesSearch && matchesStatus;
  });
}

function filterGamesStatus(status) {
  AppState.statusFilter = status;
  ['all', 'live', 'upcoming', 'finished'].forEach(s => {
    const btn = document.getElementById(`filter-${s}`);
    if (btn) {
      if (s === status) {
        btn.classList.add('bg-action-blue', 'text-white');
        btn.classList.remove('bg-bg-light', 'text-text-muted');
      } else {
        btn.classList.remove('bg-action-blue', 'text-white');
        btn.classList.add('bg-bg-light', 'text-text-muted');
      }
    }
  });
  applyGlobalSearchFilter();
}

function switchTab(tabName) {
  AppState.currentTab = tabName;
  const tabs = ['live', 'games', 'standings', 'stats', 'leaders', 'injuries', 'rankings', 'transactions', 'ai', 'compare', 'news'];

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.add('hidden');

    const navBtn = document.getElementById(`nav-${t}`);
    if (navBtn) navBtn.classList.remove('tab-btn-active');

    const mobBtn = document.getElementById(`mob-nav-${t}`);
    if (mobBtn) mobBtn.classList.remove('text-action-blue');
  });

  const targetEl = document.getElementById(`tab-${tabName}`);
  if (targetEl) targetEl.classList.remove('hidden');

  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) activeNav.classList.add('tab-btn-active');

  const activeMob = document.getElementById(`mob-nav-${tabName}`);
  if (activeMob) activeMob.classList.add('text-action-blue');

  if (tabName === 'standings' && !AppState.standingsCache) loadStandingsData();
  if (tabName === 'news' && AppState.newsCache.length === 0) loadNewsData();
  if (tabName === 'injuries') loadInjuriesData();
  if (tabName === 'stats') renderTeamStats();
  if (tabName === 'leaders') renderLeaders();
  if (tabName === 'rankings') renderPowerRankings();
  if (tabName === 'transactions') renderTransactions();
  if (tabName === 'ai') renderAIPredictions(getFilteredEvents());
  if (tabName === 'compare') renderCompareTool();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadDashboardData() {
  showRefreshAnimation(true);

  const scoreboardData = await window.espnApi.getScoreboard(AppState.currentLeague, AppState.currentDate);
  
  if (scoreboardData && scoreboardData.events) {
    AppState.eventsCache = scoreboardData.events;
    const filtered = getFilteredEvents();
    renderFeaturedMatch(filtered[0] || scoreboardData.events[0]);
    renderLiveScores(filtered);
    renderGamesList(filtered);
    if (AppState.currentTab === 'ai') renderAIPredictions(filtered);
  } else {
    renderEmptyState();
  }

  showRefreshAnimation(false);
}

function renderFeaturedMatch(game) {
  const container = document.getElementById('featured-match-container');
  if (!container || !game) {
    if (container) container.innerHTML = '';
    return;
  }

  const isLive = game.status.state === 'in';
  const badgeClass = isLive ? 'badge-live' : (game.status.state === 'post' ? 'badge-final' : 'badge-scheduled');

  container.innerHTML = `
    <div class="bg-surface-light rounded-2xl p-5 border border-card-border shadow-md relative overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <span class="px-3 py-1 text-xs font-mono font-bold rounded-full uppercase tracking-wider ${badgeClass} flex items-center gap-1.5">
          ${isLive ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>' : ''} ${game.status.shortDetail}
        </span>
        <span class="text-xs text-text-muted font-mono"><i class="fa-solid fa-location-dot mr-1"></i> ${game.venue}</span>
      </div>

      <div class="grid grid-cols-12 items-center gap-4 text-center my-3">
        <div class="col-span-5 flex items-center justify-end gap-3">
          <div class="text-right hidden sm:block">
            <h3 class="font-display font-bold text-base text-text-dark">${game.homeTeam.displayName}</h3>
            <p class="text-xs text-text-muted font-mono">${game.homeTeam.records}</p>
          </div>
          <img src="${game.homeTeam.logo}" alt="${game.homeTeam.name}" class="w-14 h-14 object-contain" />
        </div>

        <div class="col-span-2 flex flex-col items-center justify-center">
          <div class="font-mono font-extrabold text-3xl text-text-dark tracking-tight">
            ${game.homeTeam.score} - ${game.awayTeam.score}
          </div>
          ${AppState.oddsVisible ? `<span class="mt-1 text-[11px] font-mono font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${game.odds.details}</span>` : ''}
        </div>

        <div class="col-span-5 flex items-center justify-start gap-3">
          <img src="${game.awayTeam.logo}" alt="${game.awayTeam.name}" class="w-14 h-14 object-contain" />
          <div class="text-left hidden sm:block">
            <h3 class="font-display font-bold text-base text-text-dark">${game.awayTeam.displayName}</h3>
            <p class="text-xs text-text-muted font-mono">${game.awayTeam.records}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-card-border/60 flex items-center justify-between text-xs">
        <button onclick="openGameModal('${game.id}')" class="px-3 py-1.5 rounded-lg bg-action-blue text-white font-bold hover:bg-primary-dark transition-all shadow-sm">
          <i class="fa-solid fa-chart-pie mr-1"></i> Box Score & Detail
        </button>
        <span class="text-action-blue font-bold font-mono"><i class="fa-solid fa-brain mr-1"></i> GaneMaX Predictor Available</span>
      </div>
    </div>
  `;
}

function renderLiveScores(events) {
  const container = document.getElementById('live-scoreboard-grid');
  const badgeCount = document.getElementById('live-count-badge');
  if (!container) return;

  if (badgeCount) badgeCount.textContent = `${events.length} Pertandingan`;

  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-surface-light p-8 rounded-2xl text-center border border-card-border shadow-sm">
        <i class="fa-solid fa-basketball text-3xl text-text-muted mb-2"></i>
        <p class="text-sm text-text-muted">Tidak ada pertandingan yang cocok dengan pencarian/filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(game => {
    const isLive = game.status.state === 'in';
    const badgeClass = isLive ? 'badge-live' : (game.status.state === 'post' ? 'badge-final' : 'badge-scheduled');

    return `
      <div class="bg-surface-light p-4 rounded-2xl border border-card-border hover-card-rise flex flex-col justify-between cursor-pointer" onclick="openGameModal('${game.id}')">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-card-border/60 text-xs">
          <span class="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${badgeClass}">
            ${isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block mr-1 animate-pulse"></span>' : ''} ${game.status.shortDetail}
          </span>
          <span class="text-text-muted font-mono text-[11px]">${game.odds.overUnder}</span>
        </div>

        <div class="space-y-3 my-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${game.homeTeam.logo}" class="w-7 h-7 object-contain" alt="">
              <div>
                <p class="font-bold text-xs text-text-dark">${game.homeTeam.displayName}</p>
                <p class="text-[10px] text-text-muted font-mono">${game.homeTeam.records}</p>
              </div>
            </div>
            <span class="font-mono font-extrabold text-lg text-text-dark">${game.homeTeam.score}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${game.awayTeam.logo}" class="w-7 h-7 object-contain" alt="">
              <div>
                <p class="font-bold text-xs text-text-dark">${game.awayTeam.displayName}</p>
                <p class="text-[10px] text-text-muted font-mono">${game.awayTeam.records}</p>
              </div>
            </div>
            <span class="font-mono font-extrabold text-lg text-text-dark">${game.awayTeam.score}</span>
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-card-border/60 flex items-center justify-between text-[11px]">
          <span class="text-text-muted font-mono">${game.odds.details}</span>
          <span class="text-action-blue font-bold">Box Score <i class="fa-solid fa-chevron-right text-[9px]"></i></span>
        </div>
      </div>
    `;
  }).join('');
}

function renderGamesList(events) {
  const container = document.getElementById('games-list-container');
  if (!container) return;

  container.innerHTML = events.map(game => `
    <div class="bg-surface-light p-4 rounded-xl border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-action-blue/40 transition-all cursor-pointer" onclick="openGameModal('${game.id}')">
      <div class="flex items-center gap-3">
        <span class="text-xs font-mono font-bold px-2.5 py-1 bg-bg-light border border-card-border rounded-lg text-text-muted">
          ${game.status.shortDetail}
        </span>
        <span class="text-xs text-text-dark font-medium"><i class="fa-solid fa-location-dot mr-1 text-text-muted"></i> ${game.venue}</span>
      </div>

      <div class="flex items-center gap-6 justify-between md:justify-center">
        <div class="flex items-center gap-2">
          <img src="${game.homeTeam.logo}" class="w-6 h-6 object-contain" alt="">
          <span class="text-xs font-bold text-text-dark">${game.homeTeam.abbreviation}</span>
          <span class="font-mono font-bold text-sm text-text-dark">${game.homeTeam.score}</span>
        </div>

        <span class="text-text-muted font-mono text-xs font-bold">VS</span>

        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-sm text-text-dark">${game.awayTeam.score}</span>
          <span class="text-xs font-bold text-text-dark">${game.awayTeam.abbreviation}</span>
          <img src="${game.awayTeam.logo}" class="w-6 h-6 object-contain" alt="">
        </div>
      </div>

      <div class="text-right text-xs font-mono font-semibold text-amber-600">
        ${game.odds.details}
      </div>
    </div>
  `).join('');
}

async function loadStandingsData() {
  const overallContainer = document.getElementById('overall-standings-container');
  const conferenceContainer = document.getElementById('standings-container');
  if (!overallContainer || !conferenceContainer) return;

  overallContainer.innerHTML = '<div class="p-6 text-center text-text-muted text-xs font-mono">Memuat Overall Standings...</div>';
  conferenceContainer.innerHTML = '<div class="col-span-full text-center p-6 text-text-muted text-xs font-mono">Memuat Conference Standings...</div>';

  const data = await window.espnApi.getStandings(AppState.currentLeague);
  AppState.standingsCache = data;

  if (!data || !data.children) {
    overallContainer.innerHTML = '<div class="p-6 text-center text-text-muted text-xs">Data klasemen tidak tersedia.</div>';
    conferenceContainer.innerHTML = '';
    return;
  }

  let allEntries = [];
  data.children.forEach(group => {
    if (group.standings?.entries) {
      allEntries.push(...group.standings.entries);
    }
  });

  allEntries.sort((a, b) => {
    const pctA = parseFloat(a.stats?.find(s => s.name === 'winPercent')?.value || 0);
    const pctB = parseFloat(b.stats?.find(s => s.name === 'winPercent')?.value || 0);
    return pctB - pctA;
  });

  overallContainer.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-bg-light text-text-muted font-mono border-b border-card-border">
          <tr>
            <th class="p-3">RANK</th>
            <th class="p-3">TIM</th>
            <th class="p-3 text-center">W</th>
            <th class="p-3 text-center">L</th>
            <th class="p-3 text-center">PCT</th>
            <th class="p-3 text-center">HOME</th>
            <th class="p-3 text-center">AWAY</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-card-border/60 text-text-dark font-medium">
          ${allEntries.map((item, idx) => {
            const team = item.team || {};
            const stats = item.stats || [];
            const wins = stats.find(s => s.name === 'wins')?.value || 0;
            const losses = stats.find(s => s.name === 'losses')?.value || 0;
            const pct = stats.find(s => s.name === 'winPercent')?.displayValue || '.000';
            const homeRec = stats.find(s => s.name === 'home')?.displayValue || '0-0';
            const awayRec = stats.find(s => s.name === 'road')?.displayValue || '0-0';

            return `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-3 font-mono font-bold text-action-blue w-10">${idx + 1}</td>
                <td class="p-3 flex items-center gap-2.5">
                  <img src="${team.logos?.[0]?.href || ''}" class="w-5 h-5 object-contain" alt="">
                  <span class="font-bold text-text-dark">${team.displayName || 'Team'}</span>
                </td>
                <td class="p-3 text-center font-mono font-bold text-emerald-600">${wins}</td>
                <td class="p-3 text-center font-mono font-bold text-rose-600">${losses}</td>
                <td class="p-3 text-center font-mono font-bold text-action-blue">${pct}</td>
                <td class="p-3 text-center font-mono text-text-muted">${homeRec}</td>
                <td class="p-3 text-center font-mono text-text-muted">${awayRec}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  conferenceContainer.innerHTML = data.children.map(group => {
    const groupName = group.name || 'Konferensi';
    const entries = group.standings?.entries || [];

    return `
      <div class="bg-surface-light rounded-2xl border border-card-border shadow-sm overflow-hidden">
        <div class="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <h3 class="font-display font-bold text-sm">${groupName}</h3>
          <span class="text-[11px] font-mono text-slate-400">${entries.length} Tim</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-bg-light text-text-muted font-mono border-b border-card-border">
              <tr>
                <th class="p-3">TIM</th>
                <th class="p-3 text-center">W</th>
                <th class="p-3 text-center">L</th>
                <th class="p-3 text-center">PCT</th>
                <th class="p-3 text-center">GB</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-card-border/60 text-text-dark font-medium">
              ${entries.map((item, idx) => {
                const team = item.team || {};
                const stats = item.stats || [];
                const wins = stats.find(s => s.name === 'wins')?.value || 0;
                const losses = stats.find(s => s.name === 'losses')?.value || 0;
                const pct = stats.find(s => s.name === 'winPercent')?.displayValue || '.000';
                const gb = stats.find(s => s.name === 'gamesBehind')?.displayValue || '-';

                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-3 flex items-center gap-2">
                      <span class="font-mono text-text-muted text-[11px] w-4">${idx + 1}</span>
                      <img src="${team.logos?.[0]?.href || ''}" class="w-5 h-5 object-contain" alt="">
                      <span class="font-bold text-text-dark">${team.displayName || 'Tim'}</span>
                    </td>
                    <td class="p-3 text-center font-mono font-bold">${wins}</td>
                    <td class="p-3 text-center font-mono text-text-muted">${losses}</td>
                    <td class="p-3 text-center font-mono text-action-blue font-bold">${pct}</td>
                    <td class="p-3 text-center font-mono text-text-muted">${gb}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

async function openGameModal(eventId) {
  const modal = document.getElementById('game-detail-modal');
  const modalBody = document.getElementById('modal-game-body');
  const modalTitle = document.getElementById('modal-game-title');

  if (!modal || !modalBody) return;

  modalBody.innerHTML = '<div class="text-center py-8 font-mono text-text-muted">Memuat data statistik pertandingan...</div>';
  modal.classList.remove('hidden');

  const summary = await window.espnApi.getGameSummary(AppState.currentLeague, eventId);

  if (!summary || !summary.header) {
    modalBody.innerHTML = '<div class="text-center py-8 text-text-muted">Detail pertandingan tidak tersedia.</div>';
    return;
  }

  const header = summary.header;
  const comp = header.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || {};
  const away = competitors.find(c => c.homeAway === 'away') || {};

  modalTitle.textContent = `${home.team?.abbreviation || 'HOME'} vs ${away.team?.abbreviation || 'AWAY'} - Box Score Detail`;

  const quartersHtml = (home.linescores || []).map((ls, idx) => `
    <tr class="text-center font-mono">
      <td class="p-2 font-bold text-text-muted">Q${idx + 1}</td>
      <td class="p-2">${ls.displayValue || 0}</td>
      <td class="p-2">${away.linescores?.[idx]?.displayValue || 0}</td>
    </tr>
  `).join('');

  modalBody.innerHTML = `
    <div class="bg-bg-light p-4 rounded-xl border border-card-border flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="${home.team?.logo}" class="w-10 h-10 object-contain">
        <div>
          <h4 class="font-bold text-sm text-text-dark">${home.team?.displayName}</h4>
          <span class="font-mono text-xl font-extrabold text-action-blue">${home.score || 0}</span>
        </div>
      </div>
      <span class="font-mono font-bold text-text-muted text-xs">FINAL</span>
      <div class="flex items-center gap-3 text-right">
        <div>
          <h4 class="font-bold text-sm text-text-dark">${away.team?.displayName}</h4>
          <span class="font-mono text-xl font-extrabold text-action-blue">${away.score || 0}</span>
        </div>
        <img src="${away.team?.logo}" class="w-10 h-10 object-contain">
      </div>
    </div>

    <div class="space-y-2">
      <h5 class="font-bold text-xs text-text-dark">Scoreboard Per Quarter</h5>
      <table class="w-full bg-surface-light border border-card-border rounded-xl">
        <thead class="bg-bg-light text-text-muted border-b border-card-border text-[11px]">
          <tr>
            <th class="p-2 text-center">PERIODE</th>
            <th class="p-2 text-center">${home.team?.abbreviation}</th>
            <th class="p-2 text-center">${away.team?.abbreviation}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-card-border/60">
          ${quartersHtml}
        </tbody>
      </table>
    </div>
  `;
}

function closeGameModal() {
  document.getElementById('game-detail-modal')?.classList.add('hidden');
}

async function askCustomAI() {
  const input = document.getElementById('ai-custom-prompt');
  const responseBox = document.getElementById('ai-response-box');

  if (!input || !input.value.trim() || !responseBox) return;

  const prompt = input.value.trim();
  responseBox.classList.remove('hidden');
  responseBox.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-action-blue"></i> Menganalisis dengan Gemini AI...';

  const answer = await window.espnApi.generateAIPrediction(prompt);
  responseBox.innerHTML = `
    <div class="font-bold text-action-blue flex items-center gap-1 mb-1">
      <i class="fa-solid fa-robot"></i> Analisis Taktis GaneMaX AI:
    </div>
    <p class="leading-relaxed text-text-dark">${answer}</p>
  `;
}

function renderLeaders() {
  const container = document.getElementById('leaders-container');
  if (!container) return;

  const leaders = [
    { cat: 'Points Per Game (PPG)', name: 'Shai Gilgeous-Alexander', team: 'OKC Thunder', val: '31.4', img: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4278073.png' },
    { cat: 'Rebounds Per Game (RPG)', name: 'Domantas Sabonis', team: 'SAC Kings', val: '13.7', img: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3136195.png' },
    { cat: 'Assists Per Game (APG)', name: 'Tyrese Haliburton', team: 'IND Pacers', val: '11.2', img: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4396993.png' }
  ];

  container.innerHTML = leaders.map(item => `
    <div class="bg-surface-light p-4 rounded-2xl border border-card-border shadow-sm flex items-center justify-between hover-card-rise">
      <div class="flex items-center gap-3">
        <img src="${item.img}" class="w-12 h-12 rounded-full object-cover bg-bg-light border border-card-border" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4278073.png'">
        <div>
          <span class="text-[10px] font-mono font-bold text-text-muted uppercase">${item.cat}</span>
          <h4 class="font-bold text-sm text-text-dark leading-tight">${item.name}</h4>
          <p class="text-xs text-action-blue font-semibold">${item.team}</p>
        </div>
      </div>
      <span class="font-mono font-extrabold text-2xl text-action-blue">${item.val}</span>
    </div>
  `).join('');
}

function renderCompareTool() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-bg-light p-4 rounded-xl border border-card-border text-center space-y-3">
        <h4 class="font-bold text-sm text-text-dark">Tim A: Boston Celtics</h4>
        <img src="https://a.espncdn.com/i/teamlogos/nba/500/bos.png" class="w-16 h-16 mx-auto object-contain">
        <div class="text-xs font-mono space-y-1">
          <p>PPG: 120.4 | FG%: 48.7% | 3PT%: 38.9%</p>
        </div>
      </div>
      <div class="bg-bg-light p-4 rounded-xl border border-card-border text-center space-y-3">
        <h4 class="font-bold text-sm text-text-dark">Tim B: Denver Nuggets</h4>
        <img src="https://a.espncdn.com/i/teamlogos/nba/500/den.png" class="w-16 h-16 mx-auto object-contain">
        <div class="text-xs font-mono space-y-1">
          <p>PPG: 118.2 | FG%: 49.5% | 3PT%: 37.4%</p>
        </div>
      </div>
    </div>
  `;
}

function renderPowerRankings() {
  const container = document.getElementById('rankings-container');
  if (!container) return;

  const teams = [
    { rank: 1, name: 'Boston Celtics', record: '54-14', bpi: '8.4', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
    { rank: 2, name: 'Oklahoma City Thunder', record: '48-20', bpi: '7.1', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png' },
    { rank: 3, name: 'Denver Nuggets', record: '48-21', bpi: '6.8', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' }
  ];

  container.innerHTML = teams.map(t => `
    <div class="bg-surface-light p-4 rounded-2xl border border-card-border shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="font-mono font-extrabold text-xl text-action-blue w-6">#${t.rank}</span>
        <img src="${t.logo}" class="w-8 h-8 object-contain">
        <div>
          <h4 class="font-bold text-sm text-text-dark">${t.name}</h4>
          <span class="text-xs font-mono text-text-muted">Rekor: ${t.record}</span>
        </div>
      </div>
      <span class="font-mono font-bold text-xs bg-action-blue/10 text-action-blue px-2.5 py-1 rounded-lg">BPI ${t.bpi}</span>
    </div>
  `).join('');
}

function renderTransactions() {
  const container = document.getElementById('transactions-container');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-surface-light p-4 rounded-xl border border-card-border shadow-sm space-y-2">
      <div class="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>TRANSAKSI RESMI</span>
        <span>Terbaru</span>
      </div>
      <h4 class="font-bold text-sm text-text-dark">Kontrak Pemain & Pergerakan Roster Musim Ini</h4>
      <p class="text-xs text-text-muted leading-relaxed">Pembaruan lengkap pergerakan bebas transfer (Free Agency) dan rumor trade pemain bintang.</p>
    </div>
  `;
}

async function loadNewsData() {
  const container = document.getElementById('news-container');
  if (!container) return;

  container.innerHTML = '<div class="col-span-full text-center py-8 text-text-muted text-xs font-mono">Memuat berita ESPN Feed...</div>';

  const news = await window.espnApi.getNews(AppState.currentLeague);
  AppState.newsCache = news;

  if (!news || news.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-8 text-text-muted text-xs">Berita tidak ditemukan.</div>';
    return;
  }

  container.innerHTML = news.map(item => `
    <div class="bg-surface-light rounded-2xl border border-card-border overflow-hidden shadow-sm flex flex-col justify-between hover-card-rise">
      <div>
        ${item.images?.[0]?.url ? `<img src="${item.images[0].url}" class="w-full h-40 object-cover">` : ''}
        <div class="p-4">
          <span class="text-[10px] font-mono text-action-blue font-bold uppercase tracking-wider block mb-1">BERITA ESPN</span>
          <h3 class="font-bold text-sm text-text-dark mb-2 leading-snug">${item.headline || 'Headline'}</h3>
          <p class="text-xs text-text-muted line-clamp-3 leading-relaxed">${item.description || ''}</p>
        </div>
      </div>
      <div class="p-4 pt-0">
        <a href="${item.links?.web?.href || '#'}" target="_blank" class="text-xs font-bold text-action-blue hover:underline inline-flex items-center gap-1">
          Baca Selengkapnya <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  `).join('');
}

async function loadInjuriesData() {
  const container = document.getElementById('injuries-container');
  if (!container) return;

  container.innerHTML = '<div class="p-6 text-center text-text-muted text-xs font-mono">Memuat data medis pemain...</div>';

  const data = await window.espnApi.getTeamInjuries(AppState.currentLeague, '13');

  if (!data || !data.injuries || data.injuries.length === 0) {
    container.innerHTML = '<div class="p-6 text-center text-text-muted text-xs">Tidak ada data cedera aktif.</div>';
    return;
  }

  container.innerHTML = `
    <table class="w-full text-left text-xs">
      <thead class="bg-bg-light text-text-muted font-mono border-b border-card-border">
        <tr>
          <th class="p-3">PEMAIN</th>
          <th class="p-3">POSISI</th>
          <th class="p-3">STATUS</th>
          <th class="p-3">DETAIL</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-card-border/60 text-text-dark font-medium">
        ${data.injuries.map(item => `
          <tr class="hover:bg-slate-50">
            <td class="p-3 font-bold text-text-dark">${item.athlete?.displayName || 'Pemain'}</td>
            <td class="p-3 font-mono text-text-muted">${item.athlete?.position?.abbreviation || 'N/A'}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-600 border border-rose-200">${item.status || 'Out'}</span>
            </td>
            <td class="p-3 text-text-muted">${item.details?.type || 'Cedera'} - ${item.details?.detail || 'Evaluasi Harian'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTeamStats() {
  const container = document.getElementById('team-stats-container');
  if (!container) return;

  const stats = [
    { title: 'Offensive Rating', top: 'Boston Celtics', val: '122.8' },
    { title: 'Defensive Rating', top: 'Minnesota Timberwolves', val: '108.2' },
    { title: 'Pace (Posessions)', top: 'Indiana Pacers', val: '102.4' }
  ];

  container.innerHTML = stats.map(s => `
    <div class="bg-surface-light p-4 rounded-2xl border border-card-border shadow-sm flex items-center justify-between">
      <div>
        <span class="text-[10px] font-mono font-bold text-text-muted uppercase">${s.title}</span>
        <h4 class="font-bold text-sm text-text-dark mt-1">${s.top}</h4>
      </div>
      <span class="font-mono font-extrabold text-xl text-action-blue">${s.val}</span>
    </div>
  `).join('');
}

function renderAIPredictions(events) {
  const container = document.getElementById('ai-predictions-container');
  if (!container) return;

  if (!events || events.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-6 text-text-muted text-xs">Pilih tanggal dengan pertandingan aktif.</div>';
    return;
  }

  container.innerHTML = events.map(game => `
    <div class="bg-surface-light p-5 rounded-2xl border border-card-border shadow-sm space-y-3">
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-action-blue font-bold"><i class="fa-solid fa-microchip mr-1"></i> Match Rating: A+</span>
        <span class="text-text-muted">${game.shortName}</span>
      </div>

      <div class="flex items-center justify-between text-center py-2">
        <div class="flex items-center gap-2">
          <img src="${game.homeTeam.logo}" class="w-7 h-7 object-contain">
          <span class="font-bold text-xs text-text-dark">${game.homeTeam.displayName}</span>
        </div>
        <span class="font-mono text-xs text-text-muted font-bold">VS</span>
        <div class="flex items-center gap-2">
          <span class="font-bold text-xs text-text-dark">${game.awayTeam.displayName}</span>
          <img src="${game.awayTeam.logo}" class="w-7 h-7 object-contain">
        </div>
      </div>

      <div class="bg-bg-light p-3 rounded-xl border border-card-border text-xs text-text-dark space-y-1">
        <p class="font-bold text-action-blue"><i class="fa-solid fa-lightbulb mr-1"></i> Prediksi Peluang GaneMaX:</p>
        <p class="text-[11px] text-text-muted leading-relaxed">
          ${game.homeTeam.abbreviation} diproyeksikan memiliki peluang +5.2% lebih tinggi menang berdasarkan efisiensi penyerangan di kandang.
        </p>
      </div>
    </div>
  `).join('');
}

function showRefreshAnimation(isLoading) {
  const icon = document.getElementById('refresh-icon');
  if (icon) {
    if (isLoading) icon.classList.add('animate-spin');
    else icon.classList.remove('animate-spin');
  }
}

function triggerManualRefresh() {
  loadDashboardData();
  if (AppState.currentTab === 'standings') loadStandingsData();
  if (AppState.currentTab === 'news') loadNewsData();
}

function startAutoRefreshTimer() {
  if (AppState.refreshInterval) clearInterval(AppState.refreshInterval);
  AppState.refreshInterval = setInterval(() => {
    if (AppState.autoRefresh && AppState.currentTab === 'live') {
      loadDashboardData();
    }
  }, 15000);
}

function renderEmptyState() {
  const container = document.getElementById('live-scoreboard-grid');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full bg-surface-light p-8 rounded-2xl text-center border border-card-border shadow-sm">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-amber-500 mb-2"></i>
        <p class="text-sm font-bold text-text-dark">Gagal Terhubung ke ESPN API</p>
        <p class="text-xs text-text-muted mt-1">Silakan periksa jaringan internet atau tekan tombol refresh.</p>
      </div>
    `;
  }
}
