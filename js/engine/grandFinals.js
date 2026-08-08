import { generateGrandFinalDraft } from '../data/maps.js';

/**
 * Initializes a detailed BO5 Grand Final match state.
 * @param {Object} team1 Upper Bracket Winner
 * @param {Object} team2 Lower Bracket Winner
 * @returns {Object} Grand Final state
 */
export function createGrandFinalMatch(team1, team2) {
  const draft = generateGrandFinalDraft();

  return {
    team1,
    team2,
    team1MapsWon: 0,
    team2MapsWon: 0,
    currentMapIndex: 0,
    vetos: draft.vetos,
    maps: draft.maps,
    isComplete: false,
    winner: null
  };
}

/**
 * Simulates a single Valorant map score realistically.
 * @param {Object} team1 
 * @param {Object} team2 
 * @returns {Object} { team1Score, team2Score, winner }
 */
function simulateSingleMapScore(team1, team2) {
  const r1 = (team1 && typeof team1.rating === 'number') ? team1.rating : 1000;
  const r2 = (team2 && typeof team2.rating === 'number') ? team2.rating : 1000;

  const winProb = 0.5 + (r1 - r2) * 0.001;
  const isTeam1Win = Math.random() < Math.max(0.2, Math.min(0.8, winProb));

  // Determine if match goes into Overtime (15% chance)
  const isOvertime = Math.random() < 0.15;

  let winnerScore, loserScore;
  if (isOvertime) {
    const otRounds = Math.floor(Math.random() * 3) + 1; // 1 to 3 OT pairs
    winnerScore = 12 + (otRounds * 2);
    loserScore = winnerScore - 2;
  } else {
    winnerScore = 13;
    loserScore = Math.floor(Math.random() * 12); // 0 to 11
  }

  const team1Score = isTeam1Win ? winnerScore : loserScore;
  const team2Score = isTeam1Win ? loserScore : winnerScore;
  const winner = isTeam1Win ? team1 : team2;

  return { team1Score, team2Score, winner };
}

/**
 * Simulates the next map in the BO5 Grand Final.
 * @param {Object} gfState 
 * @returns {Object} Updated gfState
 */
export function simulateNextGrandFinalMap(gfState) {
  const gf = { ...gfState, maps: [...gfState.maps] };

  if (gf.isComplete || gf.currentMapIndex >= 5) {
    return gf;
  }

  const mapIndex = gf.currentMapIndex;
  const mapData = { ...gf.maps[mapIndex] };

  const result = simulateSingleMapScore(gf.team1, gf.team2);
  mapData.team1Score = result.team1Score;
  mapData.team2Score = result.team2Score;
  mapData.winner = result.winner;
  mapData.played = true;

  gf.maps[mapIndex] = mapData;

  if (result.winner.id === gf.team1.id) {
    gf.team1MapsWon++;
  } else {
    gf.team2MapsWon++;
  }

  gf.currentMapIndex++;

  // BO5: First to 3 maps wins!
  if (gf.team1MapsWon === 3) {
    gf.isComplete = true;
    gf.winner = gf.team1;
  } else if (gf.team2MapsWon === 3) {
    gf.isComplete = true;
    gf.winner = gf.team2;
  }

  return gf;
}

/**
 * Simulates all remaining maps until BO5 completes (first to 3 maps).
 * @param {Object} gfState 
 * @returns {Object} Updated gfState
 */
export function simulateEntireGrandFinal(gfState) {
  let currentGF = gfState;
  while (!currentGF.isComplete && currentGF.currentMapIndex < 5) {
    currentGF = simulateNextGrandFinalMap(currentGF);
  }
  return currentGF;
}
