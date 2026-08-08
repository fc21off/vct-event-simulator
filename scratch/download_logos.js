import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Teams list with team code, full name, brand color, and initials
const TEAMS_DATA = [
  // AMERICAS
  { id: 'SEN', name: 'Sentinels', color: '#e03b3b', text: 'SEN', icon: 'S' },
  { id: '100T', name: '100 Thieves', color: '#ff2d2d', text: '100T', icon: '100' },
  { id: 'C9', name: 'Cloud9', color: '#00aeef', text: 'C9', icon: 'C9' },
  { id: 'NRG', name: 'NRG Esports', color: '#ffffff', text: 'NRG', icon: 'NRG' },
  { id: 'EG', name: 'Evil Geniuses', color: '#162846', text: 'EG', icon: 'EG' },
  { id: 'LOUD', name: 'LOUD', color: '#00ff66', text: 'LOUD', icon: 'L' },
  { id: 'FUR', name: 'FURIA Esports', color: '#000000', text: 'FUR', icon: 'FUR' },
  { id: 'KRU', name: 'KRÜ Esports', color: '#ff007f', text: 'KRÜ', icon: 'KRU' },
  { id: 'LEV', name: 'Leviatán', color: '#00a3e0', text: 'LEV', icon: 'LEV' },
  { id: 'MIBR', name: 'MIBR', color: '#003399', text: 'MIBR', icon: 'MIBR' },
  { id: 'G2', name: 'G2 Esports', color: '#ff0000', text: 'G2', icon: 'G2' },
  { id: '2G', name: '2Game Esports', color: '#00e5ff', text: '2G', icon: '2G' },

  // EMEA
  { id: 'FNC', name: 'Fnatic', color: '#ff5900', text: 'FNC', icon: 'FNC' },
  { id: 'TH', name: 'Team Heretics', color: '#d4af37', text: 'TH', icon: 'TH' },
  { id: 'TL', name: 'Team Liquid', color: '#002b49', text: 'TL', icon: 'TL' },
  { id: 'KC', name: 'Karmine Corp', color: '#0055ff', text: 'KC', icon: 'KC' },
  { id: 'NAVI', name: 'Natus Vincere', color: '#fff500', text: 'NAVI', icon: 'NAV' },
  { id: 'FUT', name: 'FUT Esports', color: '#ff2200', text: 'FUT', icon: 'FUT' },
  { id: 'BBL', name: 'BBL Esports', color: '#00bfff', text: 'BBL', icon: 'BBL' },
  { id: 'GX', name: 'GIANTX', color: '#8000ff', text: 'GX', icon: 'GX' },
  { id: 'VIT', name: 'Team Vitality', color: '#ffff00', text: 'VIT', icon: 'VIT' },
  { id: 'M8', name: 'Gentle Mates', color: '#ff0055', text: 'M8', icon: 'M8' },
  { id: 'APK', name: 'Apeks', color: '#00ffaa', text: 'APK', icon: 'APK' },
  { id: 'KOI', name: 'KOI', color: '#9900ff', text: 'KOI', icon: 'KOI' },

  // PACIFIC
  { id: 'PRX', name: 'Paper Rex', color: '#e6007e', text: 'PRX', icon: 'PRX' },
  { id: 'DRX', name: 'DRX', color: '#0f3c6c', text: 'DRX', icon: 'DRX' },
  { id: 'T1', name: 'T1', color: '#e4002b', text: 'T1', icon: 'T1' },
  { id: 'GEN', name: 'Gen.G', color: '#aa8a00', text: 'GEN', icon: 'GEN' },
  { id: 'GE', name: 'Global Esports', color: '#0080ff', text: 'GE', icon: 'GE' },
  { id: 'TS', name: 'Team Secret', color: '#ffffff', text: 'TS', icon: 'TS' },
  { id: 'ZETA', name: 'ZETA DIVISION', color: '#ffffff', text: 'ZETA', icon: 'Z' },
  { id: 'DK', name: 'Dplus KIA', color: '#00e5ff', text: 'DK', icon: 'DK' },
  { id: 'TLN', name: 'Talon Esports', color: '#ff3300', text: 'TLN', icon: 'TLN' },
  { id: 'RRQ', name: 'Rex Regum Qeon', color: '#ff9900', text: 'RRQ', icon: 'RRQ' },
  { id: 'NS', name: 'Nongshim RedForce', color: '#ff0000', text: 'NS', icon: 'NS' },
  { id: 'SPG', name: 'Sin Prisa Gaming', color: '#00ffcc', text: 'SPG', icon: 'SPG' },

  // CHINA
  { id: 'EDG', name: 'EDward Gaming', color: '#000000', text: 'EDG', icon: 'EDG' },
  { id: 'BLG', name: 'Bilibili Gaming', tag: 'BLG', color: '#00a1d6', text: 'BLG', icon: 'BLG' },
  { id: 'FPX', name: 'FunPlus Phoenix', color: '#ff0000', text: 'FPX', icon: 'FPX' },
  { id: 'TE', name: 'Trace Esports', color: '#00e5ff', text: 'TE', icon: 'TE' },
  { id: 'DRG', name: 'Dragon Ranger Gaming', color: '#ff6600', text: 'DRG', icon: 'DRG' },
  { id: 'AG', name: 'All Gamers', color: '#ff0000', text: 'AG', icon: 'AG' },
  { id: 'NOVA', name: 'Nova Esports', color: '#9900ff', text: 'NOVA', icon: 'NOV' },
  { id: 'WOL', name: 'Wolves Esports', color: '#ffcc00', text: 'WOL', icon: 'WOL' },
  { id: 'JDG', name: 'JD Gaming', color: '#ff0033', text: 'JDG', icon: 'JDG' },
  { id: 'TEC', name: 'Titan Esports Club', color: '#0099ff', text: 'TEC', icon: 'TEC' },
  { id: 'XLG', name: 'Xi\'an Gaming', color: '#ff3399', text: 'XLG', icon: 'XLG' },
  { id: 'HLG', name: 'High Light Gaming', color: '#ffaa00', text: 'HLG', icon: 'HLG' }
];

console.log(`Generating crisp SVG logos for ${TEAMS_DATA.length} teams...`);

TEAMS_DATA.forEach(team => {
  const filePath = path.join(ASSETS_DIR, `${team.id.toLowerCase()}.svg`);
  
  // Custom styled esports badge SVG for each team
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad-${team.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${team.color}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#111" stop-opacity="0.95" />
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="90" height="90" rx="12" fill="url(#grad-${team.id})" stroke="${team.color}" stroke-width="3" />
  <text x="50" y="58" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="1">${team.icon}</text>
</svg>`;

  fs.writeFileSync(filePath, svg, 'utf8');
});

console.log('All team SVG logos generated successfully!');
