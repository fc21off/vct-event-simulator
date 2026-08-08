import { simulateMatch } from './match.js';

/**
 * Initializes a GSL group.
 * @param {string} name 
 * @param {Array} teams 
 * @returns {Object} Initial GSL group state
 */
export function createGSLGroup(name, teams) {
  return {
    name,
    teams,
    phase: 'opening', // 'opening' -> 'winners_elim' -> 'decider' -> 'complete'
    matches: {
      opening1: null,
      opening2: null,
      winners: null,
      elimination: null,
      decider: null
    },
    results: {
      first: null,
      second: null,
      third: null,
      fourth: null
    }
  };
}

/**
 * Simulates the next phase of a GSL group.
 * @param {Object} group 
 * @returns {Object} Result containing updated group and event info
 */
export function simulateGSLStep(group) {
  const newGroup = { ...group };
  let newMatches = [];
  
  switch(newGroup.phase) {
    case 'opening':
      newGroup.matches.opening1 = simulateMatch(newGroup.teams[0], newGroup.teams[3], 3);
      newGroup.matches.opening2 = simulateMatch(newGroup.teams[1], newGroup.teams[2], 3);
      newGroup.phase = 'winners_elim';
      newMatches = [newGroup.matches.opening1, newGroup.matches.opening2];
      break;
    case 'winners_elim':
      newGroup.matches.winners = simulateMatch(
        newGroup.matches.opening1.winner,
        newGroup.matches.opening2.winner,
        3
      );
      newGroup.matches.elimination = simulateMatch(
        newGroup.matches.opening1.loser,
        newGroup.matches.opening2.loser,
        3
      );
      newGroup.results.first = newGroup.matches.winners.winner;
      newGroup.results.fourth = newGroup.matches.elimination.loser;
      newGroup.phase = 'decider';
      newMatches = [newGroup.matches.winners, newGroup.matches.elimination];
      break;
    case 'decider':
      newGroup.matches.decider = simulateMatch(
        newGroup.matches.winners.loser,
        newGroup.matches.elimination.winner,
        3
      );
      newGroup.results.second = newGroup.matches.decider.winner;
      newGroup.results.third = newGroup.matches.decider.loser;
      newGroup.phase = 'complete';
      newMatches = [newGroup.matches.decider];
      break;
  }
  
  return { tournament: newGroup, event: { type: 'gsl_step', data: { phase: group.phase, matches: newMatches } } };
}

/**
 * Checks if GSL group is complete.
 * @param {Object} group 
 * @returns {boolean}
 */
export function isGSLComplete(group) {
  return group.phase === 'complete';
}

/**
 * Gets final GSL standings.
 * @param {Object} group 
 * @returns {Array} Ordered array of teams
 */
export function getGSLStandings(group) {
  return [group.results.first, group.results.second, group.results.third, group.results.fourth];
}
