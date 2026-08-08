import { createSwissStage, simulateSwissRound, isSwissComplete, getSwissStandings } from '../engine/swiss.js';
import { createBracket, simulateBracketRound, isBracketComplete } from '../engine/bracket.js';
import { getRandomHostCity } from '../data/cities.js';

export function createMasters8(teams) {
  const hostCity = getRandomHostCity('masters');
  return {
    type: 'masters8',
    name: `VCT MASTERS ${hostCity.toUpperCase()}`,
    hostCity,
    theme: 'masters',
    teams,
    stage: 'swiss',
    swiss: createSwissStage(teams),
    bracket: null,
    champion: null
  };
}

export function proceedToPlayoffs(tournament) {
  const t = { ...tournament };
  if (t.stage === 'swiss' && isSwissComplete(t.swiss) && !t.bracket) {
    const standings = getSwissStandings(t.swiss);
    const qualified = standings.filter(team => team.wins === 2);
    t.bracket = createBracket(qualified);
    t.stage = 'bracket';
  }
  return t;
}

export function simulateNextStep(tournament) {
  let t = { ...tournament };
  
  if (t.stage === 'swiss') {
    if (isSwissComplete(t.swiss)) {
      return { tournament: t, event: { type: 'swiss_complete' } };
    }
    
    const result = simulateSwissRound(t.swiss);
    t.swiss = result.tournament;
    
    return { tournament: t, event: result.event };
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
    if (currentT.stage === 'swiss' && isSwissComplete(currentT.swiss) && !currentT.bracket) {
      currentT = proceedToPlayoffs(currentT);
    } else {
      const result = simulateNextStep(currentT);
      currentT = result.tournament;
      events.push(result.event);
    }
  }
  
  return { tournament: currentT, events };
}
