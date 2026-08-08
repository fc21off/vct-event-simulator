import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.resolve('assets/teams');

const CUSTOM_SVGS = {
  'pcific': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M 20 20 L 80 20 L 50 85 Z" fill="#00e5ff" />
    <path d="M 35 30 L 65 30 L 50 65 Z" fill="#090c10" />
    <text x="50" y="48" font-family="Outfit, sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">PCIFIC</text>
  </svg>`,

  'fs': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="42" fill="#ff2a5f" />
    <text x="50" y="58" font-family="Outfit, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="1">FS</text>
  </svg>`,

  'varrel': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <polygon points="50,10 90,85 10,85" fill="#ff9900" stroke="#ffffff" stroke-width="4" />
    <text x="50" y="70" font-family="Outfit, sans-serif" font-weight="900" font-size="20" fill="#000000" text-anchor="middle">VARREL</text>
  </svg>`,

  'ag': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M 15 80 L 50 15 L 85 80 L 65 80 L 50 50 L 35 80 Z" fill="#ff0000" />
    <text x="50" y="75" font-family="Outfit, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">AG</text>
  </svg>`,

  'nova': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M 50 10 L 63 38 L 93 38 L 68 56 L 78 86 L 50 67 L 22 86 L 32 56 L 7 38 L 37 38 Z" fill="#9900ff" />
    <text x="50" y="56" font-family="Outfit, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">NOVA</text>
  </svg>`,

  'tec': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect x="15" y="20" width="70" height="60" rx="8" fill="#0088ff" />
    <text x="50" y="58" font-family="Outfit, sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">TEC</text>
  </svg>`,

  'xlg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M 20 20 L 50 50 L 20 80 L 35 80 L 65 50 L 35 20 Z" fill="#ff007f" />
    <path d="M 50 20 L 80 50 L 50 80 L 65 80 L 95 50 L 65 20 Z" fill="#ffffff" />
  </svg>`,

  'drg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M 20 15 L 80 15 L 80 85 L 50 60 L 20 85 Z" fill="#ff6600" />
    <text x="50" y="45" font-family="Outfit, sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">DRG</text>
  </svg>`,

  'rrq': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect x="10" y="10" width="80" height="80" rx="16" fill="#ffaa00" />
    <text x="50" y="60" font-family="Outfit, sans-serif" font-weight="900" font-size="26" fill="#000000" text-anchor="middle">RRQ</text>
  </svg>`,

  'ge': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="#0066ff" stroke="#ffffff" stroke-width="4" />
    <text x="50" y="58" font-family="Outfit, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">GE</text>
  </svg>`
};

for (const [id, svg] of Object.entries(CUSTOM_SVGS)) {
  const filePath = path.join(ASSETS_DIR, `${id}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
}

console.log('Custom team SVGs created successfully!');
