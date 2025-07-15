// src/useHooks.ts
import { useMutation, useQuery, useQueryClient, useQueries, type UseQueryResult } from '@tanstack/react-query';

import { useMemo } from 'react';
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
  CreateVehicleRequest,
  VehicleType,
  VehicleStatus, // Import this for mutation types
} from './lib/types';
import { rideshareService } from './lib/dashboard-service';
// Import enums from your types.ts

export const useAdminStats = () => {
  // Use useQueries to fetch all data in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: ['users', 1, 1000],
        queryFn: () => rideshareService.getUsers({ page: 1, limit: 1000 }),
         select: (data: any) => ({
          items: data.results || data.items || data.data?.items || data,
          total: data.total || data.count || data.data?.total || data.length || 0
        })
      },
      {
        queryKey: ['drivers', 1, 1000],
        queryFn: () => rideshareService.getDrivers({ page: 1, limit: 1000 })
      },
      {
        queryKey: ['vehicles', 1, 1000],
        queryFn: () => rideshareService.getVehicles({ page: 1, limit: 1000 }),
        
      },
      {
        queryKey: ['rides', 1, 1000],
        queryFn: () => rideshareService.getRides({ page: 1, limit: 1000 })
      },
      {
        queryKey: ['bookings', 1, 1000],
        queryFn: () => rideshareService.getBookings({ page: 1, limit: 1000 })
      },
      {
        queryKey: ['reviews', 1, 1000],
        queryFn: () => rideshareService.getReviews({ page: 1, limit: 1000 })
      }
    ]
  });

  // Destructure the query results
  const [
    usersResult,
    driversResult,
    vehiclesResult,
    ridesResult,
    bookingsResult,
    reviewsResult
  ] = queries;

  // Calculate stats
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return {
      totalUsers: usersResult.data?.total || 0,
      activeDrivers: driversResult.data?.data?.filter((d: Driver) => d.status === 'active').length || 0, // Assuming Driver has status
      totalVehicles: vehiclesResult.data?.total || 0,
      monthlyRevenue: bookingsResult.data?.data?.reduce((sum: number, booking: Booking) => {
        const bookingDate = new Date(booking.createdAt);
        // Assuming booking has a 'fare' or 'cost' property for revenue calculation.
        // If not, you might need to fetch payments or derive from rides.
        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear && booking.status === 'completed') {
          // You might need to link bookings to rides to get the fare, or have fare directly on booking
          return sum + (booking.ride?.fare || 0); // Adjust this based on where your revenue amount is stored
        }
        return sum;
      }, 0) || 0,
      totalRides: ridesResult.data?.total || 0,
      totalBookings: bookingsResult.data?.total || 0,
      completionRate: ridesResult.data?.data?.length ?
        (ridesResult.data.data.filter((r: Ride) => r.status === 'completed').length / ridesResult.data.data.length * 100) : 0,
      averageRating: reviewsResult.data?.data?.length ?
        reviewsResult.data.data.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviewsResult.data.data.length : 0,
      supportTickets: 0, // Placeholder, you'd need an API for this
    };
  }, [queries]);

  // Check loading state
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);
  const error = queries.find(q => q.isError)?.error; // Get the first error if any

  return { stats, isLoading, isError, error };
};

export const useGlobalCounts = () => {
  
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => rideshareService.getDriversStats(),
  });
};
const normalizeArrayResponse = <T>(data: any, page: number = 1, limit: number = 10): PaginatedResponse<T> => {
  let items: T[] = [];
  let total: number = 0;

  // --- CRITICAL CHANGE HERE ---
  // If 'data' itself is the array of items (which your console logs indicate for getVehicles)
  if (Array.isArray(data)) {
    items = data;
    total = data.length; // Total is simply the length of the array
  } else {
    // Fallback for when data is an object with nested properties (e.g., { results: [...] } or { items: [...] })
    items = data?.results || data?.items || data?.data?.items || data?.data || [];
    total = data?.total || data?.count || data?.data?.total || (Array.isArray(items) ? items.length : 0);
  }
  // --- END CRITICAL CHANGE ---

  const calculatedTotalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    items: items,
    total: total,
    data: items, // Often 'data' property mirrors 'items'
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || calculatedTotalPages,
    // Ensure you include any other properties defined in your PaginatedResponse<T>
    hasNextPage: data?.hasNextPage || (page < calculatedTotalPages), // Example for "2 more" properties
    hasPreviousPage: data?.hasPreviousPage || (page > 1), // Example for "2 more" properties
  };
};

// ======================== USER HOOKS ========================
export const useUsers = (page = 1, limit = 10, role?: string, search?: string) =>
  useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', page, limit, role, search],
    queryFn: () => rideshareService.getUsers({ page, limit, role, q: search }),
     select: (data) => ({
      items: data.results || data.items || data.data?.items || data,
      total: data.total || data.count || data.data?.total || data.length || 0
    })
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Parameters<typeof rideshareService.createUser>[0]>({ // Dynamically infer type
    mutationFn: rideshareService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: Partial<User> }>({
    mutationFn: ({ id, data }) =>
      rideshareService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (id) => rideshareService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};


// ======================== VEHICLE HOOKS ========================
export const useVehicles = (page = 1, limit = 10, type?: VehicleType, status?: VehicleStatus, searchTerm?: string) =>
  useQuery<PaginatedResponse<Vehicle>, Error>({
    queryKey: ['vehicles', page, limit, type, status, searchTerm],
    queryFn: () => rideshareService.getVehicles({ page, limit, type, status, q: searchTerm }),
   
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, CreateVehicleRequest>({ // Use CreateVehicleRequest from your types
    mutationFn: rideshareService.createVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; data: Partial<Vehicle> }>({
    mutationFn: ({ id, data }) =>
      rideshareService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, string>({
    mutationFn: (id) => rideshareService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};


// ======================== DRIVER HOOKS ========================
export const useDrivers = (page = 1, limit = 10, searchTerm?: string) =>
  useQuery<PaginatedResponse<Driver>, Error>({
    queryKey: ['drivers', page, limit, searchTerm],
    queryFn: () => rideshareService.getDrivers({ page, limit, q: searchTerm }),
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation<Driver, Error, Parameters<typeof rideshareService.createDriver>[0]>({
    mutationFn: rideshareService.createDriver,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation<Driver, Error, { id: string; data: Partial<Driver> }>({
    mutationFn: ({ id, data }) =>
      rideshareService.updateDriver(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation<Driver, Error, string>({
    mutationFn: (id) => rideshareService.deleteDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};


// ======================== ROUTE HOOKS ========================
export const useRoutes = (page = 1, limit = 10) =>
  useQuery<PaginatedResponse<Route>, Error>({
    queryKey: ['routes', page, limit],
    queryFn: () => rideshareService.getRoutes({ page, limit }),
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
    mutationFn: ({ id, data }) =>
      rideshareService.updateRoute(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<Route, Error, string>({
    mutationFn: (id) => rideshareService.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};


// ======================== RIDE HOOKS ========================
export const useRides = (page = 1, limit = 10, status?: string) =>
  useQuery<PaginatedResponse<Ride>, Error>({
    queryKey: ['rides', page, limit, status],
    queryFn: () => rideshareService.getRides({ page, limit, status }),
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
    mutationFn: ({ id, data }) =>
      rideshareService.updateRide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

export const useDeleteRide = () => {
  const queryClient = useQueryClient();
  return useMutation<Ride, Error, string>({
    mutationFn: (id) => rideshareService.deleteRide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};


// ======================== BOOKING HOOKS ========================
export const useBookings = (page = 1, limit = 10, status?: string, type?: 'ride' | 'delivery') =>
  useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ['bookings', page, limit, status, type],
    queryFn: () => rideshareService.getBookings({ page, limit, status, type }),
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
    mutationFn: ({ id, data }) =>
      rideshareService.updateBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, string>({
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
    queryKey: ['deliveries', queryParams], // Unique key for caching based on params
    queryFn: () => rideshareService.getDeliveries(queryParams),
    // You can add options like staleTime, refetchOnWindowFocus, etc.
    // staleTime: 1000 * 60 * 5, // 5 minutes
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
    mutationFn: ({ id, data }) =>
      rideshareService.updateDelivery(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation<Delivery, Error, string>({
    mutationFn: (id) => rideshareService.deleteDelivery(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};


// ======================== PAYMENT HOOKS ========================
export const usePayments = (page = 1, limit = 10, status?: string) =>
  useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ['payments', page, limit, status],
    queryFn: () => rideshareService.getPayments({ page, limit, status }),
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
    mutationFn: ({ id, data }) =>
      rideshareService.updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, string>({
    mutationFn: (id) => rideshareService.deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};


// ======================== REVIEW HOOKS ========================
export const useReviews = (page = 1, limit = 10, driverId?: string) =>
  useQuery<PaginatedResponse<Review>, Error>({
    queryKey: ['reviews', page, limit, driverId],
    queryFn: () => rideshareService.getReviews({ page, limit, driverId }),
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
    mutationFn: ({ id, data }) =>
      rideshareService.updateReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, string>({
    mutationFn: (id) => rideshareService.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};


// ======================== NOTIFICATION HOOKS ========================
export const useNotifications = (page = 1, limit = 10, isRead?: boolean, userId?: string) => {
  return useQuery<PaginatedResponse<Notification>, Error>({
    queryKey: ['notifications', page, limit, isRead, userId],
    queryFn: () => rideshareService.getNotifications({ page, limit, isRead, userId }),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, string>({ // Changed return type to Notification since your service returns it
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