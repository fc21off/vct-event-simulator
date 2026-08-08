/**
 * Renders the Official VCT Broadcast / VLR / Liquipedia Style Swiss Stage:
 * - 4-Column Horizontal Stage Progression Flow (User's Approved Version):
 *   Col 1: ROUND 1 (4 Matches distributed top-to-bottom)
 *   Col 2: ROUND 2 (HIGH 1-0 Matches top half, LOW 0-1 Matches bottom half)
 *   Col 3: ROUND 3 (DECIDER 1-1 Matches centered)
 *   Col 4: QUALIFIED (2 Wins) & ELIMINATED (2 Losses) Summary Cards
 * - 100% static layout fitting within 100vh viewport without scrollbars.
 * @param {HTMLElement} container
 * @param {Object} swissState
 */
export function renderSwissStage(container, swissState) {
  const wrapper = document.createElement('div');
  wrapper.className = 'swiss-viewport-container';

  // Left Vertical Side Label + Divider
  const sideLabelWrap = document.createElement('div');
  sideLabelWrap.className = 'playoff-side-label-wrap';
  sideLabelWrap.innerHTML = `
    <div class="playoff-side-label">SWISS STAGE</div>
    <div class="playoff-side-divider"></div>
  `;
  wrapper.appendChild(sideLabelWrap);

  // Main 4-Column Horizontal Grid
  const flowGrid = document.createElement('div');
  flowGrid.className = 'swiss-4col-flow';

  const round1Data = swissState.rounds.find(r => r.roundNum === 1);
  const round2Data = swissState.rounds.find(r => r.roundNum === 2);
  const round3Data = swissState.rounds.find(r => r.roundNum === 3);

  // --- COLUMN 1: ROUND 1 (0-0 MATCHES) ---
  const col1 = document.createElement('div');
  col1.className = 'swiss-flow-col';
  col1.innerHTML = `
    <div class="swiss-col-header">
      <span class="col-title">ROUND 1</span>
      <span class="col-sub">0-0 MATCHES</span>
    </div>
  `;
  const col1Matches = document.createElement('div');
  col1Matches.className = 'swiss-col-matches';

  if (round1Data && round1Data.matches) {
    round1Data.matches.forEach(m => col1Matches.appendChild(createSwissMatchBox(m)));
  } else {
    for (let i = 0; i < 4; i++) col1Matches.appendChild(createSwissMatchBox(null));
  }
  col1.appendChild(col1Matches);
  flowGrid.appendChild(col1);

  // --- COLUMN 2: ROUND 2 (HIGH 1-0 & LOW 0-1) ---
  const col2 = document.createElement('div');
  col2.className = 'swiss-flow-col';
  col2.innerHTML = `
    <div class="swiss-col-header">
      <span class="col-title">ROUND 2</span>
      <span class="col-sub">HIGH (1-0) & LOW (0-1)</span>
    </div>
  `;
  const col2Matches = document.createElement('div');
  col2Matches.className = 'swiss-col-matches';

  if (round2Data && round2Data.matches) {
    const highTitle = document.createElement('div');
    highTitle.className = 'swiss-group-sublabel';
    highTitle.textContent = 'HIGH MATCHES (1-0)';
    col2Matches.appendChild(highTitle);
    round2Data.matches.slice(0, 2).forEach(m => col2Matches.appendChild(createSwissMatchBox(m)));

    const lowTitle = document.createElement('div');
    lowTitle.className = 'swiss-group-sublabel';
    lowTitle.textContent = 'LOW MATCHES (0-1)';
    col2Matches.appendChild(lowTitle);
    round2Data.matches.slice(2, 4).forEach(m => col2Matches.appendChild(createSwissMatchBox(m)));
  } else {
    const highTitle = document.createElement('div');
    highTitle.className = 'swiss-group-sublabel';
    highTitle.textContent = 'HIGH MATCHES (1-0)';
    col2Matches.appendChild(highTitle);
    for (let i = 0; i < 2; i++) col2Matches.appendChild(createSwissMatchBox(null));

    const lowTitle = document.createElement('div');
    lowTitle.className = 'swiss-group-sublabel';
    lowTitle.textContent = 'LOW MATCHES (0-1)';
    col2Matches.appendChild(lowTitle);
    for (let i = 0; i < 2; i++) col2Matches.appendChild(createSwissMatchBox(null));
  }
  col2.appendChild(col2Matches);
  flowGrid.appendChild(col2);

  // --- COLUMN 3: ROUND 3 (DECIDER 1-1) ---
  const col3 = document.createElement('div');
  col3.className = 'swiss-flow-col';
  col3.innerHTML = `
    <div class="swiss-col-header">
      <span class="col-title">ROUND 3</span>
      <span class="col-sub">DECIDERS (1-1)</span>
    </div>
  `;
  const col3Matches = document.createElement('div');
  col3Matches.className = 'swiss-col-matches';

  const deciderTitle = document.createElement('div');
  deciderTitle.className = 'swiss-group-sublabel';
  deciderTitle.textContent = 'DECIDER MATCHES (1-1)';
  col3Matches.appendChild(deciderTitle);

  if (round3Data && round3Data.matches) {
    round3Data.matches.forEach(m => col3Matches.appendChild(createSwissMatchBox(m)));
  } else {
    for (let i = 0; i < 2; i++) col3Matches.appendChild(createSwissMatchBox(null));
  }
  col3.appendChild(col3Matches);
  flowGrid.appendChild(col3);

  // --- COLUMN 4: QUALIFIED & ELIMINATED SUMMARY CARDS ---
  const col4 = document.createElement('div');
  col4.className = 'swiss-flow-col col-summary';

  const qualTeams = swissState.teams.filter(t => t.status === 'qualified');
  const elimTeams = swissState.teams.filter(t => t.status === 'eliminated');

  col4.innerHTML = `
    <div class="swiss-summary-card card-qualified">
      <div class="summary-card-header">
        <span class="summary-title">QUALIFIED FOR PLAYOFFS</span>
        <span class="summary-count">${qualTeams.length} TEAMS</span>
      </div>
      <div class="summary-teams-grid">
        ${qualTeams.length > 0
          ? qualTeams.map(t => `<div class="summary-team-pill pill-qualified"><span class="team-tag">${t.tag || t.name}</span><span class="team-score">2-${t.losses}</span></div>`).join('')
          : '<div class="summary-empty">PENDING ROUND RESULTS</div>'
        }
      </div>
    </div>

    <div class="swiss-summary-card card-eliminated">
      <div class="summary-card-header">
        <span class="summary-title">ELIMINATED</span>
        <span class="summary-count">${elimTeams.length} TEAMS</span>
      </div>
      <div class="summary-teams-grid">
        ${elimTeams.length > 0
          ? elimTeams.map(t => `<div class="summary-team-pill pill-eliminated"><span class="team-tag">${t.tag || t.name}</span><span class="team-score">${t.wins}-2</span></div>`).join('')
          : '<div class="summary-empty">PENDING ROUND RESULTS</div>'
        }
      </div>
    </div>
  `;
  flowGrid.appendChild(col4);

  wrapper.appendChild(flowGrid);
  container.appendChild(wrapper);
}

/**
 * Creates a match box element for Swiss rounds.
 */
function createSwissMatchBox(match) {
  const box = document.createElement('div');
  const isPlayed = match && (match.played || match.winner);
  box.className = `playoff-match-box ${isPlayed ? 'match-played' : ''}`;

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

  const t1Score = match.team1Score !== undefined ? match.team1Score : '-';
  const t2Score = match.team2Score !== undefined ? match.team2Score : '-';

  box.innerHTML = `
    <div class="playoff-match-row">
      <span class="playoff-team-name ${t1Win ? 'winner-text' : (t1Lose ? 'loser-text' : '')}">${t1Name}</span>
      <span class="playoff-score-num ${t1Win ? 'winner-score' : (t1Lose ? 'loser-score' : '')}">${t1Score}</span>
    </div>
    <div class="playoff-match-row">
      <span class="playoff-team-name ${t2Win ? 'winner-text' : (t2Lose ? 'loser-text' : '')}">${t2Name}</span>
      <span class="playoff-score-num ${t2Win ? 'winner-score' : (t2Lose ? 'loser-score' : '')}">${t2Score}</span>
    </div>
  `;

  return box;
}
