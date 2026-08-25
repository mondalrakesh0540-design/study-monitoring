// search-spicy-memes.js
import https from 'https';

const queries = ['sharam', 'chal nikal', 'bapuji', 'jethalal', 'carryminati', 'hera pheri', 'bhosdike', 'gaand', 'chutiya'];

function searchMyInstants(query) {
  return new Promise((resolve) => {
    const url = `https://www.myinstants.com/en/search/?name=${encodeURIComponent(query)}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/\/media\/sounds\/([a-zA-Z0-9_-]+\.mp3)/g)].map(m => m[1]);
        const unique = [...new Set(matches)];
        resolve({ query, sounds: unique.slice(0, 5) });
      });
    }).on('error', () => resolve({ query, sounds: [] }));
  });
}

async function run() {
  for (const q of queries) {
    const res = await searchMyInstants(q);
    console.log(`=== Query: "${q}" ===`);
    res.sounds.forEach(s => console.log(`https://www.myinstants.com/media/sounds/${s}`));
  }
}

run();
