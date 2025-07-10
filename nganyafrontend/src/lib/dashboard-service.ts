import { api } from './api'
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
} from './types'

class RideshareService {// Add this to your RideshareService class
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

  
  // USERS
  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const res = await api.get<PaginatedResponse<User>>('/users', { params }); // Remove ApiResponse wrapper
    return res.data ?? { items: [], total: 0 };
  }

  async createUser(data: Partial<User>) {
    const res = await api.post<ApiResponse<User>>('/users', data)
    return res.data.data
  }

  async updateUser(id: string, data: Partial<User>) {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data)
    return res.data.data
  }

  async deleteUser(id: string) {
    const res = await api.delete<ApiResponse<User>>(`/users/${id}`)
    return res.data.data
  }

  // VEHICLES
  async getVehicles(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Vehicle>>>(
      '/vehicles',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createVehicle(data: Partial<Vehicle>) {
    const res = await api.post<ApiResponse<Vehicle>>('/vehicles', data)
    return res.data.data
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const res = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data)
    return res.data.data
  }

  async deleteVehicle(id: string) {
    const res = await api.delete<ApiResponse<Vehicle>>(`/vehicles/${id}`)
    return res.data.data
  }

  // DRIVERS
  async getDrivers(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Driver>>>(
      '/drivers',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createDriver(data: Partial<Driver>) {
    const res = await api.post<ApiResponse<Driver>>('/drivers', data)
    return res.data.data
  }

  async updateDriver(id: string, data: Partial<Driver>) {
    const res = await api.patch<ApiResponse<Driver>>(`/drivers/${id}`, data)
    return res.data.data
  }

  async deleteDriver(id: string) {
    const res = await api.delete<ApiResponse<Driver>>(`/drivers/${id}`)
    return res.data.data
  }

  // ROUTES
  async getRoutes(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Route>>>(
      '/routes',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createRoute(data: Partial<Route>) {
    const res = await api.post<ApiResponse<Route>>('/routes', data)
    return res.data.data
  }

  async updateRoute(id: string, data: Partial<Route>) {
    const res = await api.patch<ApiResponse<Route>>(`/routes/${id}`, data)
    return res.data.data
  }

  async deleteRoute(id: string) {
    const res = await api.delete<ApiResponse<Route>>(`/routes/${id}`)
    return res.data.data
  }

  // RIDES
  async getRides(params?: { page?: number; limit?: number; status?: string }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Ride>>>('/rides', {
      params,
    })
      return res.data?.data?? {item :[], total: 0}
  }

  async createRide(data: Partial<Ride>) {
    const res = await api.post<ApiResponse<Ride>>('/rides', data)
    return res.data.data
  }

  async updateRide(id: string, data: Partial<Ride>) {
    const res = await api.patch<ApiResponse<Ride>>(`/rides/${id}`, data)
    return res.data.data
  }

  async deleteRide(id: string) {
    const res = await api.delete<ApiResponse<Ride>>(`/rides/${id}`)
    return res.data.data
  }

  // BOOKINGS
  async getBookings(params?: {
    page?: number
    limit?: number
    status?: string
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      '/bookings',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createBooking(data: Partial<Booking>) {
    const res = await api.post<ApiResponse<Booking>>('/bookings', data)
    return res.data.data
  }

  async updateBooking(id: string, data: Partial<Booking>) {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}`, data)
    return res.data.data
  }

  async deleteBooking(id: string) {
    const res = await api.delete<ApiResponse<Booking>>(`/bookings/${id}`)
    return res.data.data
  }

  // DELIVERIES
  async getDeliveries(params?: {
    page?: number
    limit?: number
    status?: string
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Delivery>>>(
      '/deliveries',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createDelivery(data: Partial<Delivery>) {
    const res = await api.post<ApiResponse<Delivery>>('/deliveries', data)
    return res.data.data
  }

  async updateDelivery(id: string, data: Partial<Delivery>) {
    const res = await api.patch<ApiResponse<Delivery>>(
      `/deliveries/${id}`,
      data,
    )
    return res.data.data
  }

  async deleteDelivery(id: string) {
    const res = await api.delete<ApiResponse<Delivery>>(`/deliveries/${id}`)
    return res.data.data
  }

  // PAYMENTS
  async getPayments(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Payment>>>(
      '/payments',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createPayment(data: Partial<Payment>) {
    const res = await api.post<ApiResponse<Payment>>('/payments', data)
    return res.data.data
  }

  async updatePayment(id: string, data: Partial<Payment>) {
    const res = await api.patch<ApiResponse<Payment>>(`/payments/${id}`, data)
    return res.data.data
  }

  async deletePayment(id: string) {
    const res = await api.delete<ApiResponse<Payment>>(`/payments/${id}`)
    return res.data.data
  }

  // REVIEWS
  async getReviews(params?: {
    page?: number
    limit?: number
    driverId?: string
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Review>>>(
      '/reviews',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async createReview(data: Partial<Review>) {
    const res = await api.post<ApiResponse<Review>>('/reviews', data)
    return res.data.data
  }

  async updateReview(id: string, data: Partial<Review>) {
    const res = await api.patch<ApiResponse<Review>>(`/reviews/${id}`, data)
    return res.data.data
  }

  async deleteReview(id: string) {
    const res = await api.delete<ApiResponse<Review>>(`/reviews/${id}`)
    return res.data.data
  }

  // NOTIFICATIONS
  async getNotifications(params?: {
    page?: number
    limit?: number
    isRead?: boolean
  }) {
    const res = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
      '/notifications',
      { params },
    )
     return res.data?.data?? {item :[], total: 0}
  }

  async markNotificationAsRead(notificationId: string) {
    await api.patch(`/notifications/${notificationId}/read`)
  }
}

export const rideshareService = new RideshareService()
