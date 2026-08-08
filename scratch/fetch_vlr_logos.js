import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Exact VLR Team IDs
const VLR_TEAMS = {
  // AMERICAS
  '100t': 120,
  'c9': 188,
  'eg': 5248,
  'fur': 6648,
  'kru': 2355,
  'lev': 2359,
  'loud': 6961,
  'mibr': 7386,
  'nrg': 1034,
  'sen': 2,
  'g2': 11058,
  'envy': 427,

  // EMEA
  'bbl': 397,
  'fnc': 2593,
  'fut': 1184,
  'm8': 12694,
  'gx': 12398,
  'kc': 8877,
  'navi': 4915,
  'th': 1001,
  'tl': 474,
  'vit': 2059,
  'pcific': 14995,
  'ef': 12185,

  // PACIFIC
  'dfm': 278,
  'drx': 8185,
  'fs': 4053,
  'gen': 17,
  'ge': 918,
  'prx': 624,
  'rrq': 878,
  't1': 14,
  'ts': 6199,
  'zeta': 5448,
  'varrel': 12534,
  'ns': 11540,

  // CHINA
  'ag': 11100,
  'blg': 12010,
  'edg': 1120,
  'fpx': 11328,
  'jdg': 12108,
  'nova': 10667,
  'tec': 14137,
  'te': 12685,
  'tyloo': 731,
  'wol': 11796,
  'xlg': 14717,
  'drg': 12107
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://www.vlr.gg' + loc;
        return fetchPage(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(true)));
    }).on('error', () => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function start() {
  console.log('Downloading 100% exact official team logos from VLR.gg...');
  for (const [tag, teamId] of Object.entries(VLR_TEAMS)) {
    try {
      const pageUrl = `https://www.vlr.gg/team/${teamId}`;
      const html = await fetchPage(pageUrl);
      
      const match = html.match(/src=["'](\/\/owcdn\.net\/img\/[^"']+)["']/i);
      if (match) {
        let logoUrl = 'https:' + match[1];
        const destSvg = path.join(ASSETS_DIR, `${tag}.svg`);
        const destPng = path.join(ASSETS_DIR, `${tag}.png`);
        
        console.log(`Downloading ${tag} logo from VLR: ${logoUrl}`);
        const success = await downloadImage(logoUrl, destPng);
        if (success) {
          const pngBuffer = fs.readFileSync(destPng);
          const base64 = pngBuffer.toString('base64');
          const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><image href="data:image/png;base64,${base64}" x="0" y="0" width="100" height="100"/></svg>`;
          fs.writeFileSync(destSvg, svgWrapper, 'utf8');
        }
      } else {
        console.log(`Could not find logo img on VLR page for ${tag}`);
      }
    } catch (err) {
      console.log(`Failed for ${tag}: ${err.message}`);
    }
  }
  console.log('All exact official VLR logos downloaded successfully!');
}

start();
