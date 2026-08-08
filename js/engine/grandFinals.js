import { generateGrandFinalDraft } from '../data/maps.js';
import { simulateMapScore } from './match.js';

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
 * Simulates the next map in the BO5 Grand Final using Elo win probability and realistic score distributions.
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

  const result = simulateMapScore(gf.team1, gf.team2);
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
 * Simulates all remaining maps in the Grand Final until a champion is crowned.
 * @param {Object} gfState 
 * @returns {Object} Final gfState
 */
export function simulateEntireGrandFinal(gfState) {
  let currentGf = gfState;
  while (!currentGf.isComplete && currentGf.currentMapIndex < 5) {
    currentGf = simulateNextGrandFinalMap(currentGf);
  }
  return currentGf;
}
