import { useMemo } from 'react';

export default function FilterControls({ restaurants, filters, onFilterChange }) {
  const states = useMemo(() => {
    const stateSet = new Set(restaurants.map(r => r.state).filter(Boolean));
    return Array.from(stateSet).sort();
  }, [restaurants]);

  const cities = useMemo(() => {
    let filtered = restaurants;
    if (filters.state) {
      filtered = filtered.filter(r => r.state === filters.state);
    }
    const citySet = new Set(filtered.map(r => r.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [restaurants, filters.state]);

  const awardTypes = [
    { value: '', label: 'All Awards' },
    { value: '3-star', label: 'Michelin 3-Star' },
    { value: '2-star', label: 'Michelin 2-Star' },
    { value: '1-star', label: 'Michelin 1-Star' },
    { value: 'bib-gourmand', label: 'Bib Gourmand' },
    { value: 'james-beard-winner', label: 'James Beard Winner' },
    { value: 'james-beard-finalist', label: 'James Beard Finalist' },
    { value: 'james-beard-nominee', label: 'James Beard Nominee' },
  ];

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'state') {
      newFilters.city = '';
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      state: '',
      city: '',
      awardType: '',
    });
  };

  const hasActiveFilters = filters.search || filters.state || filters.city || filters.awardType;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Restaurant name..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={!filters.state}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Award Type
          </label>
          <select
            value={filters.awardType}
            onChange={(e) => handleChange('awardType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {awardTypes.map(award => (
              <option key={award.value} value={award.value}>{award.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
