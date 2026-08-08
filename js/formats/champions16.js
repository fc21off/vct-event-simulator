import { createGSLGroup, simulateGSLStep, isGSLComplete, getGSLStandings } from '../engine/gsl.js';
import { createBracket, simulateBracketRound, isBracketComplete } from '../engine/bracket.js';
import { getRandomHostCity } from '../data/cities.js';

export function createChampions16(selectedTeams) {
  const hostCity = getRandomHostCity('champions');

  // Separate selected teams by region (each region has 4 teams ordered Seed #1..#4)
  const amer = selectedTeams.filter(t => t.region === 'AMER');
  const emea = selectedTeams.filter(t => t.region === 'EMEA');
  const pac = selectedTeams.filter(t => t.region === 'PAC');
  const cn = selectedTeams.filter(t => t.region === 'CN');

  // Helper fallback if user started with incomplete selection (e.g. sandbox/custom)
  const getTeam = (list, seedIdx) => (list && list[seedIdx]) ? list[seedIdx] : selectedTeams[(seedIdx) % selectedTeams.length];

  // Official VCT Champions Group Draw (Strict 1 Team Per Region, 1st vs 4th, 2nd vs 3rd)
  // Group A: AMER 1, EMEA 2, PAC 3, CN 4
  const groupA = [getTeam(amer, 0), getTeam(emea, 1), getTeam(pac, 2), getTeam(cn, 3)];

  // Group B: EMEA 1, PAC 2, CN 3, AMER 4
  const groupB = [getTeam(emea, 0), getTeam(pac, 1), getTeam(cn, 2), getTeam(amer, 3)];

  // Group C: PAC 1, CN 2, AMER 3, EMEA 4
  const groupC = [getTeam(pac, 0), getTeam(cn, 1), getTeam(amer, 2), getTeam(emea, 3)];

  // Group D: CN 1, AMER 2, EMEA 3, PAC 4
  const groupD = [getTeam(cn, 0), getTeam(amer, 1), getTeam(emea, 2), getTeam(pac, 3)];

  const groups = [
    createGSLGroup('A', groupA),
    createGSLGroup('B', groupB),
    createGSLGroup('C', groupC),
    createGSLGroup('D', groupD)
  ];

  return {
    type: 'champions16',
    name: `VCT CHAMPIONS ${hostCity.toUpperCase()}`,
    hostCity,
    theme: 'champions',
    teams: selectedTeams,
    stage: 'groups',
    groups,
    bracket: null,
    champion: null
  };
}

export function proceedToPlayoffs(tournament) {
  const t = { ...tournament };
  const allComplete = t.groups.every(g => isGSLComplete(g));
  
  if (t.stage === 'groups' && allComplete && !t.bracket) {
    // Seed Bracket: Group Winners vs Runners-up (1st seed vs 2nd seed from different groups)
    const bracketTeams = [
      t.groups[0].results.first,  // A1 → plays D2 (idx 7)
      t.groups[2].results.first,  // C1 → plays B2 (idx 6)
      t.groups[1].results.first,  // B1 → plays C2 (idx 5)
      t.groups[3].results.first,  // D1 → plays A2 (idx 4)
      t.groups[0].results.second, // A2 → plays D1 (idx 3)
      t.groups[2].results.second, // C2 → plays B1 (idx 2)
      t.groups[1].results.second, // B2 → plays C1 (idx 1)
      t.groups[3].results.second  // D2 → plays A1 (idx 0)
    ];
    t.bracket = createBracket(bracketTeams);
    t.stage = 'bracket';
  }
  return t;
}

export function simulateNextStep(tournament) {
  let t = { ...tournament };
  
  if (t.stage === 'groups') {
    const uncompleteGroup = t.groups.find(g => !isGSLComplete(g));
    if (uncompleteGroup) {
      const result = simulateGSLStep(uncompleteGroup);
      const groupIdx = t.groups.findIndex(g => g.name === uncompleteGroup.name);
      t.groups[groupIdx] = result.tournament;
      return { tournament: t, event: result.event };
    } else {
      return { tournament: t, event: { type: 'groups_complete' } };
    }
  } else if (t.stage === 'bracket') {
    const result = simulateBracketRound(t.bracket);
    t.bracket = result.tournament;
    
    if (isBracketComplete(t.bracket)) {
      t.stage = 'complete';
      t.champion = t.bracket.champion;
      return { tournament: t, event: { type: 'champion', data: t.champion } };
    }
    
    return { tournament: t, event: result.event };
  }
  
  return { tournament: t, event: { type: 'noop' } };
}

export function simulateAll(tournament) {
  let currentT = tournament;
  const events = [];
  
  while (currentT.stage !== 'complete') {
    const allGroupsDone = currentT.groups && currentT.groups.every(g => isGSLComplete(g));
    if (currentT.stage === 'groups' && allGroupsDone && !currentT.bracket) {
      currentT = proceedToPlayoffs(currentT);
    } else {
      const result = simulateNextStep(currentT);
      currentT = result.tournament;
      events.push(result.event);
    }
  }
  
  return { tournament: currentT, events };
}
