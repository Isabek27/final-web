const sourceSelect = document.getElementById('statsSource');
const metricSelect = document.getElementById('statsMetric');
const bars = document.getElementById('performanceBars');

function renderDashboard() {
  const saved = getCustomPlayers();
  const source = sourceSelect.value;
  const data = source === 'demo' ? [...players] :
    source === 'custom' ? saved : [...players, ...saved];
  const metric = metricSelect.value;

  document.getElementById('statsPlayers').textContent = data.length;
  document.getElementById('statsGoals').textContent = data.reduce((sum, p) => sum + p.goals, 0);
  document.getElementById('statsAssists').textContent = data.reduce((sum, p) => sum + p.assists, 0);
  bars.innerHTML = '';

  const status = document.getElementById('statsStatus');
  if (!data.length) {
    status.textContent = 'No players available. Add a player on the Players page.';
    return;
  }
  const top = [...data].sort((a, b) => b[metric] - a[metric]).slice(0, 8);
  const maximum = Math.max(1, ...top.map(p => p[metric]));
  top.forEach(p => {
    const row = document.createElement('div');
    row.className = 'performance-row';
    const name = document.createElement('span');
    name.textContent = p.name;
    const track = document.createElement('div');
    track.className = 'performance-track';
    const fill = document.createElement('div');
    fill.className = 'performance-fill';
    fill.style.width = (p[metric] / maximum * 100) + '%';
    track.appendChild(fill);
    const value = document.createElement('strong');
    value.textContent = metric === 'xg' ? p.xg.toFixed(1) : p[metric];
    row.append(name, track, value);
    bars.appendChild(row);
  });
  status.textContent = `Showing ${top.length} of ${data.length} players.`;
}

sourceSelect.addEventListener('change', renderDashboard);
metricSelect.addEventListener('change', renderDashboard);
renderDashboard();
