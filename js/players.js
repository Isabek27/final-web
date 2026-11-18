class FootballPlayer {
  constructor(name, team, goals, assists, xg) {
    this.name = name;
    this.team = team;
    this.goals = goals;
    this.assists = assists;
    this.xg = xg;
  }
  contributions() { return this.goals + this.assists; }
  goalDifference() { return (this.goals - this.xg).toFixed(1); }
}

const form = document.getElementById('customPlayerForm');
const list = document.getElementById('customPlayerList');
const status = document.getElementById('customPlayerStatus');
const firstSelect = document.getElementById('playerOne');
const secondSelect = document.getElementById('playerTwo');
let myPlayers = getCustomPlayers();
let editingId = null;

function cell(text, tag = 'td') {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function savePlayers() {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(myPlayers));
    return true;
  } catch (error) {
    status.textContent = 'Unable to save players in this browser.';
    return false;
  }
}

function playerObjects() {
  return [...players, ...myPlayers].map(p =>
    new FootballPlayer(p.name, p.team, p.goals, p.assists, p.xg)
  );
}

function comparePlayers() {
  const all = playerObjects();
  const first = all[Number(firstSelect.value)];
  const second = all[Number(secondSelect.value)];
  const result = document.getElementById('comparisonResult');
  result.innerHTML = '';
  if (!first || !second || first === second) {
    result.textContent = 'Please choose two different players.';
    return;
  }

  const table = document.createElement('table');
  const head = document.createElement('tr');
  ['Statistic', first.name, second.name].forEach(text => head.appendChild(cell(text, 'th')));
  table.appendChild(head);

  const rows = [
    ['Goals', first.goals, second.goals],
    ['Assists', first.assists, second.assists],
    ['Goal contributions', first.contributions(), second.contributions()],
    ['Goals minus xG', first.goalDifference(), second.goalDifference()]
  ];
  rows.forEach(values => {
    const row = document.createElement('tr');
    values.forEach(value => row.appendChild(cell(value)));
    table.appendChild(row);
  });
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  wrap.appendChild(table);
  result.appendChild(wrap);

  const message = document.createElement('p');
  message.className = 'success';
  message.textContent = first.contributions() === second.contributions()
    ? 'Result: draw'
    : 'Higher goal contributions: ' + (first.contributions() > second.contributions() ? first.name : second.name);
  result.appendChild(message);
}

function refreshComparison() {
  const oldFirst = firstSelect.value;
  const oldSecond = secondSelect.value;
  const all = playerObjects();
  [firstSelect, secondSelect].forEach(select => {
    select.innerHTML = '';
    all.forEach((p, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = p.name;
      select.appendChild(option);
    });
  });
  firstSelect.value = Number(oldFirst) < all.length && oldFirst !== '' ? oldFirst : '0';
  secondSelect.value = Number(oldSecond) < all.length && oldSecond !== '' ? oldSecond : '1';
  comparePlayers();
}

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById('saveCustomPlayer').textContent = 'Add Player';
  document.getElementById('cancelCustomEdit').hidden = true;
}

function renderSavedPlayers() {
  list.innerHTML = '';
  if (myPlayers.length === 0) {
    list.textContent = 'No saved players yet.';
    return;
  }
  const table = document.createElement('table');
  const header = document.createElement('tr');
  ['Name', 'Team', 'Goals', 'Assists', 'xG', 'Actions'].forEach(name => header.appendChild(cell(name, 'th')));
  table.appendChild(header);
  myPlayers.forEach(p => {
    const row = document.createElement('tr');
    [p.name, p.team, p.goals, p.assists, p.xg].forEach(value => row.appendChild(cell(value)));
    const actions = document.createElement('td');
    ['Edit', 'Delete'].forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn';
      button.textContent = action;
      button.dataset.action = action.toLowerCase();
      button.dataset.id = p.id;
      actions.appendChild(button);
    });
    row.appendChild(actions);
    table.appendChild(row);
  });
  list.appendChild(table);
}

list.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const p = myPlayers.find(player => player.id === button.dataset.id);
  if (!p) return;

  if (button.dataset.action === 'edit') {
    editingId = p.id;
    document.getElementById('customName').value = p.name;
    document.getElementById('customTeam').value = p.team;
    document.getElementById('customGoals').value = p.goals;
    document.getElementById('customAssists').value = p.assists;
    document.getElementById('customXg').value = p.xg;
    document.getElementById('saveCustomPlayer').textContent = 'Save Changes';
    document.getElementById('cancelCustomEdit').hidden = false;
    status.textContent = 'Editing ' + p.name;
    form.scrollIntoView({ behavior: 'smooth' });
  } else if (confirm('Delete ' + p.name + '?')) {
    const previous = myPlayers;
    myPlayers = myPlayers.filter(player => player.id !== p.id);
    if (!savePlayers()) { myPlayers = previous; return; }
    if (editingId === p.id) resetForm();
    renderSavedPlayers();
    refreshComparison();
    status.textContent = 'Player deleted.';
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = document.getElementById('customName').value.trim();
  const team = document.getElementById('customTeam').value.trim();
  const goals = Number(document.getElementById('customGoals').value);
  const assists = Number(document.getElementById('customAssists').value);
  const xg = Number(document.getElementById('customXg').value);
  if (name.length < 2 || team.length < 2 ||
      !Number.isInteger(goals) || goals < 0 ||
      !Number.isInteger(assists) || assists < 0 ||
      !Number.isFinite(xg) || xg < 0) {
    status.textContent = 'Please enter valid player details.';
    return;
  }
  const wasEditing = Boolean(editingId);
  const player = {
    id: editingId || String(Date.now()) + '-' + Math.random().toString(36).slice(2, 7),
    name, team, goals, assists, xg
  };
  const previous = myPlayers;
  myPlayers = wasEditing ? myPlayers.map(p => p.id === editingId ? player : p) : [...myPlayers, player];
  if (!savePlayers()) { myPlayers = previous; return; }
  resetForm();
  renderSavedPlayers();
  refreshComparison();
  status.textContent = wasEditing ? 'Player updated!' : 'Player added!';
});

document.getElementById('cancelCustomEdit').addEventListener('click', () => {
  resetForm();
  status.textContent = 'Editing cancelled.';
});
document.getElementById('compareButton').addEventListener('click', comparePlayers);
renderSavedPlayers();
refreshComparison();
