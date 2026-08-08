/**
 * Renders the GSL Group Stage with 4 Groups matching Pick'em / VLR bracket layout.
 * Fits within viewport without scrolling.
 * @param {HTMLElement} container
 * @param {Array} groups
 */
export function renderGroupStage(container, groups) {
  const wrapper = document.createElement('div');
  wrapper.className = 'groups-container'; // No fade animation flash on re-render

  // 2x2 Viewport Grid for 4 Groups
  const grid = document.createElement('div');
  grid.className = 'groups-viewport-grid';

  groups.forEach(group => {
    grid.appendChild(createGroupCard(group));
  });

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

/**
 * Creates a single group card matching user mockup 1 & 2.
 */
function createGroupCard(group) {
  const isComplete = group.phase === 'complete';
  const gCard = document.createElement('div');
  gCard.className = `group-card ${isComplete ? 'group-complete' : ''}`;

  // Header: GROUP A, B, C, D
  const header = document.createElement('div');
  header.className = 'group-card-header';
  header.innerHTML = `<h3 class="group-card-title">GROUP ${group.name}</h3>`;
  gCard.appendChild(header);

  // Bracket Flow Grid (Left: Opening1, Opening2, Elim | Middle: Winners, Decider | Right: 1st Seed, 2nd Seed)
  const flow = document.createElement('div');
  flow.className = 'gsl-bracket-flow';

  // --- COLUMN 1: Opening 1, Opening 2, Elimination ---
  const col1 = document.createElement('div');
  col1.className = 'gsl-col';
  
  col1.appendChild(createGSLMatchBox(group.matches.opening1, group.teams[0], group.teams[3]));
  col1.appendChild(createGSLMatchBox(group.matches.opening2, group.teams[1], group.teams[2]));
  
  // Elimination Match
  const elimT1 = group.matches.opening1 ? group.matches.opening1.loser : null;
  const elimT2 = group.matches.opening2 ? group.matches.opening2.loser : null;
  col1.appendChild(createGSLMatchBox(group.matches.elimination, elimT1, elimT2));

  flow.appendChild(col1);

  // --- COLUMN 2: Winners Match, Decider Match ---
  const col2 = document.createElement('div');
  col2.className = 'gsl-col';

  // Winners Match
  const winT1 = group.matches.opening1 ? group.matches.opening1.winner : null;
  const winT2 = group.matches.opening2 ? group.matches.opening2.winner : null;
  col2.appendChild(createGSLMatchBox(group.matches.winners, winT1, winT2));

  // Decider Match
  const decT1 = group.matches.winners ? group.matches.winners.loser : null;
  const decT2 = group.matches.elimination ? group.matches.elimination.winner : null;
  col2.appendChild(createGSLMatchBox(group.matches.decider, decT1, decT2));

  flow.appendChild(col2);

  // --- COLUMN 3: Qualified Seeds 1 & 2 ---
  const col3 = document.createElement('div');
  col3.className = 'gsl-qualified-col';

  // 1st Seed Box (Winners Match Winner)
  const seed1Team = group.results ? group.results.first : null;
  const seed1Box = document.createElement('div');
  seed1Box.className = 'gsl-seed-box';
  seed1Box.innerHTML = `
    <span class="seed-lbl">1ST SEED</span>
    <span class="seed-team-tag">${seed1Team ? (seed1Team.tag || seed1Team.name) : 'TBD'}</span>
  `;

  // 2nd Seed Box (Decider Match Winner)
  const seed2Team = group.results ? group.results.second : null;
  const seed2Box = document.createElement('div');
  seed2Box.className = 'gsl-seed-box';
  seed2Box.innerHTML = `
    <span class="seed-lbl">2ND SEED</span>
    <span class="seed-team-tag">${seed2Team ? (seed2Team.tag || seed2Team.name) : 'TBD'}</span>
  `;

  col3.appendChild(seed1Box);
  col3.appendChild(seed2Box);

  flow.appendChild(col3);
  gCard.appendChild(flow);

  return gCard;
}

/**
 * Creates a match box matching user mockup 2.
 * Left accent bar, team names on left, scores on far right.
 */
function createGSLMatchBox(match, fallbackTeam1, fallbackTeam2) {
  const isPlayed = match && (match.played || match.winner);
  const box = document.createElement('div');
  box.className = `gsl-match-box ${isPlayed ? 'match-played' : (match ? 'active-match' : '')}`;

  const t1 = match ? match.team1 : fallbackTeam1;
  const t2 = match ? match.team2 : fallbackTeam2;

  const t1Win = isPlayed && match.winner && match.winner.id === t1?.id;
  const t2Win = isPlayed && match.winner && match.winner.id === t2?.id;

  const t1Lose = isPlayed && match.winner && match.winner.id !== t1?.id;
  const t2Lose = isPlayed && match.winner && match.winner.id !== t2?.id;

  const t1Name = t1 ? (t1.tag || t1.name) : 'TBD';
  const t2Name = t2 ? (t2.tag || t2.name) : 'TBD';

  const t1Score = match ? match.team1Score : '-';
  const t2Score = match ? match.team2Score : '-';

  box.innerHTML = `
    <div class="gsl-match-row">
      <span class="gsl-team-name ${t1Win ? 'winner-text' : (t1Lose ? 'loser-text' : '')}">${t1Name}</span>
      <span class="gsl-score-num ${t1Win ? 'winner-score' : (t1Lose ? 'loser-score' : '')}">${t1Score}</span>
    </div>
    <div class="gsl-match-row">
      <span class="gsl-team-name ${t2Win ? 'winner-text' : (t2Lose ? 'loser-text' : '')}">${t2Name}</span>
      <span class="gsl-score-num ${t2Win ? 'winner-score' : (t2Lose ? 'loser-score' : '')}">${t2Score}</span>
    </div>
  `;

  return box;
}
