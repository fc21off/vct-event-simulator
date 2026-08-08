/**
 * Simulates a single map.
 * @param {Object} team1 
 * @param {Object} team2 
 * @returns {Object} The winning team
 */
function simulateMap(team1, team2) {
  // 50/50 chance, simple random
  return Math.random() < 0.5 ? team1 : team2;
}

/**
 * Simulates a Bo3 or Bo5 series.
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
    const mapWinner = simulateMap(team1, team2);
    if (mapWinner === team1) team1Maps++; else team2Maps++;
    maps.push({ mapNumber: maps.length + 1, winner: mapWinner });
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
