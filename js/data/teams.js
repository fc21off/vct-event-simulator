export const TEAMS_BY_REGION = {
  AMER: [
    { id: 'SEN', name: 'Sentinels', tag: 'SEN', region: 'AMER' },
    { id: 'C9', name: 'Cloud9', tag: 'C9', region: 'AMER' },
    { id: '100T', name: '100 Thieves', tag: '100T', region: 'AMER' },
    { id: 'NRG', name: 'NRG Esports', tag: 'NRG', region: 'AMER' },
    { id: 'EG', name: 'Evil Geniuses', tag: 'EG', region: 'AMER' },
    { id: 'LOUD', name: 'LOUD', tag: 'LOUD', region: 'AMER' },
    { id: 'FUR', name: 'FURIA', tag: 'FUR', region: 'AMER' },
    { id: 'KRU', name: 'KRÜ Esports', tag: 'KRÜ', region: 'AMER' },
    { id: 'LEV', name: 'Leviatán', tag: 'LEV', region: 'AMER' },
    { id: 'MIBR', name: 'MIBR', tag: 'MIBR', region: 'AMER' },
    { id: 'G2', name: 'G2 Esports', tag: 'G2', region: 'AMER' },
    { id: '2G', name: '2Game Esports', tag: '2G', region: 'AMER' }
  ],
  EMEA: [
    { id: 'FNC', name: 'Fnatic', tag: 'FNC', region: 'EMEA' },
    { id: 'TH', name: 'Team Heretics', tag: 'TH', region: 'EMEA' },
    { id: 'TL', name: 'Team Liquid', tag: 'TL', region: 'EMEA' },
    { id: 'KC', name: 'Karmine Corp', tag: 'KC', region: 'EMEA' },
    { id: 'NAVI', name: 'Natus Vincere', tag: 'NAVI', region: 'EMEA' },
    { id: 'FUT', name: 'FUT Esports', tag: 'FUT', region: 'EMEA' },
    { id: 'BBL', name: 'BBL Esports', tag: 'BBL', region: 'EMEA' },
    { id: 'GIA', name: 'Giants Gaming', tag: 'GIA', region: 'EMEA' },
    { id: 'VIT', name: 'Team Vitality', tag: 'VIT', region: 'EMEA' },
    { id: 'M8', name: 'Gentle Mates', tag: 'M8', region: 'EMEA' },
    { id: 'APK', name: 'Apeks', tag: 'APK', region: 'EMEA' },
    { id: 'KOI', name: 'KOI', tag: 'KOI', region: 'EMEA' }
  ],
  PAC: [
    { id: 'PRX', name: 'Paper Rex', tag: 'PRX', region: 'PAC' },
    { id: 'DRX', name: 'DRX', tag: 'DRX', region: 'PAC' },
    { id: 'T1', name: 'T1', tag: 'T1', region: 'PAC' },
    { id: 'GEN', name: 'Gen.G', tag: 'GEN', region: 'PAC' },
    { id: 'GE', name: 'Global Esports', tag: 'GE', region: 'PAC' },
    { id: 'TS', name: 'Team Secret', tag: 'TS', region: 'PAC' },
    { id: 'ZETA', name: 'ZETA DIVISION', tag: 'ZETA', region: 'PAC' },
    { id: 'DFM', name: 'DetonatioN FocusMe', tag: 'DFM', region: 'PAC' },
    { id: 'TLN', name: 'Talon Esports', tag: 'TLN', region: 'PAC' },
    { id: 'RRQ', name: 'Rex Regum Qeon', tag: 'RRQ', region: 'PAC' },
    { id: 'NS', name: 'Nongshim RedForce', tag: 'NS', region: 'PAC' },
    { id: 'BOOM', name: 'BOOM Esports', tag: 'BOOM', region: 'PAC' }
  ],
  CN: [
    { id: 'EDG', name: 'Edward Gaming', tag: 'EDG', region: 'CN' },
    { id: 'BLG', name: 'Bilibili Gaming', tag: 'BLG', region: 'CN' },
    { id: 'FPX', name: 'FunPlus Phoenix', tag: 'FPX', region: 'CN' },
    { id: 'TE', name: 'Trace Esports', tag: 'TE', region: 'CN' },
    { id: 'DRG', name: 'Dragon Ranger Gaming', tag: 'DRG', region: 'CN' },
    { id: 'AG', name: 'All Gamers', tag: 'AG', region: 'CN' },
    { id: 'NOVA', name: 'Nova Esports', tag: 'NOVA', region: 'CN' },
    { id: 'WOL', name: 'Wolves Esports', tag: 'WOL', region: 'CN' },
    { id: 'JDG', name: 'JD Gaming', tag: 'JDG', region: 'CN' },
    { id: 'TYLOO', name: 'TyLoo', tag: 'TYLOO', region: 'CN' },
    { id: 'ASE', name: 'Attacking Soul Esports', tag: 'ASE', region: 'CN' },
    { id: 'RA', name: 'Rare Atom', tag: 'RA', region: 'CN' }
  ]
};

export const ALL_TEAMS = [
  ...TEAMS_BY_REGION.AMER,
  ...TEAMS_BY_REGION.EMEA,
  ...TEAMS_BY_REGION.PAC,
  ...TEAMS_BY_REGION.CN
];

/**
 * Gets a random selection of teams.
 * @param {number} count - Number of teams to select.
 * @param {boolean} balanced - If true, selects evenly from regions if possible.
 * @returns {Array} Array of selected team objects.
 */
export function getRandomTeams(count, balanced = true) {
  if (!balanced) {
    const shuffled = [...ALL_TEAMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const regions = ['AMER', 'EMEA', 'PAC', 'CN'];
  const perRegion = Math.floor(count / regions.length);
  const extra = count % regions.length;
  
  let selected = [];
  
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const take = perRegion + (i < extra ? 1 : 0);
    const regionTeams = [...TEAMS_BY_REGION[region]].sort(() => 0.5 - Math.random());
    selected.push(...regionTeams.slice(0, take));
  }
  
  return selected.sort(() => 0.5 - Math.random());
}

/**
 * Gets specific counts of teams per region.
 * @param {Object} regionCounts - e.g. {AMER:3, EMEA:3, PAC:3, CN:3}
 * @returns {Array} Array of selected team objects.
 */
export function getTeamPool(regionCounts) {
  let selected = [];
  for (const [region, count] of Object.entries(regionCounts)) {
    if (TEAMS_BY_REGION[region]) {
      const regionTeams = [...TEAMS_BY_REGION[region]].sort(() => 0.5 - Math.random());
      selected.push(...regionTeams.slice(0, count));
    }
  }
  return selected.sort(() => 0.5 - Math.random());
}
