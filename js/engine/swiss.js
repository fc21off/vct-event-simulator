import { simulateMatch } from './match.js';

/**
 * Initializes a Swiss stage.
 * @param {Array} teams 
 * @returns {Object} Initial Swiss state
 */
export function createSwissStage(teams) {
  return {
    teams: teams.map(t => ({ ...t, wins: 0, losses: 0, status: 'active' })),
    rounds: [],
    qualified: [],   // teams with 2 wins
    eliminated: [],  // teams with 2 losses
    currentRound: 0,
    matchHistory: []  // track past opponents to avoid rematches (pairs of ids)
  };
}

/**
 * Determines pairings for the next Swiss round.
 * - Round 1 (0-0): NO REGIONAL MATCHUPS ALLOWED (t1.region !== t2.region). Randomly drawn.
 * - Rounds 2 & 3 (1-0, 0-1, 1-1): NO REMATCHES ALLOWED (!hasPlayed(t1, t2)). Regional matches allowed. Randomly drawn.
 * @param {Object} state 
 * @returns {Array} Array of [team1, team2] pairs
 */
export function getSwissRoundMatchups(state) {
  const activeTeams = state.teams.filter(t => t.status === 'active');
  const matchups = [];

  const hasPlayed = (t1, t2) => {
    return state.matchHistory.some(pair => 
      (pair[0] === t1.id && pair[1] === t2.id) || 
      (pair[0] === t2.id && pair[1] === t1.id)
    );
  };

  /**
   * Random pairing solver with backtracking/retry logic to satisfy constraints.
   * @param {Array} teamList 
   * @param {Function} isValidPair 
   * @returns {Array} Array of [team1, team2] pairs
   */
  const solvePairings = (teamList, isValidPair) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      let pool = [...teamList].sort(() => 0.5 - Math.random());
      let pairs = [];
      let valid = true;

      while (pool.length >= 2) {
        let t1 = pool.shift();
        let candidates = pool.filter(t2 => isValidPair(t1, t2));
        if (candidates.length === 0) {
          valid = false;
          break;
        }
        let t2 = candidates[Math.floor(Math.random() * candidates.length)];
        let t2Index = pool.indexOf(t2);
        pool.splice(t2Index, 1);
        pairs.push([t1, t2]);
      }

      if (valid && pool.length === 0) {
        return pairs;
      }
    }

    // Fallback if constraint solver exhausted (safety guarantee)
    let fallbackPool = [...teamList].sort(() => 0.5 - Math.random());
    let pairs = [];
    while (fallbackPool.length >= 2) {
      pairs.push([fallbackPool.shift(), fallbackPool.shift()]);
    }
    return pairs;
  };

  if (state.currentRound === 0) {
    // ROUND 1 (0-0): NO REGIONAL MATCHUPS ALLOWED!
    return solvePairings(activeTeams, (t1, t2) => t1.region !== t2.region);
  }

  // ROUND 2 (HIGH 1-0 MATCHES): NO REMATCHES ALLOWED!
  const highTeams = activeTeams.filter(t => t.wins === 1 && t.losses === 0);
  if (highTeams.length > 0) {
    const highPairs = solvePairings(highTeams, (t1, t2) => !hasPlayed(t1, t2));
    matchups.push(...highPairs);
  }

  // ROUND 2 (LOW 0-1 MATCHES): NO REMATCHES ALLOWED!
  const lowTeams = activeTeams.filter(t => t.wins === 0 && t.losses === 1);
  if (lowTeams.length > 0) {
    const lowPairs = solvePairings(lowTeams, (t1, t2) => !hasPlayed(t1, t2));
    matchups.push(...lowPairs);
  }

  // ROUND 3 (DECIDERS 1-1 MATCHES): NO REMATCHES ALLOWED!
  const deciderTeams = activeTeams.filter(t => t.wins === 1 && t.losses === 1);
  if (deciderTeams.length > 0) {
    const deciderPairs = solvePairings(deciderTeams, (t1, t2) => !hasPlayed(t1, t2));
    matchups.push(...deciderPairs);
  }

  return matchups;
}

/**
 * Simulates a single Swiss round.
 * @param {Object} state 
 * @returns {Object} Result containing updated state and round info
 */
export function simulateSwissRound(state) {
  const matchups = getSwissRoundMatchups(state);
  const roundMatches = matchups.map(([t1, t2]) => simulateMatch(t1, t2, 3));
  
  const newState = { ...state };
  newState.currentRound += 1;
  
  roundMatches.forEach(match => {
    newState.matchHistory.push([match.team1.id, match.team2.id]);
    
    const wTeam = newState.teams.find(t => t.id === match.winner.id);
    const lTeam = newState.teams.find(t => t.id === match.loser.id);
    
    wTeam.wins += 1;
    lTeam.losses += 1;
    
    if (wTeam.wins === 2) {
      wTeam.status = 'qualified';
      newState.qualified.push(wTeam);
    }
    if (lTeam.losses === 2) {
      lTeam.status = 'eliminated';
      newState.eliminated.push(lTeam);
    }
  });

  const latestRound = {
    roundNum: newState.currentRound,
    matches: roundMatches
  };
  
  newState.rounds.push(latestRound);
  
  return { tournament: newState, event: { type: 'swiss_round', data: latestRound } };
}

/**
 * Checks if Swiss stage is complete.
 * @param {Object} state 
 * @returns {boolean}
 */
export function isSwissComplete(state) {
  return state.teams.filter(t => t.status === 'active').length === 0;
}

/**
 * Gets final/current Swiss standings.
 * @param {Object} state 
 * @returns {Array} Sorted teams
 */
export function getSwissStandings(state) {
  return [...state.qualified, ...state.eliminated].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}
