import { simulateMatch } from './match.js';
import { createGrandFinalMatch, simulateEntireGrandFinal } from './grandFinals.js';
import { getRandomHostCity } from '../data/cities.js';

/**
 * Validates the custom node graph topology.
 * @param {Array} nodes 
 * @param {Array} connections 
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateSandboxGraph(nodes, connections) {
  const gameboxes = nodes.filter(n => n.type === 'gamebox');
  if (gameboxes.length === 0) {
    return { isValid: false, error: 'Add at least 1 Gamebox to your bracket!' };
  }

  const championNodes = nodes.filter(n => n.type === 'champion');
  if (championNodes.length !== 1) {
    return { isValid: false, error: 'Your bracket must contain exactly 1 Champion Box!' };
  }

  // Check every Gamebox
  for (const gb of gameboxes) {
    // Must have 2 incoming connections or blocked inputs
    const in1 = connections.find(c => c.toNodeId === gb.id && c.toPort === 'in1');
    const in2 = connections.find(c => c.toNodeId === gb.id && c.toPort === 'in2');

    const hasIn1 = in1 || gb.blockedIn1;
    const hasIn2 = in2 || gb.blockedIn2;

    if (!hasIn1 || !hasIn2) {
      return { isValid: false, error: `Gamebox "${gb.label || gb.id}" needs 2 input connections (or pre-set seeds/byes)!` };
    }

    // Must have Winner output connected
    const winConn = connections.find(c => c.fromNodeId === gb.id && c.fromPort === 'winner');
    if (!winConn) {
      return { isValid: false, error: `Gamebox "${gb.label || gb.id}" is missing a Green Winner Path!` };
    }

    // Must have Loser output connected
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

  // Distribute input teams into unblocked inputs of initial nodes
  const availableTeams = [...teams];
  const initialInputs = [];

  nodes.forEach(n => {
    if (n.type === 'gamebox') {
      if (!n.team1 && !customEvent.connections.some(c => c.toNodeId === n.id && c.toPort === 'in1')) {
        initialInputs.push({ nodeId: n.id, port: 'in1' });
      }
      if (!n.team2 && !customEvent.connections.some(c => c.toNodeId === n.id && c.toPort === 'in2')) {
        initialInputs.push({ nodeId: n.id, port: 'in2' });
      }
    }
  });

  // Assign selected teams to initial open inputs
  initialInputs.forEach(target => {
    if (availableTeams.length > 0) {
      const assigned = availableTeams.shift();
      const node = nodes.find(n => n.id === target.nodeId);
      if (node) {
        if (target.port === 'in1') node.team1 = assigned;
        else if (target.port === 'in2') node.team2 = assigned;
      }
    }
  });

  return {
    type: 'sandbox',
    eventId: customEvent.id,
    name: customEvent.name.toUpperCase(),
    hostCity,
    theme: customEvent.theme || 'champions',
    teams,
    stage: 'bracket',
    nodes,
    connections: customEvent.connections,
    champion: null,
    bracket: {
      theme: customEvent.theme || 'champions',
      champion: null,
      grandFinal: null
    }
  };
}

/**
 * Propagates match outcomes through connections.
 * @param {Object} t Tournament state
 */
function propagateResults(t) {
  t.nodes.forEach(n => {
    if (n.type === 'gamebox' && n.played) {
      // Winner connection
      const winConn = t.connections.find(c => c.fromNodeId === n.id && c.fromPort === 'winner');
      if (winConn) {
        const targetNode = t.nodes.find(target => target.id === winConn.toNodeId);
        if (targetNode) {
          if (targetNode.type === 'champion') {
            t.champion = n.winner;
            t.stage = 'complete';
            t.bracket.champion = n.winner;
          } else if (targetNode.type === 'gamebox') {
            if (winConn.toPort === 'in1') targetNode.team1 = n.winner;
            else if (winConn.toPort === 'in2') targetNode.team2 = n.winner;
          }
        }
      }

      // Loser connection
      const loseConn = t.connections.find(c => c.fromNodeId === n.id && c.fromPort === 'loser');
      if (loseConn) {
        const targetNode = t.nodes.find(target => target.id === loseConn.toNodeId);
        if (targetNode && targetNode.type === 'gamebox') {
          if (loseConn.toPort === 'in1') targetNode.team1 = n.loser;
          else if (loseConn.toPort === 'in2') targetNode.team2 = n.loser;
        }
      }
    }
  });
}

/**
 * Simulates next playable step in sandbox tournament.
 * @param {Object} tournament 
 * @returns {Object} { tournament, event }
 */
export function simulateNextStep(tournament) {
  const t = { ...tournament, nodes: tournament.nodes.map(n => ({ ...n })) };

  if (t.stage === 'complete') {
    return { tournament: t, event: { type: 'noop' } };
  }

  // Find next unplayed Gamebox that has both team1 and team2 ready
  const readyNode = t.nodes.find(n => n.type === 'gamebox' && !n.played && n.team1 && n.team2);

  if (readyNode) {
    if (readyNode.isGrandFinal) {
      const gfState = createGrandFinalMatch(readyNode.team1, readyNode.team2);
      const finalGf = simulateEntireGrandFinal(gfState);

      readyNode.played = true;
      readyNode.winner = finalGf.winner;
      readyNode.loser = finalGf.winner.id === readyNode.team1.id ? readyNode.team2 : readyNode.team1;
      readyNode.team1Score = finalGf.team1MapsWon;
      readyNode.team2Score = finalGf.team2MapsWon;

      t.grandFinalState = finalGf;
      t.bracket.grandFinalState = finalGf;
      t.bracket.grandFinal = {
        id: readyNode.id,
        team1: readyNode.team1,
        team2: readyNode.team2,
        team1Score: finalGf.team1MapsWon,
        team2Score: finalGf.team2MapsWon,
        winner: finalGf.winner,
        played: true
      };
    } else {
      const matchRes = simulateMatch(readyNode.team1, readyNode.team2, readyNode.bestOf || 3);
      readyNode.played = true;
      readyNode.winner = matchRes.winner;
      readyNode.loser = matchRes.loser;
      readyNode.team1Score = matchRes.team1Score;
      readyNode.team2Score = matchRes.team2Score;
    }

    propagateResults(t);
    return { tournament: t, event: { type: 'sandbox_match', data: readyNode } };
  }

  return { tournament: t, event: { type: 'noop' } };
}

/**
 * Simulates all remaining steps in sandbox tournament.
 * @param {Object} tournament 
 * @returns {Object} Final tournament
 */
export function simulateAll(tournament) {
  let currentT = tournament;
  let safety = 0;
  while (currentT.stage !== 'complete' && safety < 100) {
    const res = simulateNextStep(currentT);
    currentT = res.tournament;
    safety++;
  }
  return { tournament: currentT };
}
