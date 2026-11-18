const matches = [
  { id: 1, home: 'Arsenal', away: 'Chelsea', homeLogo: 'ars.svg', awayLogo: 'che.svg', league: 'Premier League', status: 'live', score: '2 : 1', xg: '1.8 : 0.7' },
  { id: 2, home: 'Real Madrid', away: 'Sevilla', homeLogo: 'rma.svg', awayLogo: 'sev.svg', league: 'La Liga', status: 'finished', score: '3 : 0', xg: '2.1 : 0.4' },
  { id: 3, home: 'Bayern Munich', away: 'Man City', homeLogo: 'bay.svg', awayLogo: 'mci.svg', league: 'Champions League', status: 'upcoming', score: 'VS', xg: '—' },
  { id: 4, home: 'Liverpool', away: 'Aston Villa', homeLogo: 'liv.svg', awayLogo: 'avl.svg', league: 'Premier League', status: 'live', score: '1 : 1', xg: '1.2 : 1.0' },
  { id: 5, home: 'Chelsea', away: 'Liverpool', homeLogo: 'che.svg', awayLogo: 'liv.svg', league: 'Premier League', status: 'finished', score: '0 : 2', xg: '0.6 : 1.9' },
  { id: 6, home: 'Arsenal', away: 'Bayern Munich', homeLogo: 'ars.svg', awayLogo: 'bay.svg', league: 'Champions League', status: 'upcoming', score: 'VS', xg: '—' }
];

const players = [
  { name: 'Jude Bellingham', team: 'Real Madrid', goals: 16, assists: 3, xg: 12.4 },
  { name: 'Kylian Mbappe', team: 'PSG (demo)', goals: 21, assists: 4, xg: 19.1 },
  { name: 'Erling Haaland', team: 'Man City', goals: 19, assists: 6, xg: 18.6 },
  { name: 'Mohamed Salah', team: 'Liverpool', goals: 17, assists: 9, xg: 15.2 }
];

const standings = {
  epl: [
    { team: 'Liverpool', logo: 'liv.svg', played: 26, win: 18, draw: 6, loss: 2, xpts: 58.4, points: 60 },
    { team: 'Manchester City', logo: 'mci.svg', played: 26, win: 18, draw: 5, loss: 3, xpts: 61.2, points: 59 },
    { team: 'Arsenal', logo: 'ars.svg', played: 26, win: 18, draw: 4, loss: 4, xpts: 55.8, points: 58 },
    { team: 'Aston Villa', logo: 'avl.svg', played: 26, win: 16, draw: 4, loss: 6, xpts: 42.1, points: 52 }
  ],
  laliga: [
    { team: 'Real Madrid', logo: 'rma.svg', played: 26, win: 20, draw: 4, loss: 2, xpts: 62.2, points: 64 },
    { team: 'Sevilla', logo: 'sev.svg', played: 26, win: 15, draw: 6, loss: 5, xpts: 46.3, points: 51 },
    { team: 'Real Sociedad', logo: '', played: 26, win: 13, draw: 7, loss: 6, xpts: 43.4, points: 46 }
  ]
};

const PLAYER_KEY = 'matchiq_custom_players';

function getCustomPlayers() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYER_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(p => p && typeof p.id === 'string' &&
      typeof p.name === 'string' && p.name.trim().length >= 2 &&
      typeof p.team === 'string' && p.team.trim().length >= 2 &&
      Number.isInteger(p.goals) && p.goals >= 0 &&
      Number.isInteger(p.assists) && p.assists >= 0 &&
      Number.isFinite(p.xg) && p.xg >= 0);
  } catch (error) {
    return [];
  }
}

let favorites = [];
try {
  const saved = JSON.parse(localStorage.getItem('matchiq_favorites') || '[]');
  if (Array.isArray(saved)) favorites = saved.filter(Number.isInteger);
} catch (error) {  }
let matchFilter = 'all';

function applySearch() {
  const input = document.getElementById('siteSearch');
  const query = input ? input.value.trim().toLowerCase() : '';
  const items = document.querySelectorAll('[data-search]');
  let visible = 0;
  items.forEach(item => {
    const found = item.textContent.toLowerCase().includes(query);
    item.hidden = !found;
    if (found) visible++;
  });
  const empty = document.getElementById('emptyNote');
  if (empty) empty.hidden = visible > 0;
}

function renderMatches() {
  const list = document.getElementById('matchList');
  if (!list) return;
  list.innerHTML = '';
  matches.forEach(match => {
    if (matchFilter !== 'all' &&
        !(matchFilter === 'favorites' && favorites.includes(match.id)) &&
        matchFilter !== match.status) return;
    const selected = favorites.includes(match.id);
    const status = match.status === 'live' ? 'LIVE (demo)' :
      match.status === 'finished' ? 'Finished' : 'Upcoming';
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.search = '';
    card.innerHTML = `
      <div class="meta"><span>${match.league}</span><span class="tag ${match.status}">${status}</span></div>
      <div class="teams">
        <div class="team"><img src="img/${match.homeLogo}" alt="${match.home}"><strong>${match.home}</strong></div>
        <div class="score">${match.score}</div>
        <div class="team"><img src="img/${match.awayLogo}" alt="${match.away}"><strong>${match.away}</strong></div>
      </div>
      <div class="card-actions"><span class="hint">xG: ${match.xg}</span>
        <button type="button" class="btn favorite-btn ${selected ? 'selected' : ''}" data-id="${match.id}" aria-pressed="${selected}">${selected ? '★ Saved' : '☆ Favorite'}</button>
      </div>`;
    list.appendChild(card);
  });
  applySearch();
}

function renderPlayers() {
  const list = document.getElementById('playerList');
  if (!list) return;
  const sort = document.getElementById('playerSort').value;
  const sorted = [...players];
  if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  else sorted.sort((a, b) => b[sort] - a[sort]);
  list.innerHTML = '';
  sorted.forEach(player => {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.search = '';
    card.innerHTML = `<div class="player-head"><img src="img/player.svg" alt="Player avatar">
      <div><h2>${player.name}</h2><p class="hint">${player.team}</p></div></div>
      <div class="player-stat"><span>Goals</span><strong>${player.goals}</strong></div>
      <div class="player-stat"><span>Assists</span><strong>${player.assists}</strong></div>
      <div class="player-stat"><span>Expected Goals (xG)</span><strong>${player.xg}</strong></div>`;
    list.appendChild(card);
  });
  applySearch();
}

function renderStandings() {
  const table = document.getElementById('standingsBody');
  if (!table) return;
  const league = document.getElementById('leagueSelect').value;
  const teams = standings[league];
  document.getElementById('leagueTitle').textContent = league === 'epl' ? 'English Premier League' : 'La Liga';
  document.getElementById('leagueNote').textContent = `Showing ${teams.length} teams (demo data)`;
  table.innerHTML = '';
  teams.forEach((team, index) => {
    const row = document.createElement('tr');
    row.dataset.search = '';
    const icon = team.logo ? `<img src="img/${team.logo}" alt="">` : '<i class="fa-solid fa-shield"></i>';
    row.innerHTML = `<td>${index + 1}</td><td><span class="table-team">${icon}${team.team}</span></td>
      <td>${team.played}</td><td>${team.win}</td><td>${team.draw}</td><td>${team.loss}</td>
      <td>${team.xpts}</td><td class="highlight">${team.points}</td>`;
    table.appendChild(row);
  });
  applySearch();
}

function validateForm() {
  const values = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    topic: document.getElementById('topic').value,
    message: document.getElementById('message').value.trim(),
    agreement: document.getElementById('agreement').checked
  };
  const errors = {
    name: values.name.length >= 2 ? '' : 'Please enter at least 2 characters.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? '' : 'Enter a valid email address.',
    topic: values.topic ? '' : 'Choose a subject.',
    message: values.message.length >= 15 ? '' : 'Please enter at least 15 characters.',
    agreement: values.agreement ? '' : 'Please confirm the agreement.'
  };
  Object.keys(errors).forEach(id => {
    const field = document.getElementById(id);
    const error = errors[id];
    document.getElementById(id + 'Error').textContent = error;
    field.classList.toggle('invalid', Boolean(error));
    field.setAttribute('aria-invalid', String(Boolean(error)));
  });
  return Object.values(errors).every(error => error === '');
}

document.addEventListener('DOMContentLoaded', function () {
  const themeButton = document.getElementById('themeButton');
  let theme = 'dark';
  try { theme = localStorage.getItem('matchiq_theme') || 'dark'; } catch (error) {}

  function setTheme(value) {
    const light = value === 'light';
    document.documentElement.dataset.bsTheme = light ? 'light' : 'dark';
    document.body.classList.toggle('light', light);
    if (themeButton) {
      themeButton.innerHTML = light ? '<i class="fa-solid fa-sun"></i> Light theme' : '<i class="fa-solid fa-moon"></i> Dark theme';
      themeButton.setAttribute('aria-pressed', String(light));
    }
    try { localStorage.setItem('matchiq_theme', light ? 'light' : 'dark'); } catch (error) {}
  }
  setTheme(theme);
  if (themeButton) themeButton.addEventListener('click', () => {
    setTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });

  if (document.getElementById('matchList')) {
    renderMatches();
    document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        matchFilter = button.dataset.filter;
        renderMatches();
      });
    });
    document.getElementById('matchList').addEventListener('click', event => {
      const btn = event.target.closest('.favorite-btn');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
      try { localStorage.setItem('matchiq_favorites', JSON.stringify(favorites)); } catch (error) {}
      renderMatches();
    });
  }

  if (document.getElementById('playerList')) {
    renderPlayers();
    document.getElementById('playerSort').addEventListener('change', renderPlayers);
  }
  if (document.getElementById('standingsBody')) {
    renderStandings();
    document.getElementById('leagueSelect').addEventListener('change', renderStandings);
  }
  const search = document.getElementById('siteSearch');
  if (search) search.addEventListener('input', applySearch);

  const form = document.getElementById('contactForm');
  if (form) {
    const success = document.getElementById('formSuccess');
    form.addEventListener('submit', event => {
      event.preventDefault();
      success.hidden = true;
      if (validateForm()) {
        success.textContent = 'All fields are valid. This is a demo form; no data was sent.';
        success.hidden = false;
        form.reset();
      }
    });
    form.querySelectorAll('input, select, textarea').forEach(field => {
      function recheck() {
        success.hidden = true;
        if (field.classList.contains('invalid')) validateForm();
      }
      field.addEventListener('input', recheck);
      field.addEventListener('change', recheck);
    });
  }
});
