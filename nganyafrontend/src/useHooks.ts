import { useMutation, useQuery, useQueryClient, useQueries, type UseQueryResult } from '@tanstack/react-query';

import { useMemo } from 'react';
import {
  type User,
  type Vehicle,
  type Route,
  type Ride,
  type Booking,
  type Delivery,
  type Payment,
  type Review,
  type Notification,
  type PaginatedResponse,
  type CreateVehicleRequest,
  type VehicleType,
  VehicleStatus,
  // Import UserRole enum
  type DriverDashboardStats,
  UserRole,
} from './lib/types';
import { rideshareService } from './lib/dashboard-service';
import { useAuth } from './contexts/AuthContext'; // Import useAuth to get the current user

// Helper to normalize paginated responses if the service doesn't consistently return { data: T[], total: number }
const normalizePaginatedResponse = <T>(data: any, page: number = 1, limit: number = 10): PaginatedResponse<T> => {
  const items: T[] = data?.data || data?.items || data?.results || (Array.isArray(data) ? data : []);
  const total: number = data?.total || data?.count || (Array.isArray(data) ? data.length : 0);
  const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    data: items,
    items: items, // Keep for backward compatibility if needed
    total: total,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || totalPages,
    hasNextPage: data?.hasNextPage || (page < totalPages),
    hasPreviousPage: data?.hasPreviousPage || (page > 1),
  };
};

export const useAdminStats = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['users', 1, 1000],
        queryFn: () => rideshareService.getUsers({ page: 1, limit: 1000 }),
        select: (data) => normalizePaginatedResponse<User>(data),
      },
      {
        queryKey: ['drivers', 1, 1000], // Still keep a 'drivers' key but fetch from users endpoint
        queryFn: () => rideshareService.getUsers({ page: 1, limit: 1000, role: UserRole.Driver }),
        select: (data) => normalizePaginatedResponse<User>(data),
      },
      {
        queryKey: ['vehicles', 1, 1000],
        queryFn: () => rideshareService.getVehicles({ page: 1, limit: 1000 }),
        select: (data) => normalizePaginatedResponse<Vehicle>(data),
      },
      {
        queryKey: ['rides', 1, 1000],
        queryFn: () => rideshareService.getRides({ page: 1, limit: 1000 }),
        select: (data) => normalizePaginatedResponse<Ride>(data),
      },
      {
        queryKey: ['bookings', 1, 1000],
        queryFn: () => rideshareService.getBookings({ page: 1, limit: 1000 }),
        select: (data) => normalizePaginatedResponse<Booking>(data),
      },
      {
        queryKey: ['reviews', 1, 1000],
        queryFn: () => rideshareService.getReviews({ page: 1, limit: 1000 }),
        select: (data) => normalizePaginatedResponse<Review>(data),
      },
    ],
  });

  const [
    usersResult,
    driversResult,
    vehiclesResult,
    ridesResult,
    bookingsResult,
    reviewsResult,
  ] = queries;

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return {
      totalUsers: usersResult.data?.total || 0,
      activeDrivers:
        driversResult.data?.data?.filter(
          // ⭐ FIX: Filter by approved status AND online status ⭐
          (u: User) => u.role === UserRole.Driver && u.driverStatus === 'approved' && u.isOnline === true
        ).length || 0,
      totalVehicles: vehiclesResult.data?.total || 0,
      monthlyRevenue:
        bookingsResult.data?.data?.reduce((sum: number, booking: Booking) => {
          const bookingDate = new Date(booking.createdAt);
          if (
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear &&
            booking.status === 'completed'
          ) {
            return sum + (booking.ride?.fare || 0);
          }
          return sum;
        }, 0) || 0,
      totalRides: ridesResult.data?.total || 0,
      totalBookings: bookingsResult.data?.total || 0,
      completionRate: ridesResult.data?.data?.length
        ? (ridesResult.data.data.filter((r: Ride) => r.status === 'completed').length /
            ridesResult.data.data.length) *
            100
        : 0,
      averageRating: reviewsResult.data?.data?.length
        ? reviewsResult.data.data.reduce((sum: number, review: Review) => sum + review.rating, 0) /
            reviewsResult.data.data.length
        : 0,
      supportTickets: 0,
    };
  }, [queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.isError)?.error;

  return { stats, isLoading, isError, error };
};

export const useGlobalCounts = () => {
  return useQuery<DriverDashboardStats, Error>({
    queryKey: ['globalAdminStats'],
    queryFn: () => rideshareService.getAdminStats(),
  });
};

// ⭐ NEW: useDriverStats hook ⭐
export const useDriverStats = () => {
  return useQuery<DriverDashboardStats, Error>({
    queryKey: ['driverStats'],
    queryFn: () => rideshareService.getDriverStats(),
  });
};

// ⭐ NEW: useDriverVehicle hook ⭐
export const useDriverVehicle = () => {
  return useQuery<Vehicle | null, Error>({
    queryKey: ['driverVehicle'],
    queryFn: () => rideshareService.getDriverVehicle(),
  });
};

// ⭐ NEW: useDriverRides hook ⭐
export const useDriverRides = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery<PaginatedResponse<Ride>, Error>({
    queryKey: ['driverRides', params], // Include params in query key for caching
    queryFn: () => rideshareService.getDriverRides(params),
    select: (data) => normalizePaginatedResponse<Ride>(data),
  });
};

// ⭐ UPDATED: useUpdateDriverLocation hook to return void ⭐
export const useUpdateDriverLocation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the authenticated user

  return useMutation<void, Error, { latitude: number; longitude: number }>({ // ⭐ FIX: Changed return type from User to void ⭐
    mutationFn: async ({ latitude, longitude }) => {
      if (!user?.id) {
        throw new Error('User not authenticated for location update.');
      }
      // Rely on the backend's /users/location endpoint to get the user ID from the token.
      // The service method should not take a userId parameter here.
      return rideshareService.updateDriverLocation(latitude, longitude);
    },
    onSuccess: () => {
      // Invalidate queries that depend on driver location if necessary
      queryClient.invalidateQueries({ queryKey: ['driverStats'] });
      // You might also invalidate 'nearestDrivers' if this driver's location affects that list for others
      queryClient.invalidateQueries({ queryKey: ['nearestDrivers'] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] }); // Invalidate the user's own profile
    },
    onError: (error) => {
      console.error('Failed to update driver location:', error);
    },
  });
};

// ⭐ UPDATED: useUpdateDriverStatus hook to return void ⭐
export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the authenticated user

  return useMutation<void, Error, { isOnline: boolean }>({ // ⭐ FIX: Changed return type from User to void ⭐
    mutationFn: async ({ isOnline }) => {
      if (!user?.id) {
        throw new Error('User not authenticated for status update.');
      }
      // Rely on the backend's /users/me/status endpoint to get the user ID from the token.
      // The service method should not take a userId parameter here.
      return rideshareService.updateDriverStatus(isOnline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['globalAdminStats'] });
      queryClient.invalidateQueries({ queryKey: ['driverStats'] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] }); // Invalidate the user's own profile
    },
    onError: (error) => {
      console.error('Failed to update driver online status:', error);
    },
  });
};

// ======================== USER HOOKS ========================
export const useUsers = (page = 1, limit = 10, role?: UserRole, search?: string) =>
  useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', page, limit, role, search],
    queryFn: () => rideshareService.getUsers({ page, limit, role, q: search }),
    select: (data) => normalizePaginatedResponse<User>(data),
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Parameters<typeof rideshareService.createUser>[0]>({
    mutationFn: rideshareService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: Partial<User> }>({
    mutationFn: ({ id, data }) => rideshareService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'User' to 'void' ⭐
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

// ======================== VEHICLE HOOKS ========================
export const useVehicles = (page = 1, limit = 10, type?: VehicleType, status?: VehicleStatus, searchTerm?: string) =>
  useQuery<PaginatedResponse<Vehicle>, Error>({
    queryKey: ['vehicles', page, limit, type, status, searchTerm],
    queryFn: () => rideshareService.getVehicles({ page, limit, type, status, q: searchTerm }),
    select: (data) => normalizePaginatedResponse<Vehicle>(data),
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, CreateVehicleRequest>({
    mutationFn: rideshareService.createVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; data: Partial<Vehicle> }>({
    mutationFn: ({ id, data }) => rideshareService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Vehicle' to 'void' ⭐
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

// ======================== DRIVER HOOKS (Now operating on User type with driver role) ========================
export const useDrivers = (page = 1, limit = 10, searchTerm?: string) =>
  useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['drivers', page, limit, searchTerm],
    queryFn: () => rideshareService.getUsers({ page, limit, role: UserRole.Driver, q: searchTerm }),
    select: (data) => normalizePaginatedResponse<User>(data),
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Parameters<typeof rideshareService.createUser>[0]>({
    mutationFn: (data) => rideshareService.createUser({ ...data, role: UserRole.Driver }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: Partial<User> }>({
    mutationFn: ({ id, data }) => rideshareService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'User' to 'void' ⭐
  // This aligns with the `rideshareService.deleteUser` method's return type `Promise<void>`.
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

// ======================== ROUTE HOOKS ========================
export const useRoutes = (page = 1, limit = 10) =>
  useQuery<PaginatedResponse<Route>, Error>({
    queryKey: ['routes', page, limit],
    queryFn: () => rideshareService.getRoutes({ page, limit }),
    select: (data) => normalizePaginatedResponse<Route>(data),
  });

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<Route, Error, Partial<Route>>({
    mutationFn: rideshareService.createRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<Route, Error, { id: string; data: Partial<Route> }>({
    mutationFn: ({ id, data }) => rideshareService.updateRoute(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Route' to 'void' ⭐
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

// ======================== RIDE HOOKS ========================
export const useRides = (page = 1, limit = 10, status?: string) =>
  useQuery<PaginatedResponse<Ride>, Error>({
    queryKey: ['rides', page, limit, status],
    queryFn: () => rideshareService.getRides({ page, limit, status }),
    select: (data) => normalizePaginatedResponse<Ride>(data),
  });

export const useCreateRide = () => {
  const queryClient = useQueryClient();
  return useMutation<Ride, Error, Partial<Ride>>({
    mutationFn: rideshareService.createRide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

export const useUpdateRide = () => {
  const queryClient = useQueryClient();
  return useMutation<Ride, Error, { id: string; data: Partial<Ride> }>({
    mutationFn: ({ id, data }) => rideshareService.updateRide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

export const useDeleteRide = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Ride' to 'void' ⭐
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteRide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

// ======================== BOOKING HOOKS ========================
export const useBookings = (page = 1, limit = 10, status?: string, type?: 'ride' | 'delivery') =>
  useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ['bookings', page, limit, status, type],
    queryFn: () => rideshareService.getBookings({ page, limit, status, type }),
    select: (data) => normalizePaginatedResponse<Booking>(data),
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, Partial<Booking>>({
    mutationFn: rideshareService.createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { id: string; data: Partial<Booking> }>({
    mutationFn: ({ id, data }) => rideshareService.updateBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Booking' to 'void' ⭐
  // This aligns with the `rideshareService.deleteBooking` method's return type `Promise<void>`.
  return useMutation<void, Error, string>({
    mutationFn: (id) => rideshareService.deleteBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

// ======================== DELIVERY HOOKS ========================
interface UseDeliveriesParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  driverId?: string;
  q?: string; // For general search
}

export function useDeliveries(params?: UseDeliveriesParams): UseQueryResult<PaginatedResponse<Delivery>, Error> {
  const queryParams = {
    page: params?.page || 1,
    limit: params?.limit || 10,
    status: params?.status,
    userId: params?.userId,
    driverId: params?.driverId,
    q: params?.q,
  };

  return useQuery<PaginatedResponse<Delivery>, Error>({
    queryKey: ['deliveries', queryParams],
    queryFn: () => rideshareService.getDeliveries(queryParams),
    select: (data) => normalizePaginatedResponse<Delivery>(data),
  });
}

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation<Delivery, Error, Partial<Delivery>>({
    mutationFn: rideshareService.createDelivery,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation<Delivery, Error, { id: string; data: Partial<Delivery> }>({
    mutationFn: ({ id, data }) => rideshareService.updateDelivery(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Delivery' to 'void' ⭐
  // This aligns with the `rideshareService.deleteDelivery` method's return type `Promise<void>`.
  return useMutation<void, Error, string>({ // Changed from boolean to void as per dashboard-service.ts
    mutationFn: (id) => rideshareService.deleteDelivery(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

// ======================== PAYMENT HOOKS ========================
export const usePayments = (page = 1, limit = 10, status?: string) =>
  useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ['payments', page, limit, status],
    queryFn: () => rideshareService.getPayments({ page, limit, status }),
    select: (data) => normalizePaginatedResponse<Payment>(data),
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, Partial<Payment>>({
    mutationFn: rideshareService.createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, { id: string; data: Partial<Payment> }>({
    mutationFn: ({ id, data }) => rideshareService.updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Payment' to 'void' ⭐
  // This aligns with the `rideshareService.deletePayment` method's return type `Promise<void>`.
  return useMutation<void, Error, string>({ // Changed from boolean to void as per dashboard-service.ts
    mutationFn: (id) => rideshareService.deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

// ======================== REVIEW HOOKS ========================
export const useReviews = (page = 1, limit = 10, driverId?: string) =>
  useQuery<PaginatedResponse<Review>, Error>({
    queryKey: ['reviews', page, limit, driverId],
    queryFn: () => rideshareService.getReviews({ page, limit, driverId }),
    select: (data) => normalizePaginatedResponse<Review>(data),
  });

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, Partial<Review>>({
    mutationFn: rideshareService.createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, { id: string; data: Partial<Review> }>({
    mutationFn: ({ id, data }) => rideshareService.updateReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  // ⭐ FIX: Change the first type argument from 'Review' to 'void' ⭐
  // This aligns with the `rideshareService.deleteReview` method's return type `Promise<void>`.
  return useMutation<void, Error, string>({ // Changed from boolean to void as per dashboard-service.ts
    mutationFn: (id) => rideshareService.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

// ======================== NOTIFICATION HOOKS ========================
export const useNotifications = (page = 1, limit = 10, isRead?: boolean, userId?: string) => {
  return useQuery<PaginatedResponse<Notification>, Error>({
    queryKey: ['notifications', page, limit, isRead, userId],
    queryFn: () => rideshareService.getNotifications({ page, limit, isRead, userId }),
    select: (data) => normalizePaginatedResponse<Notification>(data),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, string>({
    mutationFn: (id) => rideshareService.markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, Partial<Notification>>({
    mutationFn: rideshareService.createNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};
