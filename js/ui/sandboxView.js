import { openGrandFinalModal, showChampionCelebration } from '../app.js';

/**
 * Renders a custom Sandbox Tournament Bracket view.
 * @param {HTMLElement} container 
 * @param {Object} tournament 
 */
export function renderSandboxView(container, tournament) {
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'playoff-viewport-container';
  wrap.style.cssText = 'position: relative; width: 100%; min-height: 500px; padding: 2rem; overflow-x: auto;';

  const nodesLayer = document.createElement('div');
  nodesLayer.style.cssText = 'position: relative; display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; align-items: center;';

  const gameboxes = tournament.nodes.filter(n => n.type === 'gamebox');
  const championNode = tournament.nodes.find(n => n.type === 'champion');

  gameboxes.forEach(gb => {
    const box = document.createElement('div');
    const isPlayed = gb.played;
    const isGF = gb.isGrandFinal;
    box.className = `playoff-match-box ${isGF ? 'grand-final-highlight' : ''} ${isPlayed ? 'match-played' : ''}`;
    box.style.cssText = 'min-width: 200px; margin: 0.5rem;';

    const t1 = gb.team1;
    const t2 = gb.team2;

    const t1Win = isPlayed && gb.winner && t1 && gb.winner.id === t1.id;
    const t2Win = isPlayed && gb.winner && t2 && gb.winner.id === t2.id;
    const t1Lose = isPlayed && gb.winner && t1 && gb.winner.id !== t1.id;
    const t2Lose = isPlayed && gb.winner && t2 && gb.winner.id !== t2.id;

    const t1Name = t1 ? (t1.tag || t1.name) : 'TBD';
    const t2Name = t2 ? (t2.tag || t2.name) : 'TBD';

    const t1Score = gb.team1Score !== null && gb.team1Score !== undefined ? gb.team1Score : '-';
    const t2Score = gb.team2Score !== null && gb.team2Score !== undefined ? gb.team2Score : '-';

    const t1Logo = t1 && t1.logo ? `<img src="${t1.logo}" alt="" class="match-team-logo" />` : '';
    const t2Logo = t2 && t2.logo ? `<img src="${t2.logo}" alt="" class="match-team-logo" />` : '';

    box.innerHTML = `
      <div style="font-size: 0.7rem; font-weight: 800; color: #888; text-transform: uppercase; margin-bottom: 0.3rem;">${gb.label || 'GAME'}</div>
      <div class="playoff-match-row">
        <span class="playoff-team-name ${t1Win ? 'winner-text' : (t1Lose ? 'loser-text' : '')}">${t1Logo}${t1Name}</span>
        <span class="playoff-score-num ${t1Win ? 'winner-score' : (t1Lose ? 'loser-score' : '')}">${t1Score}</span>
      </div>
      <div class="playoff-match-row">
        <span class="playoff-team-name ${t2Win ? 'winner-text' : (t2Lose ? 'loser-text' : '')}">${t2Logo}${t2Name}</span>
        <span class="playoff-score-num ${t2Win ? 'winner-score' : (t2Lose ? 'loser-score' : '')}">${t2Score}</span>
      </div>
    `;

    if (isGF) {
      box.style.cursor = 'pointer';
      box.title = 'Click to inspect Grand Final';
      box.addEventListener('click', () => {
        openGrandFinalModal();
      });
    }

    nodesLayer.appendChild(box);
  });

  // Champion Winner Box
  const winnerBox = document.createElement('div');
  winnerBox.className = 'playoff-winner-container';
  winnerBox.style.cssText = 'margin-left: 2rem; min-width: 220px;';

  if (tournament.champion) {
    winnerBox.innerHTML = `
      <h3 class="winner-box-title">${tournament.name} WINNER</h3>
      <div class="winner-trophy-display">
        <div class="winner-team-display">${tournament.champion.tag || tournament.champion.name}</div>
        <div class="winner-sub-lbl">CUSTOM CHAMPION</div>
      </div>
    `;
    winnerBox.style.cursor = 'pointer';
    winnerBox.addEventListener('click', () => {
      showChampionCelebration(tournament.champion, tournament.name);
    });
  } else {
    winnerBox.innerHTML = `
      <h3 class="winner-box-title">${tournament.name} WINNER</h3>
      <div class="winner-tbd-lbl">WINNER TBD</div>
    `;
  }

  nodesLayer.appendChild(winnerBox);
  wrap.appendChild(nodesLayer);
  container.appendChild(wrap);
}
