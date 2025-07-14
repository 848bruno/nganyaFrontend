// src/lib/geo-service.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:3001"; // Replace with your NestJS backend URL

export const geoService = {
  /**
   * Calculates a route between two addresses using the backend.
   * @param pickup The pickup address.
   * @param dropoff The dropoff address.
   * @returns The route data including geometry, distance, and duration.
   */
  async calculateRoute(pickup: string, dropoff: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/route/calculate`, {
        pickup,
        dropoff,
      });
      return response.data;
    } catch (error: any) {
      console.error("GeoService Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to calculate route",
      );
    }
  },
};