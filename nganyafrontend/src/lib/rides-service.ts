import { api } from "./api";
import type {
  Ride,
  Booking,
  Route,
  CreateRideRequest,
  ApiResponse,
  PaginatedResponse,
  Location,
} from "./types";

export interface RideSearchFilters {
  type?: "private" | "carpool";
  status?: "pending" | "active" | "completed" | "cancelled";
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface CreateBookingRequest {
  rideId?: string;
  deliveryId?: string;
  type: "ride" | "delivery";
  seatNumber?: number;
}

export interface RouteSearchRequest {
  startPoint: Location;
  endPoint: Location;
  departureTime?: Date;
  maxDistance?: number;
}

class RidesService {
  // Ride Management
  async createRide(rideData: CreateRideRequest): Promise<Ride> {
    try {
      const response = await api.post<ApiResponse<Ride>>("/rides", rideData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create ride");
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create ride");
    }
  }

  async getRides(
    filters?: RideSearchFilters,
  ): Promise<PaginatedResponse<Ride>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Ride>>>(
        "/rides",
        {
          params: filters,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get rides");
    } catch (error: any) {
      throw new Error("Failed to load rides");
    }
  }

  async getRide(rideId: string): Promise<Ride> {
    try {
      const response = await api.get<ApiResponse<Ride>>(`/rides/${rideId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get ride");
    } catch (error: any) {
      throw new Error("Failed to load ride details");
    }
  }

  async updateRideStatus(
    rideId: string,
    status: "pending" | "active" | "completed" | "cancelled",
  ): Promise<Ride> {
    try {
      const response = await api.patch<ApiResponse<Ride>>(
        `/rides/${rideId}/status`,
        { status },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update ride");
    } catch (error: any) {
      throw new Error("Failed to update ride status");
    }
  }

  async cancelRide(rideId: string, reason?: string): Promise<Ride> {
    try {
      const response = await api.patch<ApiResponse<Ride>>(
        `/rides/${rideId}/cancel`,
        { reason },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to cancel ride");
    } catch (error: any) {
      throw new Error("Failed to cancel ride");
    }
  }

  // Booking Management
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await api.post<ApiResponse<Booking>>(
        "/bookings",
        bookingData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create booking");
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create booking");
    }
  }

  async getBookings(filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
        "/bookings",
        {
          params: filters,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get bookings");
    } catch (error: any) {
      throw new Error("Failed to load bookings");
    }
  }

  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await api.get<ApiResponse<Booking>>(
        `/bookings/${bookingId}`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get booking");
    } catch (error: any) {
      throw new Error("Failed to load booking details");
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed",
  ): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${bookingId}/status`,
        { status },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update booking");
    } catch (error: any) {
      throw new Error("Failed to update booking status");
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${bookingId}/cancel`,
        { reason },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to cancel booking");
    } catch (error: any) {
      throw new Error("Failed to cancel booking");
    }
  }

  // Route Management (for carpooling)
  async searchRoutes(
    searchParams: RouteSearchRequest,
  ): Promise<PaginatedResponse<Route>> {
    try {
      const response = await api.post<ApiResponse<PaginatedResponse<Route>>>(
        "/routes/search",
        searchParams,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to search routes");
    } catch (error: any) {
      throw new Error("Failed to search routes");
    }
  }

  async createRoute(routeData: {
    startPoint: Location;
    endPoint: Location;
    stops?: Location[];
    startTime: Date;
    availableSeats: number;
  }): Promise<Route> {
    try {
      const response = await api.post<ApiResponse<Route>>("/routes", routeData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create route");
    } catch (error: any) {
      throw new Error("Failed to create route");
    }
  }

  async getRoute(routeId: string): Promise<Route> {
    try {
      const response = await api.get<ApiResponse<Route>>(`/routes/${routeId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get route");
    } catch (error: any) {
      throw new Error("Failed to load route details");
    }
  }

  // Real-time tracking
  async trackRide(rideId: string): Promise<{
    location: Location;
    status: string;
    estimatedArrival?: Date;
    driver: {
      name: string;
      phone: string;
      rating: number;
    };
    vehicle: {
      model: string;
      licensePlate: string;
      type: string;
    };
  }> {
    try {
      const response = await api.get(`/rides/${rideId}/track`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to track ride");
    } catch (error: any) {
      throw new Error("Failed to track ride");
    }
  }

  // Fare estimation
  async estimateFare(
    pickUp: Location,
    dropOff: Location,
    vehicleType?: string,
  ): Promise<{
    estimatedFare: number;
    distance: number;
    duration: number;
    breakdown: {
      baseFare: number;
      distanceFare: number;
      timeFare: number;
      serviceFee: number;
    };
  }> {
    try {
      const response = await api.post("/rides/estimate-fare", {
        pickUp,
        dropOff,
        vehicleType,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to estimate fare");
    } catch (error: any) {
      throw new Error("Failed to estimate fare");
    }
  }

  // Get nearby drivers
  async getNearbyDrivers(
    location: Location,
    radius?: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      location: Location;
      vehicle: {
        type: string;
        model: string;
      };
      rating: number;
      estimatedArrival: number;
    }>
  > {
    try {
      const response = await api.post("/drivers/nearby", {
        location,
        radius: radius || 5000, // 5km default
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get nearby drivers");
    } catch (error: any) {
      throw new Error("Failed to find nearby drivers");
    }
  }
}

export const ridesService = new RidesService();
