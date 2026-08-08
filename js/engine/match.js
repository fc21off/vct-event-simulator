import { getTeamRating } from '../data/ratings.js';

/**
 * Calculates win probability for Team 1 vs Team 2 based on Elo rating delta.
 * Uses standard Elo win probability formula: P(T1) = 1 / (1 + 10^((Elo2 - Elo1) / 400))
 * @param {Object} team1 
 * @param {Object} team2 
 * @returns {number} Probability between 0.0 and 1.0
 */
export function calculateWinProbability(team1, team2) {
  const r1 = getTeamRating(team1);
  const r2 = getTeamRating(team2);
  return 1 / (1 + Math.pow(10, (r2 - r1) / 400));
}

/**
 * Simulates a single map realistically using team Elo ratings and round distributions.
 * @param {Object} team1 
 * @param {Object} team2 
 * @returns {Object} { winner, loser, team1Score, team2Score }
 */
export function simulateMapScore(team1, team2) {
  const prob1 = calculateWinProbability(team1, team2);
  const isTeam1Win = Math.random() < prob1;
  const winner = isTeam1Win ? team1 : team2;
  const loser = isTeam1Win ? team1 : team2;

  const r1 = getTeamRating(team1);
  const r2 = getTeamRating(team2);
  const ratingDiff = Math.abs(r1 - r2);

  // Expectation of loser rounds based on rating gap
  // Close rating gap (e.g. 10 points diff) -> base loser rounds ~9-10
  // Large rating gap (e.g. 300 points diff) -> base loser rounds ~5
  let baseLoserRounds = Math.max(4, 10 - Math.floor(ratingDiff / 65));

  // Add random variance (-3 to +2)
  const roll = Math.random();
  let variance = 0;
  if (roll < 0.15) variance = -3;
  else if (roll < 0.35) variance = -2;
  else if (roll < 0.55) variance = -1;
  else if (roll < 0.75) variance = 0;
  else if (roll < 0.90) variance = 1;
  else variance = 2;

  let loserRounds = baseLoserRounds + variance;

  // Suppress 13-0 or 13-1 blowouts (less than 2% chance overall)
  if (loserRounds < 2) {
    if (Math.random() > 0.08) {
      loserRounds = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    }
  }

  // Handle Overtime (14-12, 16-14) or close 13-11 matches
  let winnerRounds = 13;
  if (loserRounds >= 12) {
    const otPairs = Math.random() < 0.8 ? 1 : (Math.random() < 0.85 ? 2 : 3);
    winnerRounds = 12 + (otPairs * 2);
    loserRounds = winnerRounds - 2;
  } else {
    loserRounds = Math.min(11, Math.max(0, loserRounds));
  }

  const team1Score = isTeam1Win ? winnerRounds : loserRounds;
  const team2Score = isTeam1Win ? loserRounds : winnerRounds;

  return {
    winner,
    loser,
    team1Score,
    team2Score
  };
}

/**
 * Simulates a Bo3 or Bo5 series based on team Elo ratings and realistic map scores.
 * @param {Object} team1 
 * @param {Object} team2 
 * @param {number} bestOf 
 * @returns {Object} Match result
 */
export function simulateMatch(team1, team2, bestOf = 3) {
  const mapsToWin = Math.ceil(bestOf / 2); // 2 for Bo3, 3 for Bo5
  let team1Maps = 0, team2Maps = 0;
  const maps = [];
  
  while (team1Maps < mapsToWin && team2Maps < mapsToWin) {
    const mapResult = simulateMapScore(team1, team2);
    if (mapResult.winner.id === team1.id) {
      team1Maps++;
    } else {
      team2Maps++;
    }
    maps.push({
      mapNumber: maps.length + 1,
      winner: mapResult.winner,
      team1Score: mapResult.team1Score,
      team2Score: mapResult.team2Score
    });
  }
  
  const winner = team1Maps > team2Maps ? team1 : team2;
  const loser = winner === team1 ? team2 : team1;
  
  return {
    team1, team2,
    winner, loser,
    score: `${team1Maps}-${team2Maps}`,
    team1Score: team1Maps,
    team2Score: team2Maps,
    maps,
    bestOf
  };
}
