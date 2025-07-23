// src/lib/dashboard-service.ts
import { api } from './api'; // Assuming 'api' is your configured axios instance or fetch wrapper
import type {
  User,
  Vehicle,
  Route,
  Ride,
  Booking,
  Delivery,
  Payment,
  Review,
  Notification,
  PaginatedResponse,
  ApiResponse,
  VehicleType,
  VehicleStatus,
  CreateUserRequest, // Used for creating users, including drivers
  UserRole, // Import UserRole for type safety
  DriverDashboardStats,
} from './types';

// Add this interface for the route service response
interface RouteServiceResponse {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  geometry: {
    type: string; // Ensure this is always present
    coordinates: [number, number][]; // OSRM typically returns [lon, lat]
  };
  distance: number;
  duration: number;
  instructions: any[];
}

class RideshareService {
  constructor() {
    // ⭐ NEW DEBUG LOG: Confirm service instance and available methods ⭐
    console.log("RideshareService instance created.");
    console.log("   Methods available:", Object.keys(Object.getPrototypeOf(this)));
    console.log("   updateDriverStatus available:", typeof this.updateDriverStatus === 'function');
    console.log("   updateDriverLocation available:", typeof this.updateDriverLocation === 'function');
  }

  // Admin Stats
  async getAdminStats(): Promise<DriverDashboardStats> {
    try {
      const res = await api.get<ApiResponse<DriverDashboardStats>>('/admin/stats');
      return {
        totalUsers: res.data.data.totalUsers || 0,
        activeDrivers: res.data.data.activeDrivers || 0,
        totalVehicles: res.data.data.totalVehicles || 0,
        monthlyRevenue: res.data.data.monthlyRevenue || 0,
        totalRides: res.data.data.totalRides || 0,
        totalBookings: res.data.data.totalBookings || 0,
        completionRate: res.data.data.completionRate || 0,
        averageRating: res.data.data.averageRating || 0,
        supportTickets: res.data.data.supportTickets || 0,
        todayEarnings: res.data.data.todayEarnings || 0,
        weeklyEarnings: res.data.data.weeklyEarnings || 0,
        rating: res.data.data.rating || 0,
        hoursOnline: res.data.data.hoursOnline || 0,
        weeklyProgress: res.data.data.weeklyProgress || 0,
        isOnline: res.data.data.isOnline || false,
      };
    } catch (error: any) {
      console.error('Error fetching admin stats:', error.response?.data || error.message || error);
      return {
        totalUsers: 0, activeDrivers: 0, totalVehicles: 0, monthlyRevenue: 0,
        totalRides: 0, totalBookings: 0, completionRate: 0, averageRating: 0,
        supportTickets: 0, todayEarnings: 0, weeklyEarnings: 0, rating: 0,
        hoursOnline: 0, weeklyProgress: 0, isOnline: false,
      };
    }
  }

  async getDriverStats(): Promise<DriverDashboardStats> {
    try {
      console.log('dashboard-service: Sending GET /users/me request. Authorization Header:', api.defaults.headers.common['Authorization']);
      const res = await api.get<ApiResponse<User>>(`/users/me`);
      const userData = res.data.data;
      return {
        todayEarnings: 0, weeklyEarnings: 0, totalBookings: 0,
        totalRides: userData.totalRidesCompleted || 0,
        rating: userData.averageRating || 0,
        completionRate: 0, hoursOnline: 0, weeklyProgress: 0,
        isOnline: userData.isOnline || false,
        totalUsers: 0, activeDrivers: 0, totalVehicles: 0,
        monthlyRevenue: 0, supportTickets: 0, averageRating: userData.averageRating || 0,
      };
    } catch (error: any) {
      console.error(`Error fetching driver stats from /users/me:`, error.response?.data || error.message || error);
      return {
        todayEarnings: 0, weeklyEarnings: 0, totalBookings: 0,
        totalRides: 0, rating: 0, completionRate: 0, hoursOnline: 0,
        weeklyProgress: 0, isOnline: false, totalUsers: 0,
        activeDrivers: 0, totalVehicles: 0, monthlyRevenue: 0,
        supportTickets: 0, averageRating: 0,
      };
    }
  }

  // ⭐ UPDATED: Changed return type to Promise<User> ⭐
  async updateDriverLocation(latitude: number, longitude: number): Promise<User> {
    try {
      const res = await api.post<ApiResponse<User>>('/users/location', { latitude, longitude });
      console.log('Driver location updated successfully on server.');
      return res.data.data; // Return the updated user data
    } catch (error: any) {
      console.error('Error sending driver location to server:', error.response?.data || error.message || error);
      throw error;
    }
  }

  // ⭐ UPDATED: Changed return type to Promise<User> ⭐
  async updateDriverStatus(isOnline: boolean): Promise<User> {
    try {
      const res = await api.patch<ApiResponse<User>>('/users/me/status', { isOnline });
      console.log('Driver status updated successfully on server.');
      return res.data.data; // Return the updated user data
    } catch (error: any) {
      console.error('Error updating driver status on server:', error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateRideStatus(rideId: string, status: string): Promise<Ride> {
    try {
      const res = await api.patch<ApiResponse<Ride>>(`/rides/${rideId}/status`, { status });
      return res.data.data;
    } catch (error: any) {
      console.error(`Error updating ride ${rideId} status to ${status}:`, error.response?.data || error.message || error);
      throw error;
    }
  }

  async getDriverVehicle(): Promise<Vehicle | null> {
    try {
      const res = await api.get<ApiResponse<Vehicle | null>>('/users/me/vehicle');
      return res.data.data || null;
    } catch (error: any) {
      console.error('Error fetching driver vehicle:', error.response?.data || error.message || error);
      return null;
    }
  }

  async getDriverRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    try {
      const res = await api.get<PaginatedResponse<Ride>>('/users/me/rides', { params });
      return res.data;
    } catch (error: any) {
      console.error('Error fetching driver rides:', error.response?.data || error.message || error);
      return {
        data: [], items: [], total: 0, page: params?.page || 1, limit: params?.limit || 10,
        totalPages: 0, hasNextPage: false, hasPreviousPage: false,
      };
    }
  }


  async getNearestDrivers(
    latitude: number,
    longitude: number,
    maxDistanceKm: number = 5,
    limit: number = 5,
  ): Promise<(User & { distance?: number })[]> {
    try {
      const res = await api.get<ApiResponse<(User & { distance?: number })[]>>('/users/drivers/nearest', {
        params: { latitude, longitude, maxDistanceKm, limit },
      });
      return res.data.data;
    } catch (error) {
      console.error('Error fetching nearest drivers:', error);
      throw error;
    }
  }

  
  async geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
    try {
      const res = await api.post<ApiResponse<{ lat: number; lon: number }>>('/route/geocode', { address });
      return res.data.data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  // ⭐ Corrected METHOD: getRoute to send lat,lon to backend and return specific type ⭐
  async getRoute(start: [number, number], end: [number, number]): Promise<RouteServiceResponse> {
    try {
      const res = await api.post<ApiResponse<RouteServiceResponse>>('/route/calculate', {
        pickup: `${start[0]},${start[1]}`, // Sending as "latitude,longitude"
        dropoff: `${end[0]},${end[1]}`,   // Sending as "latitude,longitude"
      });
      return res.data.data;
    } catch (error: any) {
      console.error('Error getting route:', error.response?.data || error.message || error);
      throw error;
    }
  }

  // USERS
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    q?: string;
    email?: string;
  }): Promise<PaginatedResponse<User>> {
    const currentPage = params?.page || 1;
    const currentLimit = params?.limit || 10;
    try {
      const res = await api.get<PaginatedResponse<User>>('/users', { params });
      const paginatedResponse = res.data;
      console.log("✅ getUsers API call successful. Data:", paginatedResponse);
      return paginatedResponse;
    } catch (error: any) {
      console.error("❌ getUsers API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const res = await api.post<User>('/users', data);
      console.log("✅ createUser API call successful. Data:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("❌ createUser API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateUser API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/users/${id}`);
    } catch (error: any) {
      console.error("❌ deleteUser API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // VEHICLES
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    type?: VehicleType;
    status?: VehicleStatus;
    q?: string;
  }): Promise<PaginatedResponse<Vehicle>> {
    try {
      const res = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
      const paginatedResponse = res.data;
      console.log("✅ getVehicles API call successful. Data:", paginatedResponse);
      return paginatedResponse;
    } catch (error: any) {
      console.error("❌ getVehicles API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await api.post<ApiResponse<Vehicle>>('/vehicles', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createVehicle API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateVehicle API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async deleteVehicle(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/vehicles/${id}`);
    } catch (error: any) {
      console.error("❌ deleteVehicle API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // ROUTES
  async getRoutes(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Route>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Route>>>('/routes', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getRoutes API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createRoute(data: Partial<Route>): Promise<Route> {
    try {
      const res = await api.post<ApiResponse<Route>>('/routes', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createRoute API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateRoute(id: string, data: Partial<Route>): Promise<Route> {
    try {
      const res = await api.patch<ApiResponse<Route>>(`/routes/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateRoute API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async deleteRoute(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/routes/${id}`);
    } catch (error: any) {
      console.error("❌ deleteRoute API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // RIDES
  async getRides(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Ride>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Ride>>>('/rides', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getRides API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createRide(data: Partial<Ride>): Promise<Ride> {
    try {
      const res = await api.post<ApiResponse<Ride>>('/rides', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createRide API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateRide(id: string, data: Partial<Ride>): Promise<Ride> {
    try {
      const res = await api.patch<ApiResponse<Ride>>(`/rides/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateRide API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async deleteRide(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/rides/${id}`);
    } catch (error: any) {
      console.error("❌ deleteRide API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // BOOKINGS
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Booking>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getBookings API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    try {
      const res = await api.post<ApiResponse<Booking>>('/bookings', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createBooking API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    try {
      const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateBooking API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async deleteBooking(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/bookings/${id}`);
    } catch (error: any) {
      console.error("❌ deleteBooking API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // DELIVERIES
  async getDeliveries(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    driverId?: string;
    q?: string;
  }): Promise<PaginatedResponse<Delivery>> {
    try {
      const res = await api.get<PaginatedResponse<Delivery>>('/deliveries', { params });
      return res.data;
    } catch (error: any) {
      console.error("❌ getDeliveries API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  };

  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const res = await api.get<Delivery>(`/deliveries/${id}`);
      return res.data;
    }
    catch (error: any) {
      console.error(`❌ getDeliveryById API call for ID ${id} failed. Error:`, error.response?.data || error.message || error);
      throw error;
    }
  };

  async createDelivery(data: Partial<Delivery>): Promise<Delivery> {
    try {
      const res = await api.post<ApiResponse<Delivery>>('/deliveries', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createDelivery API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateDelivery(id: string, data: Partial<Delivery>): Promise<Delivery> {
    try {
      const res = await api.patch<ApiResponse<Delivery>>(
        `/deliveries/${id}`,
        data,
      );
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateDelivery API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // ⭐ MODIFIED METHOD: deleteDelivery to return boolean ⭐
  async deleteDelivery(id: string): Promise<boolean> {
    try {
      await api.delete<ApiResponse<void>>(`/deliveries/${id}`);
      return true; // Return true on success
    } catch (error: any) {
      console.error("❌ deleteDelivery API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // PAYMENTS
  async getPayments(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Payment>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Payment>>>('/payments', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getPayments API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    try {
      const res = await api.post<ApiResponse<Payment>>('/payments', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createPayment API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    try {
      const res = await api.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updatePayment API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // ⭐ MODIFIED METHOD: deletePayment to return boolean ⭐
  async deletePayment(id: string): Promise<boolean> {
    try {
      await api.delete<ApiResponse<void>>(`/payments/${id}`);
      return true; // Return true on success
    } catch (error: any) {
      console.error("❌ deletePayment API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // REVIEWS
  async getReviews(params?: {
    page?: number;
    limit?: number;
    driverId?: string;
  }): Promise<PaginatedResponse<Review>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getReviews API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createReview(data: Partial<Review>): Promise<Review> {
    try {
      const res = await api.post<ApiResponse<Review>>('/reviews', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createReview API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    try {
      const res = await api.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ updateReview API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // ⭐ MODIFIED METHOD: deleteReview to return boolean ⭐
  async deleteReview(id: string): Promise<boolean> {
    try {
      await api.delete<ApiResponse<void>>(`/reviews/${id}`);
      return true; // Return true on success
    } catch (error: any) {
      console.error("❌ deleteReview API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  // NOTIFICATIONS
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    userId?: string;
  }): Promise<PaginatedResponse<Notification>> {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params });
      return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    } catch (error: any) {
      console.error("❌ getNotifications API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    try {
      const res = await api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ markNotificationAsRead API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    try {
      const res = await api.post<ApiResponse<Notification>>('/notifications', data);
      return res.data.data;
    } catch (error: any) {
      console.error("❌ createNotification API call failed. Error:", error.response?.data || error.message || error);
      throw error;
    }
  }
}

export const rideshareService = new RideshareService();
