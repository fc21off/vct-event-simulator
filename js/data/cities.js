/**
 * VCT Host Cities Pool
 * Masters is open to a wide variety of global esports hubs
 * Champions is strictly reserved for the 19 user-specified premier megacities
 */

export const MASTERS_CITIES = [
  "Berlin", "Munich", "Stuttgart", "Hamburg", "Cologne", "Warsaw", "Rome", "Venice",
  "Paris", "Marseille", "Barcelona", "Lisbon", "Madrid", "Vienna", "Zurich", "Dublin",
  "Edinburgh", "Stockholm", "Oslo", "Budapest", "Athens", "Toronto", "Vancouver",
  "Montreal", "Seattle", "San Francisco", "Los Angeles", "Las Vegas", "Phoenix", "Denver",
  "Dallas", "Houston", "San Diego", "Salt Lake City", "Chicago", "New Orleans", "Atlanta",
  "Orlando", "Miami", "Detroit", "New York City", "Washington", "Philadelphia", "Baltimore",
  "Boston", "Mexico City", "Buenos Aires", "Sao Paulo", "Rio de Janeiro", "Cape Town",
  "Cairo", "Lagos", "Dubai", "Istanbul", "Riyadh", "New Delhi", "Mumbai", "Beijing",
  "Shanghai", "Chongqing", "Seoul", "Tokyo", "Osaka", "Singapore", "Kuala Lumpur",
  "Bangkok", "Ho Chi Minh City", "Jakarta", "Sydney", "Melbourne", "Perth", "Auckland",
  "Moscow", "Amsterdam", "Prague", "Brussels", "Kyiv", "Tel Aviv", "London", "Santiago",
  "Reykjavik", "Copenhagen"
];

// Strictly the 19 Champions cities specified by user
export const CHAMPIONS_CITIES = [
  "Berlin", "London", "Paris", "Rome", "Athens", "Istanbul", "Cairo",
  "Mexico City", "New York City", "Los Angeles", "Rio de Janeiro", "Cape Town",
  "Beijing", "Shanghai", "Seoul", "Tokyo", "Singapore", "Sydney", "Dubai"
];

/**
 * Returns a random host city based on event theme.
 * @param {'masters' | 'champions'} type
 * @returns {string} City name
 */
export function getRandomHostCity(type = 'masters') {
  const pool = (type === 'champions' || type === 'champions16') ? CHAMPIONS_CITIES : MASTERS_CITIES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
