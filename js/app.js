// =====================================================
// GaneMaX.ai LIVE BASKETBALL PRO BROADCAST ENGINE
// Main Application Logic
// ===================================================== 

// ========== CONFIGURATION & GLOBAL VARIABLES ==========

const openRouterApiKey = 'YOUR_OPENROUTER_API_KEY_HERE'; // Replace with actual API key

let currentLeague = 'nba';
let currentGamesData = [];
let selectedGame = null;
let allLeaguesData = {};

// Mock fallback data
const MOCK_FALLBACK_GAMES = [
  {
    id: 'mock-1',
    shortName: 'LAL vs BOS',
    name: 'Los Angeles Lakers vs Boston Celtics',
    status: { type: { shortDetail: 'LIVE' } },
    competitions: [{
      competitors: [
        { homeAway: 'home', team: { displayName: 'Lakers' }, score: 108 },
        { homeAway: 'away', team: { displayName: 'Celtics' }, score: 102 }
      ]
    }]
  }
];

// ========== LEAGUE CONFIGURATION ==========

const leagueConfig = {
  nba: { name: 'NBA (USA)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  ncaa_m: { name: 'NCAA Men (USA)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard' },
  ncaa_w: { name: 'NCAA Women (USA)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard' },
  euroleague: { name: 'Euroleague', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard' },
  wnba: { name: 'WNBA (USA)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard' },
  pba: { name: 'PBA (Philippines)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/pba/scoreboard' },
  bbl: { name: 'BBL (Germany)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/bbl/scoreboard' },
  ligue1: { name: 'Ligue 1 (France)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/ligue-1/scoreboard' },
  acb: { name: 'ACB (Spain)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/acb/scoreboard' },
  serieA: { name: 'Serie A (Italy)', endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/serie-a/scoreboard' }
};

// ========== INIT ON PAGE LOAD ==========

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  switchMainTab('scores');
  fetchAllLeagueData();
  populateLeagueModal();
}

// ========== FETCH DATA FUNCTIONS ==========

async function fetchAllLeagueData() {
  const refreshIcon = document.getElementById('refresh-icon');
  if(refreshIcon) refreshIcon.classList.add('fa-spin');

  try {
    for (const [leagueKey, config] of Object.entries(leagueConfig)) {
      await fetchLeagueScoreboard(leagueKey, config.endpoint);
    }
    if(currentLeague && currentGamesData) {
      displayScores(currentGamesData);
    }
  } catch(e) {
    console.error('Error fetching all league data:', e);
  } finally {
    if(refreshIcon) refreshIcon.classList.remove('fa-spin');
  }
}

async function fetchLeagueScoreboard(leagueKey, endpoint) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    
    allLeaguesData[leagueKey] = data;
    
    if (leagueKey === currentLeague) {
      currentGamesData = data.events || [];
      populateAISelectMatches(currentGamesData);
    }
  } catch(e) {
    console.error(`Error fetching ${leagueKey} data:`, e);
    if (leagueKey === currentLeague) {
      currentGamesData = MOCK_FALLBACK_GAMES;
    }
  }
}

async function fetchTeamsData(leagueKey) {
  const endpoint = leagueConfig[leagueKey]?.endpoint.replace('scoreboard', 'teams');
  if(!endpoint) return [];
  
  try {
    const res = await fetch(endpoint);
    return await res.json();
  } catch(e) {
    console.error(`Error fetching teams for ${leagueKey}:`, e);
    return [];
  }
}

async function fetchStandingsData(leagueKey) {
  const endpoint = leagueConfig[leagueKey]?.endpoint.replace('scoreboard', 'standings');
  if(!endpoint) return [];
  
  try {
    const res = await fetch(endpoint);
    return await res.json();
  } catch(e) {
    console.error(`Error fetching standings for ${leagueKey}:`, e);
    return [];
  }
}

// ========== LEAGUE MODAL ==========

function openLeagueModal() {
  const modal = document.getElementById('league-modal');
  if(modal) modal.classList.remove('hidden');
}

function closeLeagueModal() {
  const modal = document.getElementById('league-modal');
  if(modal) modal.classList.add('hidden');
}

function selectLeague(leagueKey) {
  currentLeague = leagueKey;
  const displayBtn = document.getElementById('current-league-display-btn');
  if(displayBtn) displayBtn.innerText = `🏀 ${leagueConfig[leagueKey]?.name || leagueKey}`;
  
  fetchLeagueScoreboard(leagueKey, leagueConfig[leagueKey]?.endpoint);
  closeLeagueModal();
}

function populateLeagueModal() {
  const container = document.getElementById('league-buttons-container');
  if(!container) return;
  
  container.innerHTML = '';
  
  for (const [key, config] of Object.entries(leagueConfig)) {
    const btn = document.createElement('button');
    btn.className = `block w-full text-left px-4 py-3 hover:bg-stadium-gray transition border-b border-border-light`;
    btn.innerText = config.name;
    btn.onclick = () => selectLeague(key);
    container.appendChild(btn);
  }
}

// ========== SCORES TAB ==========

function displayScores(games) {
  const container = document.getElementById('scores-grid');
  if(!container) return;
  
  if (!games || games.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-8 text-neutral-muted">
      Tidak ada pertandingan tersedia. Silakan coba liga lain atau refresh data.
    </div>`;
    return;
  }
  
  container.innerHTML = games.map(game => createGameCard(game)).join('');
}

function createGameCard(game) {
  const comp = game.competitions?.[0];
  if(!comp) return '';
  
  const home = comp.competitors?.find(c => c.homeAway === 'home');
  const away = comp.competitors?.find(c => c.homeAway === 'away');
  
  const homeScore = home?.score || '—';
  const awayScore = away?.score || '—';
  const homeTeam = home?.team?.displayName || 'Home';
  const awayTeam = away?.team?.displayName || 'Away';
  const status = game.status?.type?.shortDetail || 'SCHEDULED';
  
  const isLive = status === 'LIVE';
  
  return `
    <div onclick="selectGameDetail('${game.id}')" class="bg-white border border-border-light rounded-2xl p-4 hover:shadow-card cursor-pointer transition hover:border-action-blue group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[10px] font-mono font-bold tracking-widest ${isLive ? 'text-red-600' : 'text-neutral-muted'} uppercase">
          ${isLive ? '<i class="fa-solid fa-circle text-red-600 mr-1 pulsate-live"></i>' : ''} ${status}
        </span>
        <button onclick="event.stopPropagation(); generateAIMatchAnalysis();" class="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-action-blue text-white text-[10px] font-bold transition">
          <i class="fa-solid fa-brain mr-1"></i> Analisis
        </button>
      </div>
      
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm text-stat-black truncate">${homeTeam}</span>
          <span class="font-sora font-extrabold text-lg text-stat-black">${homeScore}</span>
        </div>
        <div class="h-px bg-border-light"></div>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm text-stat-black truncate">${awayTeam}</span>
          <span class="font-sora font-extrabold text-lg text-stat-black">${awayScore}</span>
        </div>
      </div>
    </div>
  `;
}

function selectGameDetail(gameId) {
  selectedGame = currentGamesData.find(g => g.id === gameId) || MOCK_FALLBACK_GAMES[0];
  switchMainTab('scores');
  const detailEl = document.getElementById('game-detail');
  if(detailEl) detailEl.innerHTML = renderGameDetail(selectedGame);
}

function renderGameDetail(game) {
  const comp = game.competitions?.[0];
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');
  
  const homeStats = home?.statistics || [];
  const awayStats = away?.statistics || [];
  
  return `
    <div class="bg-white border border-border-light rounded-2xl p-6">
      <h3 class="text-lg font-sora font-bold mb-4 text-stat-black">
        ${home?.team?.displayName} (${home?.score}) vs ${away?.team?.displayName} (${away?.score})
      </h3>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-stadium-gray rounded-xl p-4">
          <h4 class="text-xs font-mono font-bold text-neutral-muted mb-3">STATISTIK HOME</h4>
          <ul class="text-sm space-y-2">
            ${homeStats.slice(0, 5).map(s => `<li class="flex justify-between"><span>${s.name || 'Stat'}</span><span class="font-bold">${s.displayValue || '—'}</span></li>`).join('')}
          </ul>
        </div>
        <div class="bg-stadium-gray rounded-xl p-4">
          <h4 class="text-xs font-mono font-bold text-neutral-muted mb-3">STATISTIK AWAY</h4>
          <ul class="text-sm space-y-2">
            ${awayStats.slice(0, 5).map(s => `<li class="flex justify-between"><span>${s.name || 'Stat'}</span><span class="font-bold">${s.displayValue || '—'}</span></li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="askAIQuick('Siapa yang akan menang?')" class="flex-1 bg-action-blue text-white px-3 py-2 rounded-xl font-semibold text-sm transition hover:bg-primary-dark">
          <i class="fa-solid fa-sparkles mr-1"></i> Tanya GaneMaX.ai
        </button>
        <button onclick="populateNewsFromAPI()" class="flex-1 bg-stadium-gray text-stat-black px-3 py-2 rounded-xl font-semibold text-sm border border-border-light transition hover:border-action-blue">
          <i class="fa-solid fa-newspaper mr-1"></i> Berita Terkait
        </button>
      </div>
    </div>
  `;
}

// ========== STANDINGS TAB ==========

async function displayStandings() {
  const container = document.getElementById('standings-container');
  if(!container) return;
  
  container.innerHTML = '<div class="text-center py-8"><i class="fa-solid fa-spinner fa-spin text-action-blue text-2xl"></i></div>';
  
  const data = await fetchStandingsData(currentLeague);
  const standings = data.standings?.[0]?.entries || [];
  
  if(standings.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-neutral-muted">Data klasemen tidak tersedia.</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="bg-white border border-border-light rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stadium-gray border-b border-border-light">
          <tr>
            <th class="px-4 py-2 text-left font-mono font-bold text-xs text-neutral-muted">POSISI</th>
            <th class="px-4 py-2 text-left font-semibold text-stat-black">TIM</th>
            <th class="px-4 py-2 text-center font-semibold text-stat-black">W-L</th>
            <th class="px-4 py-2 text-center font-semibold text-stat-black">PPG</th>
          </tr>
        </thead>
        <tbody>
          ${standings.slice(0, 15).map((entry, idx) => `
            <tr class="border-b border-border-light hover:bg-stadium-gray transition">
              <td class="px-4 py-3 font-mono font-bold text-action-blue text-xs">#${idx + 1}</td>
              <td class="px-4 py-3 font-semibold text-stat-black">${entry.team?.displayName || '—'}</td>
              <td class="px-4 py-3 text-center font-bold">${entry.wins || 0}-${entry.losses || 0}</td>
              <td class="px-4 py-3 text-center font-bold text-action-blue">${entry.pointsFor?.toFixed(1) || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ========== TEAMS TAB ==========

async function displayTeams() {
  const container = document.getElementById('teams-container');
  if(!container) return;
  
  container.innerHTML = '<div class="text-center py-8"><i class="fa-solid fa-spinner fa-spin text-action-blue text-2xl"></i></div>';
  
  const data = await fetchTeamsData(currentLeague);
  const teams = data.teams || [];
  
  if(teams.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-neutral-muted">Data tim tidak tersedia.</div>';
    return;
  }
  
  container.innerHTML = teams.slice(0, 12).map(team => `
    <div class="bg-white border border-border-light rounded-2xl p-4 hover:shadow-card transition">
      <h4 class="font-sora font-bold text-stat-black mb-2">${team.displayName || team.name}</h4>
      <p class="text-xs text-neutral-muted mb-3">${team.location || '—'}</p>
      <button class="w-full px-3 py-2 bg-action-blue text-white rounded-lg font-semibold text-xs transition hover:bg-primary-dark">
        Lihat Roster
      </button>
    </div>
  `).join('');
}

// ========== STATISTICS TAB ==========

function displayStats() {
  const container = document.getElementById('stats-container');
  if(!container) return;
  
  const mockStats = [
    { category: 'Pencetak Poin Terbanyak', leader: 'Player Name', value: '28.5 PPG', icon: 'fa-basketball' },
    { category: 'Assist Leader', leader: 'Player Name', value: '9.2 APG', icon: 'fa-share-nodes' },
    { category: 'Rebound Leader', leader: 'Player Name', value: '11.8 RPG', icon: 'fa-square' },
    { category: 'Steals Leader', leader: 'Player Name', value: '1.8 SPG', icon: 'fa-hand' },
    { category: 'Blocks Leader', leader: 'Player Name', value: '2.1 BPG', icon: 'fa-hand-back-fist' },
    { category: 'FG% Leader', leader: 'Player Name', value: '52.3%', icon: 'fa-percent' }
  ];
  
  container.innerHTML = mockStats.map(stat => `
    <div class="bg-white border border-border-light rounded-2xl p-4">
      <div class="flex items-center gap-2 mb-2">
        <i class="fa-solid ${stat.icon} text-action-blue text-lg"></i>
        <span class="text-xs font-mono font-bold text-neutral-muted uppercase">${stat.category}</span>
      </div>
      <p class="font-sora font-bold text-stat-black mb-1">${stat.leader}</p>
      <p class="text-lg font-mono font-bold text-action-blue">${stat.value}</p>
    </div>
  `).join('');
}

// ========== TRANSACTIONS & DRAFT TAB ==========

function displayTransactions() {
  const container = document.getElementById('transactions-container');
  if(!container) return;
  
  const mockTransactions = [
    { type: 'Signing', detail: 'Team A signed Player X untuk musim depan', date: 'Jan 15, 2024' },
    { type: 'Trade', detail: 'Team B trade Player Y untuk Player Z', date: 'Jan 12, 2024' },
    { type: 'Waived', detail: 'Team C released Player W', date: 'Jan 10, 2024' },
    { type: 'Draft Pick', detail: 'Team D selected Player V di round 1', date: 'Jan 8, 2024' }
  ];
  
  container.innerHTML = `
    <div class="space-y-3">
      ${mockTransactions.map(trans => `
        <div class="bg-white border border-border-light rounded-xl p-4">
          <div class="flex items-start justify-between mb-2">
            <span class="text-xs font-mono font-bold text-action-blue uppercase">${trans.type}</span>
            <span class="text-xs text-neutral-muted">${trans.date}</span>
          </div>
          <p class="text-sm font-semibold text-stat-black">${trans.detail}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ========== INJURIES TAB ==========

function displayInjuries() {
  const container = document.getElementById('injuries-container');
  if(!container) return;
  
  const mockInjuries = [
    { player: 'Player Name A', status: 'Out', reason: 'Lower Back Injury', team: 'Team X' },
    { player: 'Player Name B', status: 'Questionable', reason: 'Ankle Sprain', team: 'Team Y' },
    { player: 'Player Name C', status: 'Day-to-Day', reason: 'Hamstring', team: 'Team Z' }
  ];
  
  container.innerHTML = `
    <div class="space-y-3">
      ${mockInjuries.map(inj => `
        <div class="bg-white border border-border-light rounded-xl p-4">
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-stat-black">${inj.player}</h4>
            <span class="text-xs font-mono font-bold px-2 py-1 rounded-lg ${inj.status === 'Out' ? 'bg-red-100 text-red-700' : inj.status === 'Questionable' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}">
              ${inj.status}
            </span>
          </div>
          <p class="text-xs text-neutral-muted">${inj.team} • ${inj.reason}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ========== RANKINGS TAB ==========

function displayRankings() {
  const container = document.getElementById('rankings-container');
  if(!container) return;
  
  const mockRankings = [
    { rank: 1, team: 'Team A', rating: 28.5, trend: 'up' },
    { rank: 2, team: 'Team B', rating: 27.3, trend: 'down' },
    { rank: 3, team: 'Team C', rating: 26.8, trend: 'up' },
    { rank: 4, team: 'Team D', rating: 25.1, trend: 'stable' },
    { rank: 5, team: 'Team E', rating: 24.9, trend: 'down' }
  ];
  
  container.innerHTML = mockRankings.map(r => `
    <div class="bg-white border border-border-light rounded-xl p-4 flex items-center gap-4">
      <div class="font-sora font-extrabold text-2xl text-action-blue w-12 text-center">#${r.rank}</div>
      <div class="flex-1">
        <h4 class="font-semibold text-stat-black">${r.team}</h4>
        <p class="text-xs text-neutral-muted">Rating: ${r.rating}</p>
      </div>
      <div class="text-lg ${r.trend === 'up' ? 'text-green-600' : r.trend === 'down' ? 'text-red-600' : 'text-neutral-muted'}">
        <i class="fa-solid ${r.trend === 'up' ? 'fa-arrow-up' : r.trend === 'down' ? 'fa-arrow-down' : 'fa-minus'}"></i>
      </div>
    </div>
  `).join('');
}

// ========== NEWS TAB ==========

function populateNewsFromAPI() {
  const articles = [
    { headline: "Pertandingan Penuh Drama: Penalti Kontroversial Ubah Alur Permainan", description: "Keputusan wasit menjadi sorotan dalam pertandingan sengit minggu ini.", published: new Date().toISOString() },
    { headline: "Pemain Bintang Cedera dalam Pertandingan Krusial", description: "Kabar buruk untuk tim yang akan menghadapi lawan berikutnya tanpa pemain kunci.", published: new Date().toISOString() },
    { headline: "Analisis Dominasi Poin di Area Paint & Efisiensi Shooting", description: "Tim tuan rumah mencatatkan persentase tembakan bebas dan rebounds tertinggi pekan ini.", published: new Date().toISOString() },
    { headline: "Proyeksi Playoff & Evaluasi Performa Pemain Kunci", description: "Peta persaingan liga semakin memanas menjelang pekan-pekan krusial penentuan posisi klasemen.", published: new Date().toISOString() }
  ];
  renderNewsGrid(articles);
}

function renderNewsGrid(articles) {
  const container = document.getElementById('news-grid');
  if(!container) return;
  
  container.innerHTML = articles.map(article => `
    <div class="bg-white border border-border-light rounded-2xl p-4 hover:shadow-card transition cursor-pointer">
      <h4 class="font-sora font-bold text-stat-black mb-2 line-clamp-2">${article.headline}</h4>
      <p class="text-sm text-neutral-muted mb-3 line-clamp-2">${article.description}</p>
      <div class="flex items-center justify-between text-xs">
        <span class="text-neutral-muted">${new Date(article.published).toLocaleDateString('id-ID')}</span>
        <i class="fa-solid fa-arrow-right text-action-blue"></i>
      </div>
    </div>
  `).join('');
}

function populateAISelectMatches(games) {
  const select = document.getElementById('ai-select-match');
  if(!select) return;
  select.innerHTML = '';
  games.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.innerText = `${g.shortName || g.name} (${g.status.type.shortDetail})`;
    select.appendChild(opt);
  });
}

// ========== GANEMAX.AI MULTI-MODEL RETRY ENGINE ==========

async function callGaneMaXAI(systemPrompt, userQuery) {
  const modelsToTry = [
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct",
    "openai/gpt-4o-mini"
  ];

  for (const modelName of modelsToTry) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'https://ganemax.app',
          'X-Title': 'GaneMaX.ai Basketball Engine'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Retry model...`);
    }
  }
  throw new Error("Layanan GaneMaX.ai sedang mengalami antrean tinggi. Silakan coba beberapa saat lagi.");
}

// ========== AI HELPER FUNCTIONS ==========

async function askAIQuick(promptText) {
  const consoleEl = document.getElementById('ai-quick-console');
  if(!consoleEl) return;
  
  consoleEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-action-blue mr-2"></i> GaneMaX.ai sedang menganalisis statistik pertandingan...`;

  const comp = selectedGame?.competitions[0];
  const home = comp?.competitors.find(c => c.homeAway === 'home')?.team.displayName || "Home Team";
  const away = comp?.competitors.find(c => c.homeAway === 'away')?.team.displayName || "Away Team";
  const homeScore = comp?.competitors.find(c => c.homeAway === 'home')?.score || "108";
  const awayScore = comp?.competitors.find(c => c.homeAway === 'away')?.score || "102";

  const systemPrompt = `Anda adalah GaneMaX.ai Sports Analyst. Berikan jawaban analisis singkat, tajam, presisi untuk laga ${home} (${homeScore}) vs ${away} (${awayScore}). Gunakan Bahasa Indonesia.`;

  try {
    const reply = await callGaneMaXAI(systemPrompt, promptText);
    consoleEl.innerText = reply;
  } catch(err) {
    consoleEl.innerText = err.message;
  }
}

function handleAIChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('ai-user-input');
  const text = input.value.trim();
  if(!text) return;
  askAIQuick(text);
  input.value = '';
}

function generateAIMatchAnalysis() {
  switchMainTab('ai');
  runDeepAIAnalytics();
}

async function runDeepAIAnalytics() {
  const output = document.getElementById('ai-deep-output');
  const statusInd = document.getElementById('ai-status-indicator');
  if(!output) return;
  
  output.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-action-blue mr-2"></i> GaneMaX.ai sedang menyusun Laporan Scouting Taktis...`;
  if(statusInd) statusInd.innerText = "Processing...";

  const matchId = document.getElementById('ai-select-match')?.value;
  const targetGame = currentGamesData.find(g => g.id === matchId) || selectedGame || MOCK_FALLBACK_GAMES[0];
  const comp = targetGame.competitions[0];
  const home = comp.competitors.find(c => c.homeAway === 'home')?.team.displayName || "Home";
  const away = comp.competitors.find(c => c.homeAway === 'away')?.team.displayName || "Away";

  const focusRadio = document.querySelector('input[name="ai-focus"]:checked')?.value || 'full-scout';
  const systemPrompt = `Anda adalah Kepala Analis Taktik GaneMaX.ai. Buat laporan komprehensif Bahasa Indonesia mengenai laga ${home} vs ${away}. Fokus: ${focusRadio}. Berikan analisis tajam, bullet points, dan prediksi strategi.`;

  try {
    const resText = await callGaneMaXAI(systemPrompt, `Buatkan analisis scouting taktis untuk laga ${home} vs ${away}.`);
    output.innerText = resText;
    if(statusInd) statusInd.innerText = "Completed";
  } catch(e) {
    output.innerText = e.message;
    if(statusInd) statusInd.innerText = "Error";
  }
}

async function runPlayerComparisonAI() {
  const p1 = document.getElementById('compare-player-1')?.value;
  const p2 = document.getElementById('compare-player-2')?.value;
  const card = document.getElementById('compare-result-card');
  
  if(!p1 || !p2 || !card) return;

  card.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-action-blue mr-2"></i> GaneMaX.ai sedang menganalisis perbandingan ${p1} vs ${p2}...`;
  const systemPrompt = `Anda adalah Direktur Scouting GaneMaX.ai. Bandingkan 2 pemain bola basket: ${p1} dan ${p2}. Evaluasi kelebihan, gaya main, efisiensi tembakan, clutch ability, serta berikan GaneMaX.ai Verdict untuk pemain yang lebih berpengaruh. Gunakan Bahasa Indonesia.`;

  try {
    const resText = await callGaneMaXAI(systemPrompt, `Bandingkan pemain ${p1} vs ${p2}.`);
    card.innerHTML = `<div class="font-sora font-bold text-sm text-stat-black mb-2.5 flex items-center gap-2">
      <i class="fa-solid fa-trophy text-amber-500"></i> Head-to-Head GaneMaX.ai Verdict: ${p1} vs ${p2}
    </div>
    <div class="whitespace-pre-line text-neutral-muted leading-relaxed">${resText}</div>`;
  } catch(e) {
    card.innerText = e.message;
  }
}

// ========== SWITCH MAIN TAB NAVIGATION ==========

function switchMainTab(tabName) {
  const tabs = ['scores', 'standings', 'teams', 'stats', 'transactions', 'injuries', 'rankings', 'ai', 'compare', 'news'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if(el) el.classList.add('hidden');
    
    const navBtn = document.getElementById(`nav-${t}`);
    if(navBtn) {
      navBtn.classList.remove('tab-btn-active', 'bg-action-blue', 'text-white');
      navBtn.classList.add('bg-white', 'text-neutral-muted', 'border-border-light');
    }
  });

  const targetEl = document.getElementById(`tab-${tabName}`);
  if(targetEl) targetEl.classList.remove('hidden');

  const activeNav = document.getElementById(`nav-${tabName}`);
  if(activeNav) {
    activeNav.classList.add('tab-btn-active');
    activeNav.classList.remove('bg-white', 'text-neutral-muted', 'border-border-light');
  }
  
  // Load specific tab content on demand
  if (tabName === 'standings') displayStandings();
  if (tabName === 'teams') displayTeams();
  if (tabName === 'stats') displayStats();
  if (tabName === 'transactions') displayTransactions();
  if (tabName === 'injuries') displayInjuries();
  if (tabName === 'rankings') displayRankings();
  if (tabName === 'news') populateNewsFromAPI();
}
