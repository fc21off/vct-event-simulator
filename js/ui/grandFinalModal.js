/**
 * Renders and updates the BO5 Grand Finals Modal matching Mockup 1 & 2.
 * @param {Object} gfState Grand Final state from engine
 * @param {string} tournamentName Name of current tournament
 */
export function renderGrandFinalModal(gfState, tournamentName) {
  const modal = document.getElementById('modal-grand-finals');
  if (!modal || !gfState) return;

  // Subtitle (e.g. VALORANT CHAMPIONS TOKYO)
  const subTitleEl = document.getElementById('gf-sub-title');
  if (subTitleEl) subTitleEl.textContent = tournamentName || 'VALORANT CHAMPIONS';

  // Team 1 Card
  const t1Tag = document.getElementById('gf-team1-tag');
  const t1Score = document.getElementById('gf-team1-score');
  if (t1Tag) t1Tag.textContent = gfState.team1 ? (gfState.team1.tag || gfState.team1.name) : 'TBD';
  if (t1Score) t1Score.textContent = gfState.team1MapsWon;

  // Team 2 Card
  const t2Tag = document.getElementById('gf-team2-tag');
  const t2Score = document.getElementById('gf-team2-score');
  if (t2Tag) t2Tag.textContent = gfState.team2 ? (gfState.team2.tag || gfState.team2.name) : 'TBD';
  if (t2Score) t2Score.textContent = gfState.team2MapsWon;

  // Render 5 Map Rows
  const mapsList = document.getElementById('gf-maps-list');
  if (mapsList) {
    mapsList.innerHTML = '';
    gfState.maps.forEach(m => {
      const row = document.createElement('div');
      const pickClass = m.picker === 1 ? 'picked-by-team1' : (m.picker === 2 ? 'picked-by-team2' : '');
      row.className = `gf-map-row ${pickClass}`;

      const t1Win = m.played && m.winner && m.winner.id === gfState.team1.id;
      const t2Win = m.played && m.winner && m.winner.id === gfState.team2.id;

      const t1ScoreClass = m.played ? (t1Win ? 'win-score' : 'lose-score') : 'unplayed-score';
      const t2ScoreClass = m.played ? (t2Win ? 'win-score' : 'lose-score') : 'unplayed-score';

      const s1 = m.played ? m.team1Score : '-';
      const s2 = m.played ? m.team2Score : '-';

      row.innerHTML = `
        <span class="gf-map-score ${t1ScoreClass}">${s1}</span>
        <span class="gf-map-name">${m.name}</span>
        <span class="gf-map-score ${t2ScoreClass}">${s2}</span>
      `;
      mapsList.appendChild(row);
    });
  }

  // Map Vetos Text
  const vetosEl = document.getElementById('gf-vetos-text');
  if (vetosEl && gfState.vetos) {
    vetosEl.textContent = `MAP VETOS: ${gfState.vetos.join(' | ').toUpperCase()}`;
  }

  // Update button states
  const btnMap = document.getElementById('btn-gf-sim-map');
  const btnGame = document.getElementById('btn-gf-sim-game');

  if (gfState.isComplete) {
    if (btnMap) {
      btnMap.classList.add('btn-disabled');
      btnMap.disabled = true;
    }
    if (btnGame) {
      btnGame.classList.add('btn-disabled');
      btnGame.disabled = true;
    }
  } else {
    if (btnMap) {
      btnMap.classList.remove('btn-disabled');
      btnMap.disabled = false;
    }
    if (btnGame) {
      btnGame.classList.remove('btn-disabled');
      btnGame.disabled = false;
    }
  }
}
