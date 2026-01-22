import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MICHELIN_CSV_URL = 'https://raw.githubusercontent.com/ngshiheng/michelin-my-maps/main/data/michelin_my_maps.csv';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] || '';
    });
    records.push(record);
  }

  return records;
}

function getAwardType(award) {
  if (!award) return null;
  const lower = award.toLowerCase();
  if (lower.includes('3 star') || lower.includes('three star')) return '3-star';
  if (lower.includes('2 star') || lower.includes('two star')) return '2-star';
  if (lower.includes('1 star') || lower.includes('one star')) return '1-star';
  if (lower.includes('bib gourmand')) return 'bib-gourmand';
  if (lower.includes('green star')) return 'green-star';
  return lower;
}

function isUSLocation(location, address) {
  const combined = `${location || ''} ${address || ''}`;
  if (!combined.trim()) return false;

  if (combined.includes('United States') || combined.includes(', USA')) return true;

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'West Virginia',
    'Wisconsin', 'Wyoming', 'District of Columbia'
  ];

  for (const state of usStates) {
    const statePattern = new RegExp(`${state},\\s*(USA|United States|\\d{5})`, 'i');
    if (statePattern.test(combined)) return true;
  }

  const zipPattern = /,\s*\d{5}(-\d{4})?,\s*(USA|United States)/i;
  if (zipPattern.test(combined)) return true;

  const usCities = [
    'New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Las Vegas',
    'Washington D.C.', 'Boston', 'Philadelphia', 'Seattle', 'Denver', 'Austin',
    'Houston', 'Dallas', 'Atlanta', 'Nashville', 'New Orleans', 'Portland',
    'San Diego', 'Phoenix', 'Minneapolis', 'Detroit', 'Charleston', 'Napa',
    'Yountville', 'Healdsburg', 'Santa Monica', 'Beverly Hills', 'Brooklyn', 'Manhattan'
  ];

  for (const city of usCities) {
    if (location && location.includes(city) && !combined.toLowerCase().includes('germany') &&
        !combined.toLowerCase().includes('france') && !combined.toLowerCase().includes('italy') &&
        !combined.toLowerCase().includes('spain') && !combined.toLowerCase().includes('uk')) {
      return true;
    }
  }

  return false;
}

function extractStateFromLocation(location) {
  if (!location) return null;

  const stateMap = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
    'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
    'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA',
    'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
    'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
    'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
  };

  for (const [state, abbrev] of Object.entries(stateMap)) {
    if (location.includes(state)) return abbrev;
  }

  const abbrevs = Object.values(stateMap);
  for (const abbrev of abbrevs) {
    const pattern = new RegExp(`\\b${abbrev}\\b`);
    if (pattern.test(location)) return abbrev;
  }

  return null;
}

async function main() {
  console.log('Fetching Michelin data...');

  const csv = await fetch(MICHELIN_CSV_URL);
  const records = parseCSV(csv);

  console.log(`Parsed ${records.length} total records`);

  const usRestaurants = records
    .filter(r => isUSLocation(r.Location, r.Address))
    .map(r => {
      const location = r.Location || r.location || '';
      const address = r.Address || r.address || '';

      return {
        name: r.Name || r.name || '',
        address: address,
        city: r.City || r.city || location.split(',')[0]?.trim() || '',
        state: extractStateFromLocation(location) || extractStateFromLocation(address),
        lat: parseFloat(r.Latitude || r.latitude || r.lat) || null,
        lng: parseFloat(r.Longitude || r.longitude || r.lng || r.lon) || null,
        award_type: getAwardType(r.Award || r.award || r.Distinction || r.distinction),
        award_year: parseInt(r.Year || r.year) || 2024,
        cuisine: r.Cuisine || r.cuisine || '',
        price_range: r.Price || r.price || '',
        source: 'michelin',
        url: r.Url || r.url || r.URL || ''
      };
    })
    .filter(r => r.name && r.state);

  console.log(`Found ${usRestaurants.length} US restaurants`);

  const outputPath = path.join(__dirname, 'michelin-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(usRestaurants, null, 2));
  console.log(`Saved to ${outputPath}`);

  const byAward = {};
  usRestaurants.forEach(r => {
    byAward[r.award_type] = (byAward[r.award_type] || 0) + 1;
  });
  console.log('By award type:', byAward);
}

main().catch(console.error);
