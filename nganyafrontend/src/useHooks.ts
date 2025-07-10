import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rideshareService } from './lib/dashboard-service'

// USERS
export const useUsers = (page = 1, limit = 10, role?: string) =>
  useQuery({
    queryKey: ['users', page, limit, role],
    queryFn: () => rideshareService.getUsers({ page, limit, role }),
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

// VEHICLES
export const useVehicles = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['vehicles', page, limit],
    queryFn: () => rideshareService.getVehicles({ page, limit }),
  })

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

// DRIVERS
export const useDrivers = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['drivers', page, limit],
    queryFn: () => rideshareService.getDrivers({ page, limit }),
  })

export const useCreateDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createDriver,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useUpdateDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateDriver(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export const useDeleteDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

// ROUTES
export const useRoutes = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['routes', page, limit],
    queryFn: () => rideshareService.getRoutes({ page, limit }),
  })

export const useCreateRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}

export const useUpdateRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateRoute(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}

export const useDeleteRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}

// RIDES
export const useRides = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['rides', page, limit, status],
    queryFn: () => rideshareService.getRides({ page, limit, status }),
  })

export const useCreateRide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createRide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  })
}

export const useUpdateRide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateRide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  })
}

export const useDeleteRide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteRide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rides'] }),
  })
}

// BOOKINGS
export const useBookings = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['bookings', page, limit, status],
    queryFn: () => rideshareService.getBookings({ page, limit, status }),
  })

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export const useDeleteBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

// DELIVERIES
export const useDeliveries = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['deliveries', page, limit, status],
    queryFn: () => rideshareService.getDeliveries({ page, limit, status }),
  })

export const useCreateDelivery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createDelivery,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })
}

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateDelivery(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })
}

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteDelivery(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })
}

// PAYMENTS
export const usePayments = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['payments', page, limit],
    queryFn: () => rideshareService.getPayments({ page, limit }),
  })

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

// REVIEWS
export const useReviews = (page = 1, limit = 10, driverId?: string) =>
  useQuery({
    queryKey: ['reviews', page, limit, driverId],
    queryFn: () => rideshareService.getReviews({ page, limit, driverId }),
  })

export const useCreateReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rideshareService.createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

export const useUpdateReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rideshareService.updateReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

// NOTIFICATIONS
export const useNotifications = (page = 1, limit = 10, isRead?: boolean) =>
  useQuery({
    queryKey: ['notifications', page, limit, isRead],
    queryFn: () =>
      rideshareService.getNotifications({ page, limit, isRead }),
  })

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rideshareService.markNotificationAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
