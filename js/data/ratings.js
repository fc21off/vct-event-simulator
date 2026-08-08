/**
 * Team Elo / Power-Scores (Updated: August 2026)
 */
export const TEAM_RATINGS = {
  // AMERICAS
  '100T': 1369,
  'C9': 1202,
  'EG': 1188,
  'FUR': 1158,
  'KRU': 1134,
  'LEV': 1557,
  'LOUD': 1206,
  'MIBR': 1361,
  'NRG': 1457,
  'SEN': 1246,
  'G2': 1338,
  'ENVY': 1202,

  // EMEA
  'BBL': 1287,
  'FNC': 1258,
  'FUT': 1288,
  'M8': 1221,
  'GX': 1184,
  'KC': 1285,
  'NAVI': 1210,
  'TH': 1289,
  'TL': 1332,
  'VIT': 1416,
  'PCF': 1083,
  'EF': 1263,

  // PACIFIC
  'DFM': 1267,
  'DRX': 1287,
  'FS': 1249,
  'GEN': 1311,
  'GE': 1353,
  'PRX': 1563,
  'RRQ': 1239,
  'T1': 1355,
  'TS': 1150,
  'ZETA': 1236,
  'VL': 1233,
  'NS': 1384,

  // CHINA
  'AG': 1205,
  'BLG': 1231,
  'EDG': 1281,
  'FPX': 1119,
  'JDG': 1089,
  'NOVA': 1155,
  'TEC': 1099,
  'TE': 1034,
  'TYL': 1234,
  'WOL': 1109,
  'XLG': 1277,
  'DRG': 1179
};

/**
 * Gets Elo rating for a team by team object or team ID/tag string.
 * @param {Object|string} team
 * @returns {number} Elo rating
 */
export function getTeamRating(team) {
  if (!team) return 1200;
  const key = typeof team === 'string' ? team : (team.id || team.tag);
  return TEAM_RATINGS[key] !== undefined ? TEAM_RATINGS[key] : (team.rating || 1200);
}
