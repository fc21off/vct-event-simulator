import { simulateMatch } from './match.js';
import { createGrandFinalMatch, simulateEntireGrandFinal } from './grandFinals.js';
import { getRandomHostCity } from '../data/cities.js';

/**
 * Validates the custom node graph topology.
 * @param {Array} nodes 
 * @param {Array} connections 
 * @param {number} [expectedTeamCount]
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateSandboxGraph(nodes, connections, expectedTeamCount) {
  const gameboxes = nodes.filter(n => n.type === 'gamebox');
  if (gameboxes.length === 0) {
    return { isValid: false, error: 'Add at least 1 Gamebox to your bracket!' };
  }

  const championNodes = nodes.filter(n => n.type === 'champion');
  if (championNodes.length !== 1) {
    return { isValid: false, error: 'Your bracket must contain exactly 1 Champion Box!' };
  }

  const teamboxes = nodes.filter(n => n.type === 'teambox');
  if (teamboxes.length === 0) {
    return { isValid: false, error: 'Add Team Box nodes (SEED 1, SEED 2, ...) to seed your bracket!' };
  }

  if (expectedTeamCount && teamboxes.length !== expectedTeamCount) {
    return { 
      isValid: false, 
      error: `Your bracket has ${teamboxes.length} Team Box(es), but the bracket is set up for ${expectedTeamCount} Teams!\n\nPlease match the number of Team Boxes to ${expectedTeamCount}.` 
    };
  }

  // Verify each Team Box is connected to a Gamebox input
  for (const tb of teamboxes) {
    const conn = connections.find(c => c.fromNodeId === tb.id);
    if (!conn) {
      return { isValid: false, error: `Team Box "${tb.label || ('SEED #' + tb.seedIndex)}" is not connected to any Gamebox input!` };
    }
  }

  // Check every Gamebox
  for (const gb of gameboxes) {
    const in1 = connections.find(c => c.toNodeId === gb.id && c.toPort === 'in1');
    const in2 = connections.find(c => c.toNodeId === gb.id && c.toPort === 'in2');

    const hasIn1 = in1 || gb.blockedIn1;
    const hasIn2 = in2 || gb.blockedIn2;

    if (!hasIn1 || !hasIn2) {
      return { isValid: false, error: `Gamebox "${gb.label || gb.id}" needs 2 input connections (from Team Boxes or other Gameboxes)!` };
    }

    const winConn = connections.find(c => c.fromNodeId === gb.id && c.fromPort === 'winner');
    if (!winConn) {
      return { isValid: false, error: `Gamebox "${gb.label || gb.id}" is missing a Green Winner Path!` };
    }

    const loseConn = connections.find(c => c.fromNodeId === gb.id && c.fromPort === 'loser');
    if (!loseConn) {
      return { isValid: false, error: `Gamebox "${gb.label || gb.id}" is missing a Red Loser Path (or Elimination X)!` };
    }
  }

  return { isValid: true };
}

/**
 * Creates a tournament instance for a custom sandbox event.
 * @param {Object} customEvent 
 * @param {Array} teams 
 * @returns {Object} Tournament state
 */
export function createSandboxTournament(customEvent, teams) {
  const hostCity = getRandomHostCity('masters');

  // Clone nodes & setup runtime state
  const nodes = customEvent.nodes.map(n => ({
    ...n,
    played: false,
    winner: null,
    loser: null,
    team1: n.blockedIn1 ? n.blockedIn1Team : null,
    team2: n.blockedIn2 ? n.blockedIn2Team : null,
    team1Score: null,
    team2Score: null
  }));

  // Map Team Boxes (SEED 1, SEED 2...) to input teams
  const teamboxes = nodes
    .filter(n => n.type === 'teambox')
    .sort((a, b) => (a.seedIndex || 0) - (b.seedIndex || 0));

  teamboxes.forEach((tb, idx) => {
    const teamObj = teams[idx];
    if (teamObj) {
      const conn = (customEvent.connections || []).find(c => c.fromNodeId === tb.id);
      if (conn) {
        const targetNode = nodes.find(n => n.id === conn.toNodeId);
        if (targetNode) {
          if (conn.toPort === 'in1') targetNode.team1 = teamObj;
          else if (conn.toPort === 'in2') targetNode.team2 = teamObj;
        }
      }
    }
  });

  return {
    type: 'sandbox',
    stage: 'sandbox',
    viewingStage: 'sandbox',
    customEvent,
    name: customEvent.name,
    hostCity,
    nodes,
    connections: customEvent.connections,
    completed: false,
    champion: null,
    history: []
  };
}

/**
 * Simulates the next playable match in topological order.
 * @param {Object} tournament 
 * @returns {Object} { tournament, step }
 */
export function simulateNextStep(tournament) {
  if (tournament.completed) {
    tournament.stage = 'complete';
    return { tournament, step: null };
  }

  const playableNode = tournament.nodes.find(n => {
    if (n.type !== 'gamebox' || n.played) return false;
    return n.team1 && n.team2;
  });

  if (!playableNode) {
    checkTournamentCompletion(tournament);
    return { tournament, step: null };
  }

  if (playableNode.isGrandFinal) {
    const gfMatch = createGrandFinalMatch(playableNode.team1, playableNode.team2);
    simulateEntireGrandFinal(gfMatch);

    playableNode.played = true;
    playableNode.winner = gfMatch.winner;
    playableNode.loser = gfMatch.loser;
    playableNode.team1Score = gfMatch.team1MapsWon;
    playableNode.team2Score = gfMatch.team2MapsWon;
    playableNode.grandFinalState = gfMatch;

    propagateResult(tournament, playableNode);
    checkTournamentCompletion(tournament);

    return { tournament, step: { node: playableNode, matchResult: gfMatch } };
  } else {
    const match = simulateMatch(playableNode.team1, playableNode.team2);
    playableNode.played = true;
    playableNode.winner = match.winner;
    playableNode.loser = match.loser;
    playableNode.team1Score = match.team1Score;
    playableNode.team2Score = match.team2Score;
    playableNode.maps = match.maps;

    propagateResult(tournament, playableNode);
    checkTournamentCompletion(tournament);

    return { tournament, step: { node: playableNode, matchResult: match } };
  }
}

/**
 * Simulates all remaining unplayed matches in order.
 * @param {Object} tournament 
 * @returns {Object} { tournament }
 */
export function simulateAll(tournament) {
  let res = null;
  let safety = 0;
  do {
    res = simulateNextStep(tournament);
    safety++;
  } while (res && res.step !== null && safety < 100);

  if (tournament.champion) {
    tournament.completed = true;
    tournament.stage = 'complete';
  }
  return { tournament };
}

function propagateResult(tournament, node) {
  // Winner path propagation
  const winConn = tournament.connections.find(c => c.fromNodeId === node.id && c.fromPort === 'winner');
  if (winConn) {
    const targetNode = tournament.nodes.find(n => n.id === winConn.toNodeId);
    if (targetNode) {
      if (targetNode.type === 'gamebox') {
        if (winConn.toPort === 'in1') targetNode.team1 = node.winner;
        else if (winConn.toPort === 'in2') targetNode.team2 = node.winner;
      } else if (targetNode.type === 'champion') {
        tournament.champion = node.winner;
        tournament.completed = true;
        tournament.stage = 'complete';
      }
    }
  }

  // Loser path propagation
  const loseConn = tournament.connections.find(c => c.fromNodeId === node.id && c.fromPort === 'loser');
  if (loseConn) {
    const targetNode = tournament.nodes.find(n => n.id === loseConn.toNodeId);
    if (targetNode) {
      if (targetNode.type === 'gamebox') {
        if (loseConn.toPort === 'in1') targetNode.team1 = node.loser;
        else if (loseConn.toPort === 'in2') targetNode.team2 = node.loser;
      }
    }
  }
}

function checkTournamentCompletion(tournament) {
  const champNode = tournament.nodes.find(n => n.type === 'champion');
  if (champNode) {
    const conn = tournament.connections.find(c => c.toNodeId === champNode.id);
    if (conn) {
      const parent = tournament.nodes.find(n => n.id === conn.fromNodeId);
      if (parent && parent.played) {
        tournament.champion = parent.winner;
        tournament.completed = true;
        tournament.stage = 'complete';
      }
    }
  }
}
