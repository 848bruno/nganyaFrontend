// src/services/api.ts
import axios from 'axios';

export const getRoute = async (pickupAddress: string, dropoffAddress: string, apiKey: string) => {
  const geoBase = 'https://api.openrouteservice.org/geocode/search';
  const routeBase = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  // Step 1: Geocode both addresses
  const [pickupGeo, dropoffGeo] = await Promise.all([
    axios.get(geoBase, { params: { api_key: apiKey, text: pickupAddress, size: 1 } }),
    axios.get(geoBase, { params: { api_key: apiKey, text: dropoffAddress, size: 1 } }),
  ]);

  const pickupCoords = pickupGeo.data.features[0].geometry.coordinates; // [lng, lat]
  const dropoffCoords = dropoffGeo.data.features[0].geometry.coordinates;

  // Step 2: Fetch route
  const routeRes = await axios.post(
    routeBase,
    { coordinates: [pickupCoords, dropoffCoords] },
    { headers: { Authorization: apiKey, 'Content-Type': 'application/json' } }
  );

  return {
    route: routeRes.data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    startCoords: [pickupCoords[1], pickupCoords[0]], // convert to [lat, lng]
    endCoords: [dropoffCoords[1], dropoffCoords[0]],
  };
};
