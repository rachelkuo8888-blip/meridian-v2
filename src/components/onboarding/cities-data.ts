// Static list of major world cities with timezone and coordinate data.
// Used for the birth location autocomplete on the onboarding screen.
// No external API needed for MVP.

export interface CityData {
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  label: string; // "City, Country" for display
}

export const MAJOR_CITIES: CityData[] = [
  // Asia
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', latitude: 39.9042, longitude: 116.4074, label: 'Beijing, China' },
  { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', latitude: 31.2304, longitude: 121.4737, label: 'Shanghai, China' },
  { city: 'Guangzhou', country: 'China', timezone: 'Asia/Shanghai', latitude: 23.1291, longitude: 113.2644, label: 'Guangzhou, China' },
  { city: 'Shenzhen', country: 'China', timezone: 'Asia/Shanghai', latitude: 22.5431, longitude: 114.0579, label: 'Shenzhen, China' },
  { city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', latitude: 22.3193, longitude: 114.1694, label: 'Hong Kong, China' },
  { city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei', latitude: 25.0330, longitude: 121.5654, label: 'Taipei, Taiwan' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', latitude: 35.6762, longitude: 139.6503, label: 'Tokyo, Japan' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.9780, label: 'Seoul, South Korea' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', latitude: 1.3521, longitude: 103.8198, label: 'Singapore' },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', latitude: 13.7563, longitude: 100.5018, label: 'Bangkok, Thailand' },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', latitude: 19.0760, longitude: 72.8777, label: 'Mumbai, India' },
  { city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', latitude: 28.6139, longitude: 77.2090, label: 'New Delhi, India' },
  { city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', latitude: -6.2088, longitude: 106.8456, label: 'Jakarta, Indonesia' },
  { city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila', latitude: 14.5995, longitude: 120.9842, label: 'Manila, Philippines' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', latitude: 10.8231, longitude: 106.6297, label: 'Ho Chi Minh City, Vietnam' },
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', latitude: 3.1390, longitude: 101.6869, label: 'Kuala Lumpur, Malaysia' },

  // North America
  { city: 'New York', country: 'USA', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.0060, label: 'New York, USA' },
  { city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437, label: 'Los Angeles, USA' },
  { city: 'Chicago', country: 'USA', timezone: 'America/Chicago', latitude: 41.8781, longitude: -87.6298, label: 'Chicago, USA' },
  { city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles', latitude: 37.7749, longitude: -122.4194, label: 'San Francisco, USA' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', latitude: 43.6532, longitude: -79.3832, label: 'Toronto, Canada' },
  { city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', latitude: 49.2827, longitude: -123.1207, label: 'Vancouver, Canada' },
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', latitude: 19.4326, longitude: -99.1332, label: 'Mexico City, Mexico' },

  // Europe
  { city: 'London', country: 'UK', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278, label: 'London, UK' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 48.8566, longitude: 2.3522, label: 'Paris, France' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', latitude: 52.5200, longitude: 13.4050, label: 'Berlin, Germany' },
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', latitude: 40.4168, longitude: -3.7038, label: 'Madrid, Spain' },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', latitude: 41.9028, longitude: 12.4964, label: 'Rome, Italy' },
  { city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', latitude: 52.3676, longitude: 4.9041, label: 'Amsterdam, Netherlands' },
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', latitude: 55.7558, longitude: 37.6173, label: 'Moscow, Russia' },
  { city: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm', latitude: 59.3293, longitude: 18.0686, label: 'Stockholm, Sweden' },

  // Oceania
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093, label: 'Sydney, Australia' },
  { city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', latitude: -37.8136, longitude: 144.9631, label: 'Melbourne, Australia' },
  { city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', latitude: -36.8485, longitude: 174.7633, label: 'Auckland, New Zealand' },

  // South America
  { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333, label: 'São Paulo, Brazil' },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', latitude: -34.6037, longitude: -58.3816, label: 'Buenos Aires, Argentina' },
  { city: 'Santiago', country: 'Chile', timezone: 'America/Santiago', latitude: -33.4489, longitude: -70.6693, label: 'Santiago, Chile' },

  // Middle East / Africa
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', latitude: 25.2048, longitude: 55.2708, label: 'Dubai, UAE' },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', latitude: 41.0082, longitude: 28.9784, label: 'Istanbul, Turkey' },
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', latitude: 30.0444, longitude: 31.2357, label: 'Cairo, Egypt' },
  { city: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg', latitude: -33.9249, longitude: 18.4241, label: 'Cape Town, South Africa' },
  { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', latitude: -1.2921, longitude: 36.8219, label: 'Nairobi, Kenya' },
  { city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos', latitude: 6.5244, longitude: 3.3792, label: 'Lagos, Nigeria' },
];

export const DEFAULT_CITIES = MAJOR_CITIES;

/**
 * Filter cities based on search query.
 */
export function filterCities(query: string): CityData[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return MAJOR_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q),
  ).slice(0, 8); // limit to 8 results
}
