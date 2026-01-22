import { useState, useMemo } from 'react';
import FilterControls from './components/FilterControls';
import RestaurantList from './components/RestaurantList';
import RestaurantMap from './components/RestaurantMap';
import restaurantData from './data/restaurants.json';

function App() {
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    city: '',
    awardType: '',
  });

  const filteredRestaurants = useMemo(() => {
    return restaurantData.filter((restaurant) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = restaurant.name?.toLowerCase().includes(searchLower);
        const chefMatch = restaurant.chef?.toLowerCase().includes(searchLower);
        if (!nameMatch && !chefMatch) return false;
      }

      if (filters.state && restaurant.state !== filters.state) {
        return false;
      }

      if (filters.city && restaurant.city !== filters.city) {
        return false;
      }

      if (filters.awardType) {
        const hasAward = restaurant.awards?.some(
          (award) => award.type === filters.awardType
        );
        if (!hasAward) return false;
      }

      return true;
    });
  }, [filters]);

  const stats = useMemo(() => {
    const michelin = filteredRestaurants.filter(r => r.has_michelin).length;
    const jamesBeard = filteredRestaurants.filter(r => r.has_james_beard).length;
    const withCoords = filteredRestaurants.filter(r => r.lat && r.lng).length;
    return { michelin, jamesBeard, withCoords };
  }, [filteredRestaurants]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant Finder
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                James Beard and Michelin recognized restaurants across the US
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <FilterControls
          restaurants={restaurantData}
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
            {filteredRestaurants.length} restaurants
          </span>
          <span className="bg-red-50 px-3 py-1 rounded-full border border-red-200 text-red-700">
            {stats.michelin} Michelin
          </span>
          <span className="bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-amber-700">
            {stats.jamesBeard} James Beard
          </span>
          {view === 'map' && (
            <span className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200 text-blue-700">
              {stats.withCoords} on map
            </span>
          )}
        </div>

        <div className="mt-6">
          {view === 'list' ? (
            <RestaurantList restaurants={filteredRestaurants} />
          ) : (
            <div className="h-[calc(100vh-300px)] min-h-[500px]">
              <RestaurantMap restaurants={filteredRestaurants} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Data sourced from{' '}
            <a href="https://guide.michelin.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Michelin Guide
            </a>
            {' '}and{' '}
            <a href="https://www.jamesbeard.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              James Beard Foundation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
