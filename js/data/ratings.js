/**
 * Team Elo Ratings Hashmap
 * Every team starts with a default rating of 100.
 */
export const TEAM_RATINGS = {
  // AMERICAS
  '100T': 100,
  'C9': 100,
  'EG': 100,
  'FUR': 100,
  'KRU': 100,
  'LEV': 100,
  'LOUD': 100,
  'MIBR': 100,
  'NRG': 100,
  'SEN': 100,
  'G2': 100,
  'ENVY': 100,

  // EMEA
  'BBL': 100,
  'FNC': 100,
  'FUT': 100,
  'M8': 100,
  'GX': 100,
  'KC': 100,
  'NAVI': 100,
  'TH': 100,
  'TL': 100,
  'VIT': 100,
  'PCF': 100,
  'EF': 100,

  // PACIFIC
  'DFM': 100,
  'DRX': 100,
  'FS': 100,
  'GEN': 100,
  'GE': 100,
  'PRX': 100,
  'RRQ': 100,
  'T1': 100,
  'TS': 100,
  'ZETA': 100,
  'VL': 100,
  'NS': 100,

  // CHINA
  'AG': 100,
  'BLG': 100,
  'EDG': 100,
  'FPX': 100,
  'JDG': 100,
  'NOVA': 100,
  'TEC': 100,
  'TE': 100,
  'TYL': 100,
  'WOL': 100,
  'XLG': 100,
  'DRG': 100
};

/**
 * Gets Elo rating for a team by team object or team ID/tag string.
 * @param {Object|string} team
 * @returns {number} Elo rating
 */
export function getTeamRating(team) {
  if (!team) return 100;
  const key = typeof team === 'string' ? team : (team.id || team.tag);
  return TEAM_RATINGS[key] !== undefined ? TEAM_RATINGS[key] : (team.rating || 100);
}
