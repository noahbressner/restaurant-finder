import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^\w\s'"-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateId(restaurant) {
  const name = normalizeString(restaurant.name);
  const city = normalizeString(restaurant.city);
  const state = restaurant.state?.toUpperCase() || '';
  return `${name}-${city}-${state}`.replace(/\s+/g, '-').replace(/-+/g, '-');
}

function mergeRestaurants(michelin, jamesBeard) {
  const merged = new Map();

  for (const r of michelin) {
    const id = generateId(r);
    merged.set(id, {
      id,
      ...r,
      awards: [{
        type: r.award_type,
        year: r.award_year,
        source: 'michelin'
      }]
    });
  }

  for (const r of jamesBeard) {
    const id = generateId(r);

    if (merged.has(id)) {
      const existing = merged.get(id);
      existing.awards.push({
        type: r.award_type,
        year: r.award_year,
        category: r.award_category,
        source: 'james-beard'
      });

      if (!existing.lat && r.lat) {
        existing.lat = r.lat;
        existing.lng = r.lng;
      }
    } else {
      merged.set(id, {
        id,
        ...r,
        awards: [{
          type: r.award_type,
          year: r.award_year,
          category: r.award_category,
          source: 'james-beard'
        }]
      });
    }
  }

  return Array.from(merged.values()).map(r => {
    // eslint-disable-next-line no-unused-vars
    const { award_type, award_year, award_category, ...rest } = r;
    return rest;
  });
}

function getStateName(abbrev) {
  const stateNames = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
    'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
    'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
    'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
  };
  return stateNames[abbrev] || abbrev;
}

async function main() {
  const michelinPath = path.join(__dirname, 'michelin-data.json');
  const jamesBeardPath = path.join(__dirname, 'james-beard-data.json');

  let michelin = [];
  let jamesBeard = [];

  if (fs.existsSync(michelinPath)) {
    michelin = JSON.parse(fs.readFileSync(michelinPath, 'utf-8'));
    console.log(`Loaded ${michelin.length} Michelin restaurants`);
  } else {
    console.log('Michelin data not found, skipping');
  }

  if (fs.existsSync(jamesBeardPath)) {
    jamesBeard = JSON.parse(fs.readFileSync(jamesBeardPath, 'utf-8'));
    console.log(`Loaded ${jamesBeard.length} James Beard restaurants`);
  } else {
    console.log('James Beard data not found, skipping');
  }

  const merged = mergeRestaurants(michelin, jamesBeard);
  console.log(`Merged into ${merged.length} unique restaurants`);

  const enriched = merged.map(r => ({
    ...r,
    state_name: getStateName(r.state),
    has_michelin: r.awards.some(a => a.source === 'michelin'),
    has_james_beard: r.awards.some(a => a.source === 'james-beard'),
    michelin_stars: r.awards.find(a => a.type?.includes('star'))?.type || null,
    is_bib_gourmand: r.awards.some(a => a.type === 'bib-gourmand'),
    james_beard_status: r.awards.find(a => a.source === 'james-beard')?.type?.replace('james-beard-', '') || null
  }));

  const withCoords = enriched.filter(r => r.lat && r.lng).length;
  console.log(`${withCoords}/${enriched.length} restaurants have coordinates`);

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'restaurants.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
  console.log(`Saved final data to ${outputPath}`);

  const stats = {
    total: enriched.length,
    michelin_only: enriched.filter(r => r.has_michelin && !r.has_james_beard).length,
    james_beard_only: enriched.filter(r => !r.has_michelin && r.has_james_beard).length,
    both: enriched.filter(r => r.has_michelin && r.has_james_beard).length,
    with_coordinates: withCoords,
    by_state: {}
  };

  enriched.forEach(r => {
    stats.by_state[r.state] = (stats.by_state[r.state] || 0) + 1;
  });

  console.log('\nStats:', JSON.stringify(stats, null, 2));
}

main().catch(console.error);
