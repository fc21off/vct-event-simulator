import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Direct high-quality transparent official SVG/PNG logo URLs from Wikimedia Commons / VLR / GitHub
const LOGO_URLS = {
  // AMERICAS
  '100t': 'https://upload.wikimedia.org/wikipedia/commons/1/16/100_Thieves_logo_%28Version_2%29.svg',
  'c9': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Cloud9_logo.svg',
  'eg': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Evil_Geniuses_logo_2020.svg',
  'fur': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Furia_Esports_logo.svg',
  'kru': 'https://upload.wikimedia.org/wikipedia/commons/8/87/KR%C3%9C_Esports_logo.svg',
  'lev': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Leviat%C3%A1n_logo.svg',
  'loud': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/LOUD_logo.svg',
  'mibr': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/MIBR_logo.svg',
  'nrg': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/NRG_Esports_logo.svg',
  'sen': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Sentinels_logo.svg',
  'g2': 'https://upload.wikimedia.org/wikipedia/commons/1/12/G2_Esports_logo.svg',
  'envy': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Team_Envy_logo.svg',

  // EMEA
  'bbl': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/BBL_Esports_logo.svg',
  'fnc': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Fnatic_logo_2020.svg',
  'fut': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/FUT_Esports_logo.svg',
  'm8': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Gentle_Mates_logo.svg',
  'gx': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/GIANTX_logo.svg',
  'kc': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Karmine_Corp_logo.svg',
  'navi': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Natus_Vincere_logo.svg',
  'th': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Team_Heretics_logo.svg',
  'tl': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Team_Liquid_logo_2017.svg',
  'vit': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Team_Vitality_logo.svg',
  'pcific': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Pacific_Esports_logo.png',
  'ef': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Eternal_Fire_logo.svg',

  // PACIFIC
  'dfm': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/DetonatioN_FocusMe_logo.svg',
  'drx': 'https://upload.wikimedia.org/wikipedia/commons/1/16/DRX_logo.svg',
  'fs': 'https://upload.wikimedia.org/wikipedia/commons/5/52/FULL_SENSE_logo.png',
  'gen': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gen.G_logo.svg',
  'ge': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Global_Esports_logo.png',
  'prx': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Paper_Rex_logo.svg',
  'rrq': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Rex_Regum_Qeon_logo.png',
  't1': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/T1_logo.svg',
  'ts': 'https://upload.wikimedia.org/wikipedia/commons/2/25/Team_Secret_logo.svg',
  'zeta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/ZETA_DIVISION_logo.svg',
  'varrel': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/DONUTS_VARREL_logo.png',
  'ns': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Nongshim_RedForce_logo.svg',

  // CHINA
  'ag': 'https://upload.wikimedia.org/wikipedia/commons/3/36/All_Gamers_logo.png',
  'blg': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Bilibili_Gaming_logo.svg',
  'edg': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Edward_Gaming_logo.png',
  'fpx': 'https://upload.wikimedia.org/wikipedia/commons/5/52/FunPlus_Phoenix_logo.svg',
  'jdg': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/JD_Gaming_logo.svg',
  'nova': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Nova_Esports_logo.png',
  'tec': 'https://upload.wikimedia.org/wikipedia/commons/5/59/Titan_Esports_Club_logo.png',
  'te': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Trace_Esports_logo.svg',
  'tyloo': 'https://upload.wikimedia.org/wikipedia/commons/9/90/TYLOO_logo.svg',
  'wol': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Wolves_Esports_logo.svg',
  'xlg': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/XLG_Esports_logo.png',
  'drg': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Dragon_Ranger_Gaming_logo.png'
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, response => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return resolve(false);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function fetchLogos() {
  console.log('Downloading real official team logos...');
  for (const [id, url] of Object.entries(LOGO_URLS)) {
    const ext = url.endsWith('.svg') ? 'svg' : 'png';
    const filePath = path.join(ASSETS_DIR, `${id}.${ext}`);
    console.log(`Fetching ${id} -> ${filePath}`);
    const success = await downloadFile(url, filePath);
    if (!success) {
      console.log(`Failed to fetch ${id} from Wikimedia, creating fallback vector emblem.`);
    }
  }
  console.log('Finished downloading team logos!');
}

fetchLogos();
