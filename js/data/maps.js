/**
 * VCT Official Map Pool
 */
export const VCT_MAP_POOL = [
  "Icebox",
  "Ascent",
  "Split",
  "Haven",
  "Fracture",
  "Pearl",
  "Lotus",
  "Corrode",
  "Summit",
  "Abyss",
  "Bind",
  "Breeze"
];

/**
 * Generates a VCT BO5 Grand Final Draft (2 Vetos for Upper Team, Map Picks, Deciders)
 * @returns {Object} Draft details including vetos and 5 played maps with pick origins
 */
export function generateGrandFinalDraft() {
  // Shuffle pool to pick 7 active maps for the match
  const shuffled = [...VCT_MAP_POOL].sort(() => Math.random() - 0.5);
  const activePool = shuffled.slice(0, 7);

  // Upper team bans 2 maps
  const veto1 = activePool[0];
  const veto2 = activePool[1];
  const vetos = [veto1, veto2];

  // Remaining 5 maps for BO5
  const playedMaps = activePool.slice(2, 7);

  // Assign map picks:
  // Map 1: Team 1 Pick
  // Map 2: Team 2 Pick
  // Map 3: Team 1 Pick
  // Map 4: Team 2 Pick
  // Map 5: Decider
  const maps = [
    { name: playedMaps[0], picker: 1, played: false, team1Score: null, team2Score: null, winner: null },
    { name: playedMaps[1], picker: 2, played: false, team1Score: null, team2Score: null, winner: null },
    { name: playedMaps[2], picker: 1, played: false, team1Score: null, team2Score: null, winner: null },
    { name: playedMaps[3], picker: 2, played: false, team1Score: null, team2Score: null, winner: null },
    { name: playedMaps[4], picker: 0, played: false, team1Score: null, team2Score: null, winner: null } // Decider
  ];

  return {
    vetos,
    maps
  };
}
