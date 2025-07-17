// src/lib/dashboard-service.ts
import { api } from './api'; // Assuming 'api' is your configured axios instance or fetch wrapper
import type {
  User,
  Vehicle,
  Driver,
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
  CreateUserRequest,
  DriverDashboardStats,
} from './types';

class RideshareService {
  // Add this to your RideshareService class
  async getAdminStats() {
    try {
      const res = await api.get('/admin/stats');
      return res.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalUsers: 0,
        activeDrivers: 0,
        totalVehicles: 0,
        monthlyRevenue: 0,
        totalRides: 0,
        totalBookings: 0,
        completionRate: 0,
        averageRating: 0,
        supportTickets: 0,
      };
    }
  }

  // Adjusted getDriverStats to match usage in DriverDashboard.tsx
  // Assumes backend infers driverId from authentication, or you'll need to pass it
  async getDriverStats(): Promise<DriverDashboardStats> {
    try {
      // Assuming the API endpoint for driver stats doesn't require a driverId if authenticated
      const res = await api.get(`/drivers/me/stats`); // Or just '/driver/stats' depending on your API
      return res.data;
    } catch (error) {
      console.error(`Error fetching driver stats:`, error);
      // Return default/empty stats in case of an error
      return {
        todayEarnings: 0, // Added based on DriverDashboard usage
        weeklyEarnings: 0, // Added based on DriverDashboard usage
        totalBookings: 0, // Added based on DriverDashboard usage (if applicable to driver)
        totalRides: 0, // Maps to totalRidesCompleted
        rating: 0, // Maps to averageRating
        completionRate: 0, // Mapped to completionRate
        hoursOnline: 0, // Maps to totalHoursOnline
      };
    }
  }

  // ⭐ NEW METHOD: updateDriverLocation ⭐
  async updateDriverLocation(latitude: number, longitude: number): Promise<void> {
    try {
      await api.post('/drivers/location', { latitude, longitude });
      console.log('Driver location updated successfully on server.');
    } catch (error) {
      console.error('Error sending driver location to server:', error);
      throw error; // Re-throw to be caught by the component
    }
  }

  // ⭐ NEW METHOD: updateRideStatus ⭐
  async updateRideStatus(rideId: string, status: string): Promise<Ride> {
    try {
      const res = await api.patch<ApiResponse<Ride>>(`/rides/${rideId}/status`, { status });
      return res.data.data;
    } catch (error) {
      console.error(`Error updating ride ${rideId} status to ${status}:`, error);
      throw error;
    }
  }

  // ⭐ NEW METHOD: getDriverVehicle ⭐
  async getDriverVehicle(): Promise<Vehicle | null> {
    try {
      const res = await api.get<ApiResponse<Vehicle>>('/drivers'); // Assuming endpoint to get current driver's vehicle
      return res.data.data;
    } catch (error) {
      console.error('Error fetching driver vehicle:', error);
      return null;
    }
  }

  // ⭐ NEW METHOD: getDriverRides (for pending/active rides for a specific driver) ⭐
  async getDriverRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    try {
      // Assuming an endpoint to get rides specific to the authenticated driver
      const res = await api.get<PaginatedResponse<Ride>>('/drivers', { params });
      return res.data; // Assuming this endpoint already returns a PaginatedResponse
    } catch (error) {
      console.error('Error fetching driver rides:', error);
      return {
        data: [],
        items: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  // USERS
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    q?: string; // Existing general search
    email?: string; // ⭐ Add email specific search ⭐
  }): Promise<PaginatedResponse<User>> {
    const currentPage = params?.page || 1;
    const currentLimit = params?.limit || 10;

    try {
      const res = await api.get<User[]>(
        '/users',
        { params },
      );

      const rawUsersArray = res.data;
      const totalItems = rawUsersArray.length;
      const totalPages = totalItems > 0 && currentLimit > 0 ? Math.ceil(totalItems / currentLimit) : 0;

      const paginatedResponse: PaginatedResponse<User> = {
        items: rawUsersArray,
        total: totalItems,
        data: rawUsersArray,
        page: currentPage,
        limit: currentLimit,
        totalPages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
      return paginatedResponse;
    } catch (error) {
      console.error("❌ getUsers API call failed. Error:", error);
      throw error;
    }
  }

  // ⭐ New createUser method ⭐
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const res = await api.post<User>('/users', data);

      console.log(" createUser API call successful. Data:", res.data);
      return res.data;
    } catch (error) {
      console.error(" createUser API call failed. Error:", error);
      throw error;
    }
  }


  async updateUser(id: string, data: Partial<User>) {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  }

  async deleteUser(id: string) {
    const res = await api.delete<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  }

  // VEHICLES
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    type?: VehicleType;
    status?: VehicleStatus;
    q?: string;
  }): Promise<PaginatedResponse<Vehicle>> { // ⭐ Explicitly declare return type as PaginatedResponse<Vehicle> ⭐
    const currentPage = params?.page || 1;
    const currentLimit = params?.limit || 10;

    try {
      // Your API consistently returns a plain array: Vehicle[]
      const res = await api.get<Vehicle[]>(
        '/vehicles',
        { params },
      );

      const rawVehiclesArray = res.data; // This is your [Vehicle, Vehicle, ...] array
      console.log(" getVehicles API call successful. Raw Data (Array):", rawVehiclesArray);

      // ⭐ Manually construct the PaginatedResponse<Vehicle> here ⭐
      const totalItems = rawVehiclesArray.length; // If your API doesn't provide total, use array length
      const totalPages = totalItems > 0 && currentLimit > 0 ? Math.ceil(totalItems / currentLimit) : 0;

      const paginatedResponse: PaginatedResponse<Vehicle> = {
        items: rawVehiclesArray,
        total: totalItems,
        data: rawVehiclesArray, // Often 'data' property mirrors 'items'
        page: currentPage,
        limit: currentLimit,
        totalPages: totalPages,
        // Add any other properties defined in your PaginatedResponse<Vehicle>
        // with sensible default/derived values.
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };

      console.log("⭐ getVehicles API call: Formatted PaginatedResponse:", paginatedResponse);
      return paginatedResponse; // Return the fully formed paginated object

    } catch (error) {
      console.error("❌ getVehicles API call failed. Error:", error);

      throw error;
    }
  }

  async createVehicle(data: Partial<Vehicle>) {
    const res = await api.post<ApiResponse<Vehicle>>('/vehicles', data);
    return res.data.data;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const res = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);
    return res.data.data;
  }

  async deleteVehicle(id: string) {
    const res = await api.delete<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return res.data.data;
  }

  // DRIVERS
  async getDrivers(params?: {
    page?: number;
    limit?: number;
    q?: string; // General search
    // Add other filter parameters like status, vehicleId etc. if your API supports them
  }): Promise<PaginatedResponse<Driver>> {
    const currentPage = params?.page || 1;
    const currentLimit = params?.limit || 10;

    try {
      // Assuming your API for drivers also returns a plain array: Driver[]
      const res = await api.get<Driver[]>(
        '/drivers',
        { params },
      );

      const rawDriversArray = res.data;
      console.log("✅ getDrivers API call successful. Raw Data (Array):", rawDriversArray);

      const totalItems = rawDriversArray.length; // Or fetch from headers if API provides total count
      const totalPages = totalItems > 0 && currentLimit > 0 ? Math.ceil(totalItems / currentLimit) : 0;

      const paginatedResponse: PaginatedResponse<Driver> = {
        items: rawDriversArray,
        total: totalItems,
        data: rawDriversArray,
        page: currentPage,
        limit: currentLimit,
        totalPages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };

      console.log("⭐ getDrivers API call: Formatted PaginatedResponse:", paginatedResponse);
      return paginatedResponse;

    } catch (error) {
      console.error(" getDrivers API call failed. Error:", error);
      throw error;
    }
  }

  async createDriver(data: Partial<Driver>) {
    const res = await api.post<ApiResponse<Driver>>('/drivers', data);
    return res.data.data;
  }

  async updateDriver(id: string, data: Partial<Driver>) {
    const res = await api.patch<ApiResponse<Driver>>(`/drivers/${id}`, data);
    return res.data.data;
  }

  async deleteDriver(id: string) {
    const res = await api.delete<ApiResponse<Driver>>(`/drivers/${id}`);
    return res.data.data;
  }

  // ROUTES
  async getRoutes(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Route>>>(
      '/routes',
      { params },
    );
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async createRoute(data: Partial<Route>) {
    const res = await api.post<ApiResponse<Route>>('/routes', data);
    return res.data.data;
  }

  async updateRoute(id: string, data: Partial<Route>) {
    const res = await api.patch<ApiResponse<Route>>(`/routes/${id}`, data);
    return res.data.data;
  }

  async deleteRoute(id: string) {
    const res = await api.delete<ApiResponse<Route>>(`/routes/${id}`);
    return res.data.data;
  }

  // RIDES
  async getRides(params?: { page?: number; limit?: number; status?: string }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Ride>>>('/rides', {
      params,
    });
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async createRide(data: Partial<Ride>) {
    const res = await api.post<ApiResponse<Ride>>('/rides', data);
    return res.data.data;
  }

  async updateRide(id: string, data: Partial<Ride>) {
    const res = await api.patch<ApiResponse<Ride>>(`/rides/${id}`, data);
    return res.data.data;
  }

  async deleteRide(id: string) {
    const res = await api.delete<ApiResponse<Ride>>(`/rides/${id}`);
    return res.data.data;
  }

  // BOOKINGS
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string; // Add type filter here if your API supports it
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      '/bookings',
      { params },
    );
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async createBooking(data: Partial<Booking>) {
    const res = await api.post<ApiResponse<Booking>>('/bookings', data);
    return res.data.data;
  }

  async updateBooking(id: string, data: Partial<Booking>) {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return res.data.data;
  }

  async deleteBooking(id: string) {
    const res = await api.delete<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
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
    } catch (error) {
      console.error(" getDeliveries API call failed. Error:", error);
      throw error;
    }
  };

  // Example for fetching a single delivery if needed later
  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const res = await api.get<Delivery>(`/deliveries/${id}`);
      return res.data;
    } catch (error) {
      console.error(` getDeliveryById API call for ID ${id} failed. Error:`, error);
      throw error;
    }
  };

  async createDelivery(data: Partial<Delivery>) {
    const res = await api.post<ApiResponse<Delivery>>('/deliveries', data);
    return res.data.data;
  }

  async updateDelivery(id: string, data: Partial<Delivery>) {
    const res = await api.patch<ApiResponse<Delivery>>(
      `/deliveries/${id}`,
      data,
    );
    return res.data.data;
  }

  async deleteDelivery(id: string) {
    const res = await api.delete<ApiResponse<Delivery>>(`/deliveries/${id}`);
    return res.data.data;
  }

  // PAYMENTS
  async getPayments(params?: { page?: number; limit?: number; status?: string }) { // Added status filter based on common use case
    const res = await api.get<ApiResponse<PaginatedResponse<Payment>>>(
      '/payments',
      { params },
    );
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async createPayment(data: Partial<Payment>) {
    const res = await api.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  }

  async updatePayment(id: string, data: Partial<Payment>) {
    const res = await api.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
    return res.data.data;
  }

  async deletePayment(id: string) {
    const res = await api.delete<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  }

  // REVIEWS
  async getReviews(params?: {
    page?: number;
    limit?: number;
    driverId?: string;
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Review>>>(
      '/reviews',
      { params },
    );
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async createReview(data: Partial<Review>) {
    const res = await api.post<ApiResponse<Review>>('/reviews', data);
    return res.data.data;
  }

  async updateReview(id: string, data: Partial<Review>) {
    const res = await api.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
    return res.data.data;
  }

  async deleteReview(id: string) {
    const res = await api.delete<ApiResponse<Review>>(`/reviews/${id}`);
    return res.data.data;
  }

  // NOTIFICATIONS
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    userId?: string; // Added userId for filtering notifications
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
      '/notifications',
      { params },
    );
    return res.data?.data ?? { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }

  async markNotificationAsRead(notificationId: string) {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
    return res.data.data; // Assuming it returns the updated notification
  }

  async createNotification(data: Partial<Notification>) {
    const res = await api.post<ApiResponse<Notification>>('/notifications', data);
    return res.data.data;
  }
}

export const rideshareService = new RideshareService();