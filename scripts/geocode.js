/* eslint-disable no-undef */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stateCoordinates = {
  'AL': { lat: 32.806671, lng: -86.791130, name: 'Alabama' },
  'AK': { lat: 61.370716, lng: -152.404419, name: 'Alaska' },
  'AZ': { lat: 33.729759, lng: -111.431221, name: 'Arizona' },
  'AR': { lat: 34.969704, lng: -92.373123, name: 'Arkansas' },
  'CA': { lat: 36.116203, lng: -119.681564, name: 'California' },
  'CO': { lat: 39.059811, lng: -105.311104, name: 'Colorado' },
  'CT': { lat: 41.597782, lng: -72.755371, name: 'Connecticut' },
  'DE': { lat: 39.318523, lng: -75.507141, name: 'Delaware' },
  'FL': { lat: 27.766279, lng: -81.686783, name: 'Florida' },
  'GA': { lat: 33.040619, lng: -83.643074, name: 'Georgia' },
  'HI': { lat: 21.094318, lng: -157.498337, name: 'Hawaii' },
  'ID': { lat: 44.240459, lng: -114.478828, name: 'Idaho' },
  'IL': { lat: 40.349457, lng: -88.986137, name: 'Illinois' },
  'IN': { lat: 39.849426, lng: -86.258278, name: 'Indiana' },
  'IA': { lat: 42.011539, lng: -93.210526, name: 'Iowa' },
  'KS': { lat: 38.526600, lng: -96.726486, name: 'Kansas' },
  'KY': { lat: 37.668140, lng: -84.670067, name: 'Kentucky' },
  'LA': { lat: 31.169546, lng: -91.867805, name: 'Louisiana' },
  'ME': { lat: 44.693947, lng: -69.381927, name: 'Maine' },
  'MD': { lat: 39.063946, lng: -76.802101, name: 'Maryland' },
  'MA': { lat: 42.230171, lng: -71.530106, name: 'Massachusetts' },
  'MI': { lat: 43.326618, lng: -84.536095, name: 'Michigan' },
  'MN': { lat: 45.694454, lng: -93.900192, name: 'Minnesota' },
  'MS': { lat: 32.741646, lng: -89.678696, name: 'Mississippi' },
  'MO': { lat: 38.456085, lng: -92.288368, name: 'Missouri' },
  'MT': { lat: 46.921925, lng: -110.454353, name: 'Montana' },
  'NE': { lat: 41.125370, lng: -98.268082, name: 'Nebraska' },
  'NV': { lat: 38.313515, lng: -117.055374, name: 'Nevada' },
  'NH': { lat: 43.452492, lng: -71.563896, name: 'New Hampshire' },
  'NJ': { lat: 40.298904, lng: -74.521011, name: 'New Jersey' },
  'NM': { lat: 34.840515, lng: -106.248482, name: 'New Mexico' },
  'NY': { lat: 42.165726, lng: -74.948051, name: 'New York' },
  'NC': { lat: 35.630066, lng: -79.806419, name: 'North Carolina' },
  'ND': { lat: 47.528912, lng: -99.784012, name: 'North Dakota' },
  'OH': { lat: 40.388783, lng: -82.764915, name: 'Ohio' },
  'OK': { lat: 35.565342, lng: -96.928917, name: 'Oklahoma' },
  'OR': { lat: 44.572021, lng: -122.070938, name: 'Oregon' },
  'PA': { lat: 40.590752, lng: -77.209755, name: 'Pennsylvania' },
  'RI': { lat: 41.680893, lng: -71.511780, name: 'Rhode Island' },
  'SC': { lat: 33.856892, lng: -80.945007, name: 'South Carolina' },
  'SD': { lat: 44.299782, lng: -99.438828, name: 'South Dakota' },
  'TN': { lat: 35.747845, lng: -86.692345, name: 'Tennessee' },
  'TX': { lat: 31.054487, lng: -97.563461, name: 'Texas' },
  'UT': { lat: 40.150032, lng: -111.862434, name: 'Utah' },
  'VT': { lat: 44.045876, lng: -72.710686, name: 'Vermont' },
  'VA': { lat: 37.769337, lng: -78.169968, name: 'Virginia' },
  'WA': { lat: 47.400902, lng: -121.490494, name: 'Washington' },
  'WV': { lat: 38.491226, lng: -80.954453, name: 'West Virginia' },
  'WI': { lat: 44.268543, lng: -89.616508, name: 'Wisconsin' },
  'WY': { lat: 42.755966, lng: -107.302490, name: 'Wyoming' },
  'DC': { lat: 38.897438, lng: -77.026817, name: 'District of Columbia' }
};

const cityCoordinates = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Minneapolis': { lat: 44.9778, lng: -93.2650 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Cleveland': { lat: 41.4993, lng: -81.6944 },
  'Washington': { lat: 38.9072, lng: -77.0369 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Charleston': { lat: 32.7765, lng: -79.9311 },
  'Savannah': { lat: 32.0809, lng: -81.0912 },
  'Napa': { lat: 38.2975, lng: -122.2869 },
  'Santa Monica': { lat: 34.0195, lng: -118.4912 },
  'Beverly Hills': { lat: 34.0736, lng: -118.4004 },
  'Brooklyn': { lat: 40.6782, lng: -73.9442 },
  'Manhattan': { lat: 40.7831, lng: -73.9712 },
  'Oakland': { lat: 37.8044, lng: -122.2712 },
  'Berkeley': { lat: 37.8716, lng: -122.2727 },
  'Palo Alto': { lat: 37.4419, lng: -122.1430 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Yountville': { lat: 38.4014, lng: -122.3609 },
  'Healdsburg': { lat: 38.6105, lng: -122.8693 },
  'Carmel': { lat: 36.5552, lng: -121.9233 },
  'Aspen': { lat: 39.1911, lng: -106.8175 },
  'Vail': { lat: 39.6403, lng: -106.3742 },
  'Scottsdale': { lat: 33.4942, lng: -111.9261 },
  'St. Louis': { lat: 38.6270, lng: -90.1994 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Indianapolis': { lat: 39.7684, lng: -86.1581 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Cincinnati': { lat: 39.1031, lng: -84.5120 },
  'Pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'Richmond': { lat: 37.5407, lng: -77.4360 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
  'Durham': { lat: 35.9940, lng: -78.8986 },
  'Asheville': { lat: 35.5951, lng: -82.5515 },
  'Birmingham': { lat: 33.5186, lng: -86.8104 },
  'Memphis': { lat: 35.1495, lng: -90.0490 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'Orlando': { lat: 28.5383, lng: -81.3792 },
  'Jacksonville': { lat: 30.3322, lng: -81.6557 },
  'Palm Beach': { lat: 26.7056, lng: -80.0364 },
  'Honolulu': { lat: 21.3069, lng: -157.8583 },
  'Maui': { lat: 20.7984, lng: -156.3319 },
  'Anchorage': { lat: 61.2181, lng: -149.9003 },
  'Santa Fe': { lat: 35.6870, lng: -105.9378 },
  'Albuquerque': { lat: 35.0844, lng: -106.6504 },
  'Salt Lake City': { lat: 40.7608, lng: -111.8910 },
  'Boise': { lat: 43.6150, lng: -116.2023 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Madison': { lat: 43.0731, lng: -89.4012 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'Providence': { lat: 41.8240, lng: -71.4128 },
  'Hartford': { lat: 41.7658, lng: -72.6734 },
  'New Haven': { lat: 41.3083, lng: -72.9279 },
  'Burlington': { lat: 44.4759, lng: -73.2121 },
  'Portsmouth': { lat: 43.0718, lng: -70.7626 }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function geocodeFromCache(city, state) {
  if (city && cityCoordinates[city]) {
    const coords = cityCoordinates[city];
    return { lat: coords.lat + (Math.random() - 0.5) * 0.02, lng: coords.lng + (Math.random() - 0.5) * 0.02 };
  }

  if (state && stateCoordinates[state]) {
    const coords = stateCoordinates[state];
    return { lat: coords.lat + (Math.random() - 0.5) * 0.5, lng: coords.lng + (Math.random() - 0.5) * 0.5 };
  }

  return null;
}

async function geocodeAddress(address, city, state) {
  const cached = geocodeFromCache(city, state);
  if (cached) return cached;

  const query = [address, city, state, 'USA'].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': 'RestaurantFinderApp/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            resolve(geocodeFromCache(city, state));
          }
        } catch {
          resolve(geocodeFromCache(city, state));
        }
      });
      res.on('error', () => resolve(geocodeFromCache(city, state)));
    }).on('error', () => resolve(geocodeFromCache(city, state)));
  });
}

async function geocodeRestaurants(restaurants) {
  const geocoded = [];
  let apiCalls = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];

    if (r.lat && r.lng) {
      geocoded.push(r);
      continue;
    }

    let coords = geocodeFromCache(r.city, r.state);

    if (!coords && apiCalls < 100) {
      await sleep(1100);
      coords = await geocodeAddress(r.address, r.city, r.state);
      apiCalls++;

      if ((i + 1) % 10 === 0) {
        console.log(`Geocoded ${i + 1}/${restaurants.length} (${apiCalls} API calls)`);
      }
    }

    if (coords) {
      geocoded.push({ ...r, lat: coords.lat, lng: coords.lng });
    } else {
      geocoded.push(r);
    }
  }

  return geocoded;
}

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.log('Usage: node geocode.js <input-file.json>');
    process.exit(1);
  }

  const inputPath = path.resolve(inputFile);
  const restaurants = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`Geocoding ${restaurants.length} restaurants...`);

  const needsGeocode = restaurants.filter(r => !r.lat || !r.lng).length;
  console.log(`${needsGeocode} restaurants need geocoding`);

  const geocoded = await geocodeRestaurants(restaurants);

  const withCoords = geocoded.filter(r => r.lat && r.lng).length;
  console.log(`${withCoords}/${geocoded.length} restaurants have coordinates`);

  const outputPath = inputPath.replace('.json', '-geocoded.json');
  fs.writeFileSync(outputPath, JSON.stringify(geocoded, null, 2));
  console.log(`Saved to ${outputPath}`);
}

main().catch(console.error);
