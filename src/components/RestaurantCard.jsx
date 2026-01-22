function getAwardBadge(award) {
  const badges = {
    '3-star': { label: '3 Stars', color: 'bg-red-600 text-white' },
    '2-star': { label: '2 Stars', color: 'bg-red-500 text-white' },
    '1-star': { label: '1 Star', color: 'bg-red-400 text-white' },
    'bib-gourmand': { label: 'Bib Gourmand', color: 'bg-orange-500 text-white' },
    'green-star': { label: 'Green Star', color: 'bg-green-600 text-white' },
    'selected restaurants': { label: 'Selected', color: 'bg-gray-500 text-white' },
    'james-beard-winner': { label: 'JB Winner', color: 'bg-amber-600 text-white' },
    'james-beard-finalist': { label: 'JB Finalist', color: 'bg-amber-500 text-white' },
    'james-beard-nominee': { label: 'JB Nominee', color: 'bg-amber-400 text-white' },
    'james-beard-semifinalist': { label: 'JB Semifinalist', color: 'bg-amber-300 text-gray-800' },
  };
  return badges[award.type] || { label: award.type, color: 'bg-gray-400 text-white' };
}

export default function RestaurantCard({ restaurant, compact = false }) {
  const { name, city, state, cuisine, price_range, awards, url, chef } = restaurant;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city} ${state}`)}`;

  if (compact) {
    return (
      <div className="p-3 bg-white">
        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
        <p className="text-xs text-gray-500">{city}, {state}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {awards.slice(0, 2).map((award, i) => {
            const badge = getAwardBadge(award);
            return (
              <span
                key={i}
                className={`px-1.5 py-0.5 text-xs rounded ${badge.color}`}
              >
                {badge.label}
              </span>
            );
          })}
          {awards.length > 2 && (
            <span className="px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-600">
              +{awards.length - 2}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          {chef && chef !== name && (
            <p className="text-sm text-gray-600">Chef: {chef}</p>
          )}
          <p className="text-sm text-gray-500">{city}, {state}</p>
        </div>
        {price_range && (
          <span className="text-gray-400 text-sm whitespace-nowrap">{price_range}</span>
        )}
      </div>

      {cuisine && (
        <p className="text-sm text-gray-600 mt-1">{cuisine}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {awards.map((award, i) => {
          const badge = getAwardBadge(award);
          return (
            <span
              key={i}
              className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}
              title={award.category ? `${award.category} (${award.year})` : `${award.year}`}
            >
              {badge.label} {award.year && `'${String(award.year).slice(-2)}`}
            </span>
          );
        })}
      </div>

      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View on Maps
        </a>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Michelin Guide
          </a>
        )}
      </div>
    </div>
  );
}
