import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('assets/teams');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Map team ID to Liquipedia page title
const LIQUIPEDIA_PAGES = {
  '100t': '100_Thieves',
  'c9': 'Cloud9',
  'eg': 'Evil_Geniuses',
  'fur': 'FURIA_Esports',
  'kru': 'KRÜ_Esports',
  'lev': 'Leviatán',
  'loud': 'LOUD',
  'mibr': 'MIBR',
  'nrg': 'NRG',
  'sen': 'Sentinels',
  'g2': 'G2_Esports',
  'envy': 'Team_Envy',

  'bbl': 'BBL_Esports',
  'fnc': 'Fnatic',
  'fut': 'FUT_Esports',
  'm8': 'Gentle_Mates',
  'gx': 'GIANTX',
  'kc': 'Karmine_Corp',
  'navi': 'Natus_Vincere',
  'th': 'Team_Heretics',
  'tl': 'Team_Liquid',
  'vit': 'Team_Vitality',
  'pcific': 'PCIFIC_Esports',
  'ef': 'Eternal_Fire',

  'dfm': 'DetonatioN_FocusMe',
  'drx': 'DRX',
  'fs': 'FULL_SENSE',
  'gen': 'Gen.G_Esports',
  'ge': 'Global_Esports',
  'prx': 'Paper_Rex',
  'rrq': 'Rex_Regum_Qeon',
  't1': 'T1',
  'ts': 'Team_Secret',
  'zeta': 'ZETA_DIVISION',
  'varrel': 'VARREL',
  'ns': 'Nongshim_RedForce',

  'ag': 'All_Gamers',
  'blg': 'Bilibili_Gaming',
  'edg': 'EDward_Gaming',
  'fpx': 'FunPlus_Phoenix',
  'jdg': 'JD_Gaming',
  'nova': 'Nova_Esports',
  'tec': 'Titan_Esports_Club',
  'te': 'Trace_Esports',
  'tyloo': 'TYLOO',
  'wol': 'Wolves_Esports',
  'xlg': 'XLG_Esports',
  'drg': 'Dragon_Ranger_Gaming'
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'VCTSimulator/1.0 (contact@vctsim.com)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'VCTSimulator/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(true)));
    }).on('error', () => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function fetchLiquipediaLogos() {
  console.log('Fetching official team logos via Liquipedia MediaWiki API...');
  for (const [id, page] of Object.entries(LIQUIPEDIA_PAGES)) {
    try {
      const apiUrl = `https://liquipedia.net/valorant/api.php?action=query&titles=${encodeURIComponent(page)}&prop=pageimages&pithumbsize=500&format=json`;
      const res = await httpGet(apiUrl);
      const json = JSON.parse(res.data);
      const pages = json.query?.pages;
      let imageUrl = null;
      if (pages) {
        const pageObj = Object.values(pages)[0];
        imageUrl = pageObj?.thumbnail?.source;
      }

      if (imageUrl) {
        const ext = imageUrl.endsWith('.svg') ? 'svg' : 'png';
        const dest = path.join(ASSETS_DIR, `${id}.${ext}`);
        console.log(`Downloading ${id} logo from ${imageUrl}`);
        await downloadBinary(imageUrl, dest);
      } else {
        console.log(`No image found for ${id} on Liquipedia API.`);
      }
    } catch (err) {
      console.log(`Error fetching ${id}: ${err.message}`);
    }
  }
  console.log('Done fetching official Liquipedia logos!');
}

fetchLiquipediaLogos();
