import { simulateMatch } from './match.js';
import { createGrandFinalMatch, simulateEntireGrandFinal } from './grandFinals.js';

/**
 * Initializes a Double-Elimination bracket with pre-populated R1 teams.
 * @param {Array} teams 
 * @param {Object} config 
 * @returns {Object}
 */
export function createBracket(teams, config = {}) {
  const size = teams.length;
  const bracket = {
    teams,
    size,
    upper: [],
    lower: [],
    grandFinal: null,
    champion: null,
    currentPhase: null,
    roundOrder: [],
    currentRoundIndex: 0
  };
  
  if (size === 4) {
    bracket.upper = [
      { id: 'upper_r1', name: 'UB Semifinal', matches: [
        { team1: teams[0], team2: teams[3], played: false, winner: null },
        { team1: teams[1], team2: teams[2], played: false, winner: null }
      ] },
      { id: 'upper_r2', name: 'UB Final', matches: [null] }
    ];
    bracket.lower = [
      { id: 'lower_r1', name: 'LB Round 1', matches: [null] },
      { id: 'lower_r2', name: 'LB Final', matches: [null] }
    ];
    bracket.roundOrder = ['upper_r1', 'upper_r2', 'lower_r1', 'lower_r2', 'grand_final'];
  } else if (size === 8) {
    bracket.upper = [
      { id: 'upper_r1', name: 'UB Quarterfinal', matches: [
        { team1: teams[0], team2: teams[7], played: false, winner: null },
        { team1: teams[3], team2: teams[4], played: false, winner: null },
        { team1: teams[1], team2: teams[6], played: false, winner: null },
        { team1: teams[2], team2: teams[5], played: false, winner: null }
      ] },
      { id: 'upper_r2', name: 'UB Semifinal', matches: [null, null] },
      { id: 'upper_r3', name: 'UB Final', matches: [null] }
    ];
    bracket.lower = [
      { id: 'lower_r1', name: 'LB Round 1', matches: [null, null] },
      { id: 'lower_r2', name: 'LB Round 2', matches: [null, null] },
      { id: 'lower_r3', name: 'LB Round 3', matches: [null] },
      { id: 'lower_r4', name: 'LB Final', matches: [null] }
    ];
    bracket.roundOrder = ['upper_r1', 'upper_r2', 'lower_r1', 'lower_r2', 'upper_r3', 'lower_r3', 'lower_r4', 'grand_final'];
  }

  if (bracket.roundOrder.length > 0) {
    bracket.currentPhase = bracket.roundOrder[0];
  }

  return bracket;
}

function getMatch(bracket, phaseId, matchIndex) {
  if (phaseId.startsWith('upper')) {
    const round = bracket.upper.find(r => r.id === phaseId);
    return round ? round.matches[matchIndex] : null;
  } else if (phaseId.startsWith('lower')) {
    const round = bracket.lower.find(r => r.id === phaseId);
    return round ? round.matches[matchIndex] : null;
  }
  return null;
}

function setMatch(bracket, phaseId, matchIndex, matchResult) {
  if (phaseId.startsWith('upper')) {
    const round = bracket.upper.find(r => r.id === phaseId);
    if (round) round.matches[matchIndex] = matchResult;
  } else if (phaseId.startsWith('lower')) {
    const round = bracket.lower.find(r => r.id === phaseId);
    if (round) round.matches[matchIndex] = matchResult;
  }
}

/**
 * Simulates next bracket round and pre-populates upcoming matches.
 * @param {Object} bracket 
 * @returns {Object} Updated bracket and event info
 */
export function simulateBracketRound(bracket) {
  const b = { ...bracket };
  const phase = b.currentPhase;
  let newMatches = [];
  
  if (b.size === 4) {
    if (phase === 'upper_r1') {
      const ur1_0 = getMatch(b, 'upper_r1', 0);
      const ur1_1 = getMatch(b, 'upper_r1', 1);
      const m1 = simulateMatch(ur1_0.team1, ur1_0.team2, 3);
      const m2 = simulateMatch(ur1_1.team1, ur1_1.team2, 3);
      setMatch(b, phase, 0, m1); setMatch(b, phase, 1, m2);
      newMatches = [m1, m2];

      // Pre-populate Upper Final & LB Round 1
      setMatch(b, 'upper_r2', 0, { team1: m1.winner, team2: m2.winner, played: false, winner: null });
      setMatch(b, 'lower_r1', 0, { team1: m1.loser, team2: m2.loser, played: false, winner: null });
    } else if (phase === 'upper_r2') {
      const ur2_0 = getMatch(b, 'upper_r2', 0);
      const m = simulateMatch(ur2_0.team1, ur2_0.team2, 3);
      setMatch(b, phase, 0, m);
      newMatches = [m];

      // Pre-populate LB Final top team
      const lr1 = getMatch(b, 'lower_r1', 0);
      setMatch(b, 'lower_r2', 0, { team1: m.loser, team2: lr1 ? lr1.winner : null, played: false, winner: null });
    } else if (phase === 'lower_r1') {
      const lr1_0 = getMatch(b, 'lower_r1', 0);
      const m = simulateMatch(lr1_0.team1, lr1_0.team2, 3);
      setMatch(b, phase, 0, m);
      newMatches = [m];

      // Pre-populate LB Final bottom team
      const ur2 = getMatch(b, 'upper_r2', 0);
      setMatch(b, 'lower_r2', 0, { team1: ur2 ? ur2.loser : null, team2: m.winner, played: false, winner: null });
    } else if (phase === 'lower_r2') { // LB Final
      const lr2_0 = getMatch(b, 'lower_r2', 0);
      const m = simulateMatch(lr2_0.team1, lr2_0.team2, 5); // Bo5
      setMatch(b, phase, 0, m);
      newMatches = [m];

      const ubWinner = getMatch(b, 'upper_r2', 0).winner;
      b.grandFinal = {
        id: 'grand_final_match',
        team1: ubWinner,
        team2: m.winner,
        played: false,
        winner: null
      };
    } else if (phase === 'grand_final') {
      const t1 = b.grandFinal ? b.grandFinal.team1 : getMatch(b, 'upper_r2', 0).winner;
      const t2 = b.grandFinal ? b.grandFinal.team2 : getMatch(b, 'lower_r2', 0).winner;
      const gfState = createGrandFinalMatch(t1, t2);
      const finalGfState = simulateEntireGrandFinal(gfState);
      b.grandFinalState = finalGfState;
      b.grandFinal = {
        id: 'grand_final_match',
        team1: t1,
        team2: t2,
        team1Score: finalGfState.team1MapsWon,
        team2Score: finalGfState.team2MapsWon,
        winner: finalGfState.winner,
        played: true
      };
      b.champion = finalGfState.winner;
      newMatches = [b.grandFinal];
    }
  } else if (b.size === 8) {
    if (phase === 'upper_r1') {
      const ur1_0 = getMatch(b, 'upper_r1', 0);
      const ur1_1 = getMatch(b, 'upper_r1', 1);
      const ur1_2 = getMatch(b, 'upper_r1', 2);
      const ur1_3 = getMatch(b, 'upper_r1', 3);

      const m1 = simulateMatch(ur1_0.team1, ur1_0.team2, 3);
      const m2 = simulateMatch(ur1_1.team1, ur1_1.team2, 3);
      const m3 = simulateMatch(ur1_2.team1, ur1_2.team2, 3);
      const m4 = simulateMatch(ur1_3.team1, ur1_3.team2, 3);

      setMatch(b, phase, 0, m1); setMatch(b, phase, 1, m2);
      setMatch(b, phase, 2, m3); setMatch(b, phase, 3, m4);
      newMatches = [m1, m2, m3, m4];

      // Pre-populate Upper Semifinals & Lower Round 1
      setMatch(b, 'upper_r2', 0, { team1: m1.winner, team2: m2.winner, played: false, winner: null });
      setMatch(b, 'upper_r2', 1, { team1: m3.winner, team2: m4.winner, played: false, winner: null });

      setMatch(b, 'lower_r1', 0, { team1: m1.loser, team2: m2.loser, played: false, winner: null });
      setMatch(b, 'lower_r1', 1, { team1: m3.loser, team2: m4.loser, played: false, winner: null });

    } else if (phase === 'upper_r2') { // Upper Semifinals
      const ur2_0 = getMatch(b, 'upper_r2', 0);
      const ur2_1 = getMatch(b, 'upper_r2', 1);

      const m1 = simulateMatch(ur2_0.team1, ur2_0.team2, 3);
      const m2 = simulateMatch(ur2_1.team1, ur2_1.team2, 3);
      setMatch(b, phase, 0, m1); setMatch(b, phase, 1, m2);
      newMatches = [m1, m2];

      // Pre-populate Upper Final
      setMatch(b, 'upper_r3', 0, { team1: m1.winner, team2: m2.winner, played: false, winner: null });

      // Pre-populate Lower Round 2 (Cross Drop: Upper SF1 loser drops to LB R2 Match 1, Upper SF2 loser drops to LB R2 Match 0)
      const lr1_0 = getMatch(b, 'lower_r1', 0);
      const lr1_1 = getMatch(b, 'lower_r1', 1);

      setMatch(b, 'lower_r2', 0, { team1: m2.loser, team2: lr1_0 ? lr1_0.winner : null, played: false, winner: null });
      setMatch(b, 'lower_r2', 1, { team1: m1.loser, team2: lr1_1 ? lr1_1.winner : null, played: false, winner: null });

    } else if (phase === 'lower_r1') { // Lower Round 1
      const lr1_0 = getMatch(b, 'lower_r1', 0);
      const lr1_1 = getMatch(b, 'lower_r1', 1);

      const m1 = simulateMatch(lr1_0.team1, lr1_0.team2, 3);
      const m2 = simulateMatch(lr1_1.team1, lr1_1.team2, 3);
      setMatch(b, phase, 0, m1); setMatch(b, phase, 1, m2);
      newMatches = [m1, m2];

      // Update Lower Round 2 match opponents
      const ur2_0 = getMatch(b, 'upper_r2', 0);
      const ur2_1 = getMatch(b, 'upper_r2', 1);

      const lr2_0 = getMatch(b, 'lower_r2', 0);
      const lr2_1 = getMatch(b, 'lower_r2', 1);

      setMatch(b, 'lower_r2', 0, { team1: ur2_1 ? ur2_1.loser : (lr2_0 ? lr2_0.team1 : null), team2: m1.winner, played: false, winner: null });
      setMatch(b, 'lower_r2', 1, { team1: ur2_0 ? ur2_0.loser : (lr2_1 ? lr2_1.team1 : null), team2: m2.winner, played: false, winner: null });

    } else if (phase === 'lower_r2') { // Lower Round 2
      const lr2_0 = getMatch(b, 'lower_r2', 0);
      const lr2_1 = getMatch(b, 'lower_r2', 1);

      const m1 = simulateMatch(lr2_0.team1, lr2_0.team2, 3);
      const m2 = simulateMatch(lr2_1.team1, lr2_1.team2, 3);
      setMatch(b, phase, 0, m1); setMatch(b, phase, 1, m2);
      newMatches = [m1, m2];

      // Pre-populate Lower Semifinal
      setMatch(b, 'lower_r3', 0, { team1: m1.winner, team2: m2.winner, played: false, winner: null });

    } else if (phase === 'upper_r3') { // UB Final
      const ur3_0 = getMatch(b, 'upper_r3', 0);
      const m1 = simulateMatch(ur3_0.team1, ur3_0.team2, 3);
      setMatch(b, phase, 0, m1);
      newMatches = [m1];

      // Pre-populate Lower Final top team
      const lr3 = getMatch(b, 'lower_r3', 0);
      setMatch(b, 'lower_r4', 0, { team1: m1.loser, team2: lr3 ? lr3.winner : null, played: false, winner: null });

    } else if (phase === 'lower_r3') { // Lower Semifinal
      const lr3_0 = getMatch(b, 'lower_r3', 0);
      const m1 = simulateMatch(lr3_0.team1, lr3_0.team2, 3);
      setMatch(b, phase, 0, m1);
      newMatches = [m1];

      // Pre-populate Lower Final bottom team
      const ur3 = getMatch(b, 'upper_r3', 0);
      setMatch(b, 'lower_r4', 0, { team1: ur3 ? ur3.loser : null, team2: m1.winner, played: false, winner: null });

    } else if (phase === 'lower_r4') { // LB Final
      const lr4_0 = getMatch(b, 'lower_r4', 0);
      const m1 = simulateMatch(lr4_0.team1, lr4_0.team2, 5); // Bo5
      setMatch(b, phase, 0, m1);
      newMatches = [m1];

      // Pre-populate Grand Final match with UB Winner vs LB Winner
      const ubWinner = getMatch(b, 'upper_r3', 0).winner;
      const lbWinner = m1.winner;
      b.grandFinal = {
        id: 'grand_final_match',
        team1: ubWinner,
        team2: lbWinner,
        played: false,
        winner: null
      };
    } else if (phase === 'grand_final') {
      const t1 = b.grandFinal ? b.grandFinal.team1 : getMatch(b, 'upper_r3', 0).winner;
      const t2 = b.grandFinal ? b.grandFinal.team2 : getMatch(b, 'lower_r4', 0).winner;
      const gfState = createGrandFinalMatch(t1, t2);
      const finalGfState = simulateEntireGrandFinal(gfState);
      b.grandFinalState = finalGfState;
      b.grandFinal = {
        id: 'grand_final_match',
        team1: t1,
        team2: t2,
        team1Score: finalGfState.team1MapsWon,
        team2Score: finalGfState.team2MapsWon,
        winner: finalGfState.winner,
        played: true
      };
      b.champion = finalGfState.winner;
      newMatches = [b.grandFinal];
    }
  }

  b.currentRoundIndex++;
  if (b.currentRoundIndex < b.roundOrder.length) {
    b.currentPhase = b.roundOrder[b.currentRoundIndex];
  } else {
    b.currentPhase = null;
  }

  return { tournament: b, event: { type: 'bracket_round', data: { phase, matches: newMatches } } };
}

/**
 * Checks if Bracket is complete.
 * @param {Object} bracket 
 * @returns {boolean}
 */
export function isBracketComplete(bracket) {
  return bracket.champion !== null;
}

/**
 * Gets name of the current round.
 * @param {Object} bracket 
 * @returns {string}
 */
export function getBracketRoundName(bracket) {
  if (!bracket.currentPhase) return 'Complete';
  if (bracket.currentPhase === 'grand_final') return 'Grand Final';
  
  if (bracket.currentPhase.startsWith('upper')) {
    const round = bracket.upper.find(r => r.id === bracket.currentPhase);
    return round ? round.name : bracket.currentPhase;
  } else {
    const round = bracket.lower.find(r => r.id === bracket.currentPhase);
    return round ? round.name : bracket.currentPhase;
  }
}
