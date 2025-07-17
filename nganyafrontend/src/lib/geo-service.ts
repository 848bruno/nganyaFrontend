// src/lib/geo-service.ts
import { api } from './api'; // Assuming 'api' is your configured axios instance

// Define types for the route data and suggested vehicle data coming from backend
export interface GeocodedCoordinates {
  latitude: number;
  longitude: number;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string; // Encoded polyline for map display
  pickupLatitude: number; // Geocoded
  pickupLongitude: number; // Geocoded
  destinationLatitude: number; // Geocoded
  destinationLongitude: number; // Geocoded
}

export interface SuggestedDriver {
  id: string; // Driver's User ID
  name: string;
  rating: number;
  image?: string;
  trips: number;
}

export interface SuggestedVehicleResponse {
  id: string; // Vehicle ID
  type: string;
  price: number;
  estimatedTime: string; // E.g., "5 min"
  capacity: number;
  features?: string[];
  vehicleInfo?: string;
  driver: SuggestedDriver; // Driver profile associated with this vehicle
}

export interface GetSuggestedDriversAndRouteResponse {
  route: RouteData;
  suggestedVehicles: SuggestedVehicleResponse[];
}

class GeoService {
  /**
   * Calculates route and fetches nearest drivers based on pickup and destination addresses.
   * This calls a single backend endpoint that orchestrates geocoding, routing, and driver matching.
   */
  async getSuggestedDriversAndRoute(
    pickupAddress: string,
    destinationAddress: string
  ): Promise<GetSuggestedDriversAndRouteResponse> {
    try {
      const res = await api.get<GetSuggestedDriversAndRouteResponse>(
        '/geo/suggest-drivers', // ⭐ NEW Backend Endpoint ⭐
        {
          params: {
            pickup: pickupAddress,
            destination: destinationAddress,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching suggested drivers and route:", error);
      throw error;
    }
  }

  // You can keep the old calculateRoute if you still need it separately,
  // but the new getSuggestedDriversAndRoute will often supersede it for the main flow.
  // async calculateRoute(pickupAddress: string, destinationAddress: string): Promise<RouteData> {
  //   try {
  //     const res = await api.get<RouteData>('/geo/route', {
  //       params: { pickup: pickupAddress, destination: destinationAddress },
  //     });
  //     return res.data;
  //   } catch (error) {
  //     console.error('Error calculating route:', error);
  //     throw error;
  //   }
  // }
}

export const geoService = new GeoService();