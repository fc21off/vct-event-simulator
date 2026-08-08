import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');

// Direct exact owcdn.net PNG URLs for the 6 remaining teams
const REMAINING_LOGOS = {
  'gx': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/GIANTX_logo.svg',
  'jdg': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/JD_Gaming_logo.svg',
  'wol': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Wolves_Esports_logo.svg',
  'xlg': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/XLG_Esports_logo.png',
  'drg': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Dragon_Ranger_Gaming_logo.png',
  'ns': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Nongshim_RedForce_logo.svg'
};

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

async function fixRemaining() {
  console.log('Fixing remaining 6 team logos...');
  for (const [tag, url] of Object.entries(REMAINING_LOGOS)) {
    const destPng = path.join(ASSETS_DIR, `${tag}.png`);
    const destSvg = path.join(ASSETS_DIR, `${tag}.svg`);
    
    console.log(`Downloading ${tag} from ${url}`);
    const success = await downloadImage(url, destPng);
    if (success) {
      const pngBuffer = fs.readFileSync(destPng);
      const base64 = pngBuffer.toString('base64');
      const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><image href="data:image/png;base64,${base64}" x="0" y="0" width="100" height="100"/></svg>`;
      fs.writeFileSync(destSvg, svgWrapper, 'utf8');
    }
  }
  console.log('All remaining 6 logos fixed cleanly!');
}

fixRemaining();
