interface Coordinates {
  lat: number;
  lng: number;
}

async function tryGeocode(query: string): Promise<Coordinates | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    console.log(`[Geocode] Trying: ${query}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FastwaySend/1.0 (support@fastwaysending.com)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      console.log(`[Geocode] Found: ${coords.lat}, ${coords.lng}`);
      return coords;
    }
    return null;
  } catch (error) {
    console.error('[Geocode] Error:', error);
    return null;
  }
}

// Extract city name from a full address
// e.g., "40, Oghagbon Str. Aduwawa, Benin City, Edo State" -> "Benin City"
function extractCity(address: string): string | null {
  const parts = address.split(',').map(p => p.trim());
  
  // Try to find a part that looks like a city (contains "City", "Town", or is 2+ words)
  for (const part of parts) {
    if (part.toLowerCase().includes('city') || part.toLowerCase().includes('town')) {
      return part;
    }
  }
  
  // If no "City" found, return the second-to-last part (usually the city in addresses)
  if (parts.length >= 2) {
    return parts[parts.length - 2] || parts[0];
  }
  
  return parts[0] || null;
}

export async function geocodeAddress(
  address: string,
  country?: string,
  nearestAirport?: string
): Promise<Coordinates | null> {
  // Strategy 1: Full address + country
  if (country) {
    const fullAddress = `${address}, ${country}`;
    const result = await tryGeocode(fullAddress);
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Strategy 2: Just the address
  const result1 = await tryGeocode(address);
  if (result1) return result1;
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Strategy 3: Extract city + country
  const city = extractCity(address);
  if (city && country) {
    const cityQuery = `${city}, ${country}`;
    const result2 = await tryGeocode(cityQuery);
    if (result2) return result2;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Strategy 4: Just the city
  if (city) {
    const result3 = await tryGeocode(city);
    if (result3) return result3;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Strategy 5: Nearest airport + country
  if (nearestAirport) {
    const airportQuery = `${nearestAirport} Airport, ${country || ''}`;
    const result4 = await tryGeocode(airportQuery);
    if (result4) return result4;
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Strategy 6: Just the airport name
    const result5 = await tryGeocode(nearestAirport);
    if (result5) return result5;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Strategy 7: Just the country (absolute last resort)
  if (country) {
    const result6 = await tryGeocode(country);
    if (result6) return result6;
  }

  console.log('[Geocode] All strategies failed for:', address);
  return null;
}