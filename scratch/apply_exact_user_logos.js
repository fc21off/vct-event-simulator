import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const EXACT_LOGOS = {
  'fur': 'https://owcdn.net/img/632be843b7d51.png',
  'gx': 'https://owcdn.net/img/657b2f3fcd199.png',
  'pcf': 'https://owcdn.net/img/656e2ae2b8a48.png',
  'pcific': 'https://owcdn.net/img/656e2ae2b8a48.png',
  'ef': 'https://owcdn.net/img/6628980dcdaea.png',
  'fs': 'https://owcdn.net/img/6537a7954d915.png',
  'vl': 'https://owcdn.net/img/63a74624cc76a.png',
  'varrel': 'https://owcdn.net/img/63a74624cc76a.png',
  'ns': 'https://owcdn.net/img/6399bb707aacb.png',
  'ag': 'https://owcdn.net/img/6549c2b905061.png',
  'jdg': 'https://owcdn.net/img/64f9825408326.png',
  'nova': 'https://owcdn.net/img/6404c0174250b.png',
  'wol': 'https://owcdn.net/img/651d33f8e6a1f.png',
  'xlg': 'https://owcdn.net/img/671742f863b9b.png',
  'drg': 'https://owcdn.net/img/642233fc01f26.png'
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

async function start() {
  console.log('Downloading user specified exact logo URLs...');
  for (const [tag, url] of Object.entries(EXACT_LOGOS)) {
    const destPng = path.join(ASSETS_DIR, `${tag}.png`);
    const destSvg = path.join(ASSETS_DIR, `${tag}.svg`);
    
    console.log(`Downloading ${tag} -> ${url}`);
    const success = await downloadImage(url, destPng);
    if (success) {
      const pngBuffer = fs.readFileSync(destPng);
      const base64 = pngBuffer.toString('base64');
      const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><image href="data:image/png;base64,${base64}" x="0" y="0" width="100" height="100"/></svg>`;
      fs.writeFileSync(destSvg, svgWrapper, 'utf8');
    }
  }
  console.log('All user specified logos downloaded and wrapped successfully!');
}

start();
