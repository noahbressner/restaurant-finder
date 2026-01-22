import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import RestaurantCard from './RestaurantCard';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const getMarkerColor = (restaurant) => {
  const awards = restaurant.awards || [];
  for (const award of awards) {
    if (award.type === '3-star') return '#dc2626';
    if (award.type === '2-star') return '#ef4444';
    if (award.type === '1-star') return '#f87171';
  }
  for (const award of awards) {
    if (award.type === 'bib-gourmand') return '#f97316';
  }
  for (const award of awards) {
    if (award.type?.includes('james-beard-winner')) return '#d97706';
    if (award.type?.includes('james-beard')) return '#fbbf24';
  }
  return '#6b7280';
};

function MapBoundsHandler({ restaurants }) {
  const map = useMap();

  useMemo(() => {
    if (restaurants.length > 0) {
      const restaurantsWithCoords = restaurants.filter(r => r.lat && r.lng);
      if (restaurantsWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          restaurantsWithCoords.map(r => [r.lat, r.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [restaurants, map]);

  return null;
}

export default function RestaurantMap({ restaurants }) {
  const restaurantsWithCoords = useMemo(() => {
    return restaurants.filter(r => r.lat && r.lng);
  }, [restaurants]);

  const defaultCenter = [39.8283, -98.5795];
  const defaultZoom = 4;

  if (restaurantsWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg">No restaurants with location data</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsHandler restaurants={restaurantsWithCoords} />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {restaurantsWithCoords.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
            icon={createCustomIcon(getMarkerColor(restaurant))}
          >
            <Popup maxWidth={300} minWidth={250}>
              <RestaurantCard restaurant={restaurant} compact />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
