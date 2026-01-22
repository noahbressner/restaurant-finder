import { useState, useMemo } from 'react';
import RestaurantCard from './RestaurantCard';

export default function RestaurantList({ restaurants }) {
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const sortedRestaurants = useMemo(() => {
    const sorted = [...restaurants];

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'city':
        sorted.sort((a, b) => a.city.localeCompare(b.city));
        break;
      case 'state':
        sorted.sort((a, b) => a.state.localeCompare(b.state));
        break;
      case 'awards':
        sorted.sort((a, b) => {
          const awardOrder = {
            '3-star': 1, '2-star': 2, '1-star': 3,
            'bib-gourmand': 4, 'james-beard-winner': 5,
            'james-beard-finalist': 6, 'james-beard-nominee': 7
          };
          const aTop = Math.min(...a.awards.map(aw => awardOrder[aw.type] || 99));
          const bTop = Math.min(...b.awards.map(aw => awardOrder[aw.type] || 99));
          return aTop - bTop;
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [restaurants, sortBy]);

  const totalPages = Math.ceil(sortedRestaurants.length / itemsPerPage);
  const paginatedRestaurants = sortedRestaurants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No restaurants found matching your filters.</p>
        <p className="text-sm mt-2">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, sortedRestaurants.length)} of {sortedRestaurants.length} restaurants
        </p>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
          >
            <option value="name">Name</option>
            <option value="city">City</option>
            <option value="state">State</option>
            <option value="awards">Award Level</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
