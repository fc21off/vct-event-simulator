import { openGrandFinalModal, showChampionCelebration } from '../app.js';

/**
 * Renders a custom Sandbox Tournament Bracket view using the official VCT Esports layout.
 * @param {HTMLElement} container 
 * @param {Object} tournament 
 */
export function renderSandboxView(container, tournament) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'playoff-viewport-container';

  // --- LEFT SIDE: UPPER & LOWER BRACKETS ---
  const leftSide = document.createElement('div');
  leftSide.className = 'playoff-brackets-left';

  // Categorize Gameboxes into Upper, Lower, and Grand Final
  const gameboxes = (tournament.nodes || []).filter(n => n.type === 'gamebox');
  const connections = tournament.connections || [];
  const champNode = (tournament.nodes || []).find(n => n.type === 'champion');

  // Identify Grand Final Node (connected to Champion)
  let gfNodeId = null;
  if (champNode) {
    const connToChamp = connections.find(c => c.toNodeId === champNode.id);
    if (connToChamp) gfNodeId = connToChamp.fromNodeId;
  }

  // Calculate Depth Levels for Gameboxes
  const nodeLevels = {};
  function calculateLevel(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return 1;
    visited.add(nodeId);

    const incomingConns = connections.filter(c => c.toNodeId === nodeId);
    if (incomingConns.length === 0) return 1;

    let maxParentLevel = 0;
    incomingConns.forEach(c => {
      const sourceNode = (tournament.nodes || []).find(n => n.id === c.fromNodeId);
      if (sourceNode && sourceNode.type === 'gamebox') {
        const parentLvl = calculateLevel(sourceNode.id, new Set(visited));
        if (parentLvl > maxParentLevel) maxParentLevel = parentLvl;
      }
    });
    return maxParentLevel + 1;
  }

  gameboxes.forEach(gb => {
    nodeLevels[gb.id] = calculateLevel(gb.id);
  });

  // Determine Upper vs Lower Bracket assignment
  const upperGameboxes = [];
  const lowerGameboxes = [];
  let grandFinalNode = null;

  gameboxes.forEach(gb => {
    if (gb.id === gfNodeId || gb.isGrandFinal) {
      grandFinalNode = gb;
      gb.isGrandFinal = true;
    } else {
      // Check if fed by any Loser path
      const isLower = connections.some(c => c.toNodeId === gb.id && c.fromPort === 'loser');
      if (isLower) {
        lowerGameboxes.push(gb);
      } else {
        upperGameboxes.push(gb);
      }
    }
  });

  // Fallback: If all are upper and no gf detected, last upper node is GF
  if (!grandFinalNode && upperGameboxes.length > 0) {
    upperGameboxes.sort((a, b) => nodeLevels[b.id] - nodeLevels[a.id]);
    grandFinalNode = upperGameboxes.shift();
    grandFinalNode.isGrandFinal = true;
  }

  // Group Upper Gameboxes into Level Rounds
  const upperLevelsMap = {};
  upperGameboxes.forEach(gb => {
    const lvl = nodeLevels[gb.id] || 1;
    if (!upperLevelsMap[lvl]) upperLevelsMap[lvl] = [];
    upperLevelsMap[lvl].push(gb);
  });

  const upperLevelKeys = Object.keys(upperLevelsMap).sort((a, b) => Number(a) - Number(b));
  const upperRoundTitles = ['UPPER QUARTERFINALS', 'UPPER SEMIFINALS', 'UPPER FINAL'];

  // 1. UPPER BRACKET SECTION
  const upperWrap = document.createElement('div');
  upperWrap.className = 'playoff-section-wrap';
  upperWrap.innerHTML = `
    <div class="playoff-side-label-wrap">
      <div class="playoff-side-label">UPPER BRACKET</div>
      <div class="playoff-side-divider"></div>
    </div>
  `;

  const upperFlow = document.createElement('div');
  upperFlow.className = 'playoff-rounds-flow';

  upperLevelKeys.forEach((lvl, idx) => {
    const rCol = document.createElement('div');
    rCol.className = 'playoff-round-col';
    
    const colTitle = document.createElement('div');
    colTitle.className = 'playoff-col-title';
    colTitle.textContent = upperRoundTitles[idx] || `UPPER ROUND ${idx + 1}`;
    rCol.appendChild(colTitle);

    const matchesWrap = document.createElement('div');
    matchesWrap.className = 'playoff-matches-wrap';
    const matchesInRound = upperLevelsMap[lvl];
    matchesWrap.style.justifyContent = matchesInRound.length === 1 ? 'center' : 'space-around';

    matchesInRound.forEach(m => {
      matchesWrap.appendChild(createPlayoffMatchBox(m));
    });
    rCol.appendChild(matchesWrap);
    upperFlow.appendChild(rCol);
  });

  // GRAND FINAL COLUMN AT FAR RIGHT OF UPPER ROW
  const gfCol = document.createElement('div');
  gfCol.className = 'playoff-round-col';
  
  const gfColTitle = document.createElement('div');
  gfColTitle.className = 'playoff-col-title';
  gfColTitle.style.cssText = 'color: #bdb578; font-weight: 900;';
  gfColTitle.textContent = 'GRAND FINAL';
  gfCol.appendChild(gfColTitle);

  const gfMatchesWrap = document.createElement('div');
  gfMatchesWrap.className = 'playoff-matches-wrap';
  gfMatchesWrap.style.justifyContent = 'center';

  if (grandFinalNode) {
    gfMatchesWrap.appendChild(createPlayoffMatchBox(grandFinalNode, true));
  } else {
    gfMatchesWrap.appendChild(createPlayoffMatchBox(null, true));
  }
  gfCol.appendChild(gfMatchesWrap);
  upperFlow.appendChild(gfCol);

  upperWrap.appendChild(upperFlow);
  leftSide.appendChild(upperWrap);

  // 2. LOWER BRACKET SECTION (If Lower matches exist)
  if (lowerGameboxes.length > 0) {
    const lowerLevelsMap = {};
    lowerGameboxes.forEach(gb => {
      const lvl = nodeLevels[gb.id] || 1;
      if (!lowerLevelsMap[lvl]) lowerLevelsMap[lvl] = [];
      lowerLevelsMap[lvl].push(gb);
    });

    const lowerLevelKeys = Object.keys(lowerLevelsMap).sort((a, b) => Number(a) - Number(b));
    const lowerRoundTitles = ['LOWER ROUND 1', 'LOWER ROUND 2', 'LOWER SEMIFINAL', 'LOWER FINAL'];

    const lowerWrap = document.createElement('div');
    lowerWrap.className = 'playoff-section-wrap';
    lowerWrap.innerHTML = `
      <div class="playoff-side-label-wrap">
        <div class="playoff-side-label">LOWER BRACKET</div>
        <div class="playoff-side-divider"></div>
      </div>
    `;

    const lowerFlow = document.createElement('div');
    lowerFlow.className = 'playoff-rounds-flow';

    lowerLevelKeys.forEach((lvl, idx) => {
      const rCol = document.createElement('div');
      rCol.className = 'playoff-round-col';
      
      const colTitle = document.createElement('div');
      colTitle.className = 'playoff-col-title';
      colTitle.textContent = lowerRoundTitles[idx] || `LOWER ROUND ${idx + 1}`;
      rCol.appendChild(colTitle);

      const matchesWrap = document.createElement('div');
      matchesWrap.className = 'playoff-matches-wrap';
      const matchesInRound = lowerLevelsMap[lvl];
      matchesWrap.style.justifyContent = matchesInRound.length === 1 ? 'center' : 'space-around';

      matchesInRound.forEach(m => {
        matchesWrap.appendChild(createPlayoffMatchBox(m));
      });
      rCol.appendChild(matchesWrap);
      lowerFlow.appendChild(rCol);
    });

    lowerWrap.appendChild(lowerFlow);
    leftSide.appendChild(lowerWrap);
  }

  wrapper.appendChild(leftSide);

  // --- RIGHT SIDE: GOLDEN WINNER DISPLAY BOX ---
  const rightWinnerBox = document.createElement('div');
  rightWinnerBox.className = 'playoff-winner-container';

  const champTitle = `${tournament.name || 'CUSTOM BRACKET'} WINNER`;

  if (tournament.champion) {
    const champ = tournament.champion;
    const logoHtml = champ.logo ? `<img src="${champ.logo}" alt="${champ.name}" class="winner-team-logo" />` : '';

    rightWinnerBox.innerHTML = `
      <h3 class="winner-box-title">${champTitle}</h3>
      <div class="winner-trophy-display">
        ${logoHtml}
        <div class="winner-team-display">${champ.tag || champ.name}</div>
        <div class="winner-sub-lbl">CUSTOM CHAMPION</div>
      </div>
    `;
    rightWinnerBox.style.cursor = 'pointer';
    rightWinnerBox.title = 'Click to view Champion Celebration';
    rightWinnerBox.addEventListener('click', () => {
      showChampionCelebration(tournament.champion, tournament.name);
    });
  } else {
    rightWinnerBox.innerHTML = `
      <h3 class="winner-box-title">${champTitle}</h3>
      <div class="winner-tbd-lbl">
        WINNER TBD
      </div>
    `;
  }

  wrapper.appendChild(rightWinnerBox);
  container.appendChild(wrapper);

  // Check if champion just won and celebrate!
  if (tournament.champion && !tournament.celebrated) {
    tournament.celebrated = true;
    setTimeout(() => {
      showChampionCelebration(tournament.champion, tournament.name);
    }, 500);
  }
}

/**
 * Creates an official VCT match box element.
 */
function createPlayoffMatchBox(match, isGrandFinal = false) {
  const box = document.createElement('div');
  const isPlayed = match && (match.played || match.winner);
  box.className = `playoff-match-box ${isGrandFinal ? 'grand-final-highlight' : ''} ${isPlayed ? 'match-played' : ''}`;

  if (isGrandFinal) {
    box.style.cursor = 'pointer';
    box.title = 'Click to inspect Grand Final maps & scores';
    box.addEventListener('click', () => {
      openGrandFinalModal();
    });
  }

  if (!match) {
    box.innerHTML = `
      <div class="playoff-match-row"><span class="playoff-team-name" style="opacity:0.4;">TBD</span><span class="playoff-score-num">-</span></div>
      <div class="playoff-match-row"><span class="playoff-team-name" style="opacity:0.4;">TBD</span><span class="playoff-score-num">-</span></div>
    `;
    return box;
  }

  const t1 = match.team1;
  const t2 = match.team2;

  const t1Win = isPlayed && match.winner && t1 && match.winner.id === t1.id;
  const t2Win = isPlayed && match.winner && t2 && match.winner.id === t2.id;

  const t1Lose = isPlayed && match.winner && t1 && match.winner.id !== t1.id;
  const t2Lose = isPlayed && match.winner && t2 && match.winner.id !== t2.id;

  const t1Name = t1 ? (t1.tag || t1.name) : 'TBD';
  const t2Name = t2 ? (t2.tag || t2.name) : 'TBD';

  const t1Score = match.team1Score !== undefined && match.team1Score !== null ? match.team1Score : '-';
  const t2Score = match.team2Score !== undefined && match.team2Score !== null ? match.team2Score : '-';

  const t1Logo = t1 && t1.logo ? `<img src="${t1.logo}" alt="" class="match-team-logo" />` : '';
  const t2Logo = t2 && t2.logo ? `<img src="${t2.logo}" alt="" class="match-team-logo" />` : '';

  box.innerHTML = `
    <div class="playoff-match-row">
      <span class="playoff-team-name ${t1Win ? 'winner-text' : (t1Lose ? 'loser-text' : '')}">${t1Logo}${t1Name}</span>
      <span class="playoff-score-num ${t1Win ? 'winner-score' : (t1Lose ? 'loser-score' : '')}">${t1Score}</span>
    </div>
    <div class="playoff-match-row">
      <span class="playoff-team-name ${t2Win ? 'winner-text' : (t2Lose ? 'loser-text' : '')}">${t2Logo}${t2Name}</span>
      <span class="playoff-score-num ${t2Win ? 'winner-score' : (t2Lose ? 'loser-score' : '')}">${t2Score}</span>
    </div>
  `;

  return box;
}
