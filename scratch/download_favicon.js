import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://owcdn.net/img/64e8c485bda72.png';
const dest = path.resolve('assets/favicon.png');

const file = fs.createWriteStream(dest);
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, r => r.pipe(file));
  } else {
    res.pipe(file);
  }
  file.on('finish', () => {
    file.close(() => console.log('Favicon downloaded successfully!'));
  });
});
