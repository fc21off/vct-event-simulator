import { openGrandFinalModal, showChampionCelebration } from '../app.js';

/**
 * Renders the Double-Elimination Playoff Bracket matching user specs:
 * - Vertical side labels (UPPER BRACKET / LOWER BRACKET) with fade dividers on the left.
 * - Symmetrical rounds flow (Upper: QF, SF, Final | Lower: R1, R2, Semi, Final, Grand Final).
 * - Square Winner Box on right (clean gold typography, no weird box glow).
 * - Zero emojis.
 * @param {HTMLElement} container
 * @param {Object} bracketState
 */
export function renderBracket(container, bracketState) {
  const wrapper = document.createElement('div');
  wrapper.className = 'playoff-viewport-container';

  // --- LEFT SIDE: UPPER & LOWER BRACKETS ---
  const leftSide = document.createElement('div');
  leftSide.className = 'playoff-brackets-left';

  // 1. UPPER BRACKET SECTION
  const upperWrap = document.createElement('div');
  upperWrap.className = 'playoff-section-wrap';
  
  // Vertical Side Label + Divider
  upperWrap.innerHTML = `
    <div class="playoff-side-label-wrap">
      <div class="playoff-side-label">UPPER BRACKET</div>
      <div class="playoff-side-divider"></div>
    </div>
  `;

  const upperFlow = document.createElement('div');
  upperFlow.className = 'playoff-rounds-flow';

  const upperRoundTitles = ['UPPER QUARTERFINALS', 'UPPER SEMIFINALS', 'UPPER FINAL'];

  if (bracketState.upper) {
    bracketState.upper.forEach((round, idx) => {
      const rCol = document.createElement('div');
      rCol.className = 'playoff-round-col';
      
      const colTitle = document.createElement('div');
      colTitle.className = 'playoff-col-title';
      colTitle.textContent = upperRoundTitles[idx] || round.name.toUpperCase();
      rCol.appendChild(colTitle);

      const matchesWrap = document.createElement('div');
      matchesWrap.className = 'playoff-matches-wrap';
      matchesWrap.style.justifyContent = round.matches.length === 1 ? 'center' : 'space-around';

      round.matches.forEach(m => {
        matchesWrap.appendChild(createPlayoffMatchBox(m));
      });
      rCol.appendChild(matchesWrap);
      upperFlow.appendChild(rCol);
    });
  }

  // ALIGN GRAND FINAL MATCH BOX ON THE UPPER BRACKET ROW ON THE FAR RIGHT!
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

  const gfMatchBox = createPlayoffMatchBox(bracketState.grandFinal, true);
  gfMatchesWrap.appendChild(gfMatchBox);
  gfCol.appendChild(gfMatchesWrap);

  upperFlow.appendChild(gfCol);
  upperWrap.appendChild(upperFlow);
  leftSide.appendChild(upperWrap);

  // 2. LOWER BRACKET SECTION
  const lowerWrap = document.createElement('div');
  lowerWrap.className = 'playoff-section-wrap';
  
  // Vertical Side Label + Divider
  lowerWrap.innerHTML = `
    <div class="playoff-side-label-wrap">
      <div class="playoff-side-label">LOWER BRACKET</div>
      <div class="playoff-side-divider"></div>
    </div>
  `;

  const lowerFlow = document.createElement('div');
  lowerFlow.className = 'playoff-rounds-flow';

  const lowerRoundTitles = ['LOWER ROUND 1', 'LOWER ROUND 2', 'LOWER SEMIFINAL', 'LOWER FINAL'];

  if (bracketState.lower) {
    bracketState.lower.forEach((round, idx) => {
      const rCol = document.createElement('div');
      rCol.className = 'playoff-round-col';

      const colTitle = document.createElement('div');
      colTitle.className = 'playoff-col-title';
      colTitle.textContent = lowerRoundTitles[idx] || round.name.toUpperCase();
      rCol.appendChild(colTitle);

      const matchesWrap = document.createElement('div');
      matchesWrap.className = 'playoff-matches-wrap';
      matchesWrap.style.justifyContent = round.matches.length === 1 ? 'center' : 'space-around';

      round.matches.forEach(m => {
        matchesWrap.appendChild(createPlayoffMatchBox(m));
      });
      rCol.appendChild(matchesWrap);
      lowerFlow.appendChild(rCol);
    });
  }

  lowerWrap.appendChild(lowerFlow);
  leftSide.appendChild(lowerWrap);

  wrapper.appendChild(leftSide);

  // --- RIGHT SIDE: SQUARE WINNER BOX ONLY ---
  const rightWinnerBox = document.createElement('div');
  rightWinnerBox.className = 'playoff-winner-container';

  const champTitle = bracketState.theme === 'masters' ? 'VALORANT MASTERS WINNER' : 'VALORANT CHAMPIONS WINNER';

  if (bracketState.champion) {
    rightWinnerBox.innerHTML = `
      <h3 class="winner-box-title">${champTitle}</h3>
      <div class="winner-trophy-display">
        <div class="winner-team-display">${bracketState.champion.tag || bracketState.champion.name}</div>
        <div class="winner-sub-lbl">WORLD CHAMPION</div>
      </div>
    `;
    rightWinnerBox.style.cursor = 'pointer';
    rightWinnerBox.title = 'Click to view Champion Celebration';
    rightWinnerBox.addEventListener('click', () => {
      showChampionCelebration(bracketState.champion, bracketState.name);
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
}

/**
 * Creates a match box element matching Mockup 2.
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

  const t1Score = match.team1Score !== undefined ? match.team1Score : '-';
  const t2Score = match.team2Score !== undefined ? match.team2Score : '-';

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
