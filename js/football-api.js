const apiButton = document.getElementById('reloadApi');
const apiStatus = document.getElementById('apiStatus');
const apiList = document.getElementById('apiMatchList');
const API_URL = 'https://api.openligadb.de/getmatchdata/bl1/2026';

function matchDate(match) {
  const date = new Date(match.matchDateTimeUTC || match.matchDateTime);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function loadApiMatches() {
  apiButton.disabled = true;
  apiStatus.textContent = 'Loading matches...';
  apiList.innerHTML = '';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected API data');

    const now = Date.now();
    const nearest = data.filter(m => m && m.team1 && m.team2)
      .sort((a, b) => {
        const first = matchDate(a);
        const second = matchDate(b);
        return (first ? Math.abs(first - now) : Infinity) -
          (second ? Math.abs(second - now) : Infinity);
      }).slice(0, 8);

    if (!nearest.length) {
      apiStatus.textContent = 'No matches were returned.';
      return;
    }
    nearest.forEach(match => {
      const card = document.createElement('article');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = match.team1.teamName + ' vs ' + match.team2.teamName;
      const date = document.createElement('p');
      const when = matchDate(match);
      date.textContent = when ? when.toLocaleString('en-GB') : 'Date unavailable';
      const score = document.createElement('p');
      const final = Array.isArray(match.matchResults) ?
        match.matchResults.find(result => result.resultTypeID === 2) : null;
      score.textContent = final ? `${final.pointsTeam1} : ${final.pointsTeam2}` : 'Final score unavailable';
      card.append(title, date, score);
      apiList.appendChild(card);
    });
    apiStatus.textContent = `Successfully loaded ${nearest.length} matches.`;
  } catch (error) {
    apiStatus.textContent = 'Could not load live data. Check your connection and try again.';
  } finally {
    apiButton.disabled = false;
  }
}
apiButton.addEventListener('click', loadApiMatches);
loadApiMatches();
