import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JAMES_BEARD_CSV_URL = 'https://raw.githubusercontent.com/cjwinchester/james-beard/main/james-beard-awards.csv';

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
  'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
  'Washington D.C.': 'DC', 'Washington, D.C.': 'DC', 'D.C.': 'DC'
};

function extractState(location) {
  if (!location) return null;

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

function extractCity(location) {
  if (!location) return '';
  const parts = location.split(',');
  return parts[0]?.trim() || '';
}

function getAwardLevel(status) {
  if (!status) return 'nominee';
  const lower = status.toLowerCase();
  if (lower.includes('winner')) return 'winner';
  if (lower.includes('finalist')) return 'finalist';
  if (lower.includes('nominee')) return 'nominee';
  if (lower.includes('semifinalist')) return 'semifinalist';
  return 'nominee';
}

function isRestaurantCategory(category, subcategory) {
  if (!category && !subcategory) return false;
  const combined = `${category || ''} ${subcategory || ''}`.toLowerCase();

  if (combined.includes('restaurant & chef')) return true;

  const restaurantKeywords = [
    'best chef', 'outstanding restaurant', 'best new restaurant',
    'rising star', 'outstanding chef', 'outstanding pastry chef',
    'outstanding bar', 'outstanding hospitality', 'best chefs',
    'outstanding restaurateur', 'emerging chef', 'regional'
  ];
  return restaurantKeywords.some(k => combined.includes(k));
}

async function main() {
  console.log('Fetching James Beard data...');

  const csv = await fetch(JAMES_BEARD_CSV_URL);
  const records = parseCSV(csv);

  console.log(`Parsed ${records.length} total records`);
  console.log('Sample record:', records[0]);

  const restaurants = records
    .filter(r => isRestaurantCategory(r.category, r.subcategory))
    .map(r => {
      const location = r.location || '';
      const restaurant = r.restaurant_name || '';
      const chef = r.recipient_name || '';

      return {
        name: restaurant || chef,
        chef: chef,
        address: '',
        city: extractCity(location),
        state: extractState(location),
        lat: null,
        lng: null,
        award_type: `james-beard-${getAwardLevel(r.award_status)}`,
        award_year: parseInt(r.year) || 2024,
        award_category: r.subcategory || r.category || '',
        cuisine: '',
        price_range: '',
        source: 'james-beard',
        url: ''
      };
    })
    .filter(r => r.name && r.state);

  console.log(`Found ${restaurants.length} restaurant-related records`);

  const deduped = [];
  const seen = new Set();
  for (const r of restaurants) {
    const key = `${r.name.toLowerCase()}-${r.city.toLowerCase()}-${r.state}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }

  console.log(`After deduplication: ${deduped.length} unique restaurants`);

  const outputPath = path.join(__dirname, 'james-beard-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 2));
  console.log(`Saved to ${outputPath}`);

  const byYear = {};
  deduped.forEach(r => {
    byYear[r.award_year] = (byYear[r.award_year] || 0) + 1;
  });
  console.log('Records by year (sample):', Object.entries(byYear).slice(-5));

  const byAward = {};
  deduped.forEach(r => {
    byAward[r.award_type] = (byAward[r.award_type] || 0) + 1;
  });
  console.log('By award type:', byAward);
}

main().catch(console.error);
