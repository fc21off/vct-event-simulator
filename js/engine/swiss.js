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
 * @param {Object} state 
 * @returns {Array} Array of [team1, team2] pairs
 */
export function getSwissRoundMatchups(state) {
  const activeTeams = state.teams.filter(t => t.status === 'active');
  const matchups = [];
  
  // Group by record (wins)
  const groups = {
    0: activeTeams.filter(t => t.wins === 0),
    1: activeTeams.filter(t => t.wins === 1)
  };

  const hasPlayed = (t1, t2) => {
    return state.matchHistory.some(pair => 
      (pair[0] === t1.id && pair[1] === t2.id) || 
      (pair[0] === t2.id && pair[1] === t1.id)
    );
  };

  const pairGroup = (group) => {
    let unassigned = [...group].sort(() => 0.5 - Math.random());
    while (unassigned.length >= 2) {
      let t1 = unassigned.shift();
      let t2Index = unassigned.findIndex(t => !hasPlayed(t1, t));
      
      if (t2Index === -1) t2Index = 0; // Fallback if all have played
      
      let t2 = unassigned.splice(t2Index, 1)[0];
      matchups.push([t1, t2]);
    }
  };

  // Pair High matches (1-0 record) FIRST so they sit at indices 0 & 1
  if (groups[1] && groups[1].length > 0) {
    pairGroup(groups[1]);
  }
  
  // Pair Low matches (0-1 record) SECOND so they sit at indices 2 & 3
  if (groups[0] && groups[0].length > 0) {
    pairGroup(groups[0]);
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
