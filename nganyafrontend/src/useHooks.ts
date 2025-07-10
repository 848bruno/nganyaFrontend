import { useMutation, useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { rideshareService } from './lib/dashboard-service';
import { useMemo } from 'react';


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
        queryFn: () => rideshareService.getVehicles({ page: 1, limit: 1000 })
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
      activeDrivers: driversResult.data?.items?.filter((d: any) => d.status === 'active').length || 0,
      totalVehicles: vehiclesResult.data?.total || 0,
      monthlyRevenue: bookingsResult.data?.items?.reduce((sum: number, booking: any) => {
        const bookingDate = new Date(booking.createdAt);
        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          return sum + (booking.fare || 0);
        }
        return sum;
      }, 0) || 0,
      totalRides: ridesResult.data?.total || 0,
      totalBookings: bookingsResult.data?.total || 0,
      completionRate: ridesResult.data?.items ? 
        (ridesResult.data.items.filter((r: any) => r.status === 'completed').length / ridesResult.data.items.length * 100) : 0,
      averageRating: reviewsResult.data?.items?.length ? 
        reviewsResult.data.items.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsResult.data.items.length : 0,
    };
  }, [queries]);

  // Check loading state
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  return { stats, isLoading, isError };
};

// ======================== USER HOOKS ========================
export const useUsers = (page = 1, limit = 10, role?: string, search?: string) => 
  useQuery({
    queryKey: ['users', page, limit, role, search],
    queryFn: () => rideshareService.getUsers({ page, limit, role, q: search }),
    select: (data) => ({
      items: data.results || data.items || data.data?.items || data,
      total: data.total || data.count || data.data?.total || data.length || 0
    })
  });
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

// ======================== VEHICLE HOOKS ========================
export const useVehicles = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['vehicles', page, limit, status],
    queryFn: () => rideshareService.getVehicles({ page, limit, status }),
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
};

// ======================== DRIVER HOOKS ========================
export const useDrivers = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['drivers', page, limit],
    queryFn: () => rideshareService.getDrivers({ page, limit }),
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createDriver,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateDriver(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
};

// ======================== ROUTE HOOKS ========================
export const useRoutes = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['routes', page, limit],
    queryFn: () => rideshareService.getRoutes({ page, limit }),
  });

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateRoute(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
};

// ======================== RIDE HOOKS ========================
export const useRides = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['rides', page, limit, status],
    queryFn: () => rideshareService.getRides({ page, limit, status }),
  });

export const useCreateRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createRide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

export const useUpdateRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateRide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

export const useDeleteRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteRide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  });
};

// ======================== BOOKING HOOKS ========================
export const useBookings = (page = 1, limit = 10, status?: string, type?: string) =>
  useQuery({
    queryKey: ['bookings', page, limit, status, type],
    queryFn: () => rideshareService.getBookings({ page, limit, status, type }),
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

// ======================== DELIVERY HOOKS ========================
export const useDeliveries = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['deliveries', page, limit, status],
    queryFn: () => rideshareService.getDeliveries({ page, limit, status }),
  });

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createDelivery,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateDelivery(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteDelivery(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });
};

// ======================== PAYMENT HOOKS ========================
export const usePayments = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['payments', page, limit, status],
    queryFn: () => rideshareService.getPayments({ page, limit, status }),
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
};

// ======================== REVIEW HOOKS ========================
export const useReviews = (page = 1, limit = 10, driverId?: string) =>
  useQuery({
    queryKey: ['reviews', page, limit, driverId],
    queryFn: () => rideshareService.getReviews({ page, limit, driverId }),
  });

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      rideshareService.updateReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

// ======================== NOTIFICATION HOOKS ========================
export const useNotifications = (page = 1, limit = 10, isRead?: boolean, userId?: string) =>
  useQuery({
    queryKey: ['notifications', page, limit, isRead, userId],
    queryFn: () => rideshareService.getNotifications({ page, limit, isRead, userId }),
  });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideshareService.markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rideshareService.createNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};