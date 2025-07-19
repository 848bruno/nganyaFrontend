// src/pages/DriverDashboard.tsx
import { useState, useEffect } from 'react'
import {
  Car,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Users,
  TrendingUp,
  Zap,
  Navigation,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

import { toast } from '@/components/ui/use-toast'
import {
  type User, // Import User type
  type Vehicle,
  type Ride,
  type DriverDashboardStats,
  UserRole,
  // Import UserRole
} from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext' // Import useAuth

// Import the new useGlobalCounts, useUpdateDriverStatus, useUpdateDriverLocation,
// useDriverStats, useDriverVehicle, useDriverRides hooks
import {
  useGlobalCounts,
  useUpdateDriverStatus,
  useUpdateDriverLocation,
  useDriverStats,
  useDriverVehicle,
  useDriverRides,
} from '@/useHooks' // Adjust path as needed

import { createFileRoute } from '@tanstack/react-router'
import { rideshareService } from '@/lib/dashboard-service'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/dashboard/driver')({
  component: DriverDashboard,
})

export default function DriverDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth() // Get the authenticated user from context

  // Use hooks to fetch driver-specific data
  // These hooks now implicitly fetch data for the authenticated driver via backend endpoints like /users/me/...
  const {
    data: driverStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useDriverStats()
  const {
    data: driverVehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useDriverVehicle()
  const {
    data: driverRidesData,
    isLoading: isLoadingRides,
    error: ridesError,
  } = useDriverRides({ limit: 10, status: 'pending' }) // Pass params to hook

  const [isOnline, setIsOnline] = useState(driverStats?.isOnline || false) // Initialize from fetched stats
  const [currentRide, setCurrentRide] = useState<Ride | null>(null)
  const [pendingRides, setPendingRides] = useState<Ride[]>([])

  // State for tracking current session online duration
  const [sessionOnlineDuration, setSessionOnlineDuration] = useState(0) // in seconds
  const [sessionIntervalId, setSessionIntervalId] =
    useState<NodeJS.Timeout | null>(null)

  // Mutations for updating driver status and location
  const updateDriverStatusMutation = useUpdateDriverStatus()
  const updateDriverLocationMutation = useUpdateDriverLocation()

  // Fetch global counts using TanStack Query
  const {
    data: globalCounts,
    isLoading: isLoadingGlobalCounts,
    isError: isErrorGlobalCounts,
    error: globalCountsError,
  } = useGlobalCounts()

  // Effect to update local state when driverStats are fetched
  useEffect(() => {
    if (driverStats && typeof driverStats.isOnline === 'boolean') {
      setIsOnline(driverStats.isOnline)
    }
  }, [driverStats])

  // Effect to update pending rides when driverRidesData changes
  useEffect(() => {
    if (driverRidesData?.data) {
      setPendingRides(
        driverRidesData.data.filter((ride) => ride.status === 'pending'),
      )
      const activeRide = driverRidesData.data.find(
        (ride) => ride.status === 'active',
      )
      if (activeRide) {
        setCurrentRide(activeRide)
      }
    }
  }, [driverRidesData])

  // Helper function to format duration for display
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  // ⭐ FIX: Separate useEffect for session timer to prevent infinite loop ⭐
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isOnline && user?.role === UserRole.Driver) {
      // Only start a new interval if one is not already running
      if (sessionIntervalId === null) {
        setSessionOnlineDuration(0) // Reset for a new session
        interval = setInterval(() => {
          setSessionOnlineDuration((prev) => prev + 1)
        }, 1000)
        setSessionIntervalId(interval)
      }
    } else {
      // Clear interval when going offline or user is not a driver
      if (sessionIntervalId) {
        clearInterval(sessionIntervalId)
        setSessionIntervalId(null)
      }
      setSessionOnlineDuration(0) // Reset duration when offline
    }

    // Cleanup function: clear the interval specific to this effect run
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isOnline, user?.role]) // Dependencies: only isOnline and user.role

  // ⭐ FIX: Separate useEffect for geolocation updates ⭐
  useEffect(() => {
    let watchId: number | null = null

    const sendLocationUpdate = (latitude: number, longitude: number) => {
      if (user?.role === UserRole.Driver && isOnline) {
        updateDriverLocationMutation.mutate(
          { latitude, longitude },
          {
            onError: (error) => {
              console.error('Error updating driver location:', error)
            },
          },
        )
      }
    }

    if (isOnline && user?.role === UserRole.Driver) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendLocationUpdate(position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.error('Initial Geolocation error:', error)
            toast({
              title: 'Geolocation Error',
              description:
                'Unable to get initial location. Please enable location services.',
              variant: 'destructive',
            })
            setIsOnline(false)
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        )

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            sendLocationUpdate(position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.error('Geolocation error:', error)
            toast({
              title: 'Geolocation Error',
              description:
                error.message ||
                'Unable to retrieve your location. Please enable location services.',
              variant: 'destructive',
            })
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        )
      } else {
        toast({
          title: 'Geolocation Not Supported',
          description: 'Your browser does not support geolocation.',
          variant: 'destructive',
        })
        setIsOnline(false)
      }
    }

    // Cleanup function: stop watching position
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isOnline, user?.role, updateDriverLocationMutation]) // Dependencies for geolocation

  const handleOnlineToggle = async (checked: boolean) => {
    if (!user || user.role !== UserRole.Driver) {
      toast({
        title: 'Permission Denied',
        description: 'You must be a driver to change online status.',
        variant: 'destructive',
      })
      return
    }

    setIsOnline(checked) // Optimistically update UI
    try {
      await updateDriverStatusMutation.mutateAsync({
        isOnline: checked,
      })
      toast({
        title: 'Status Updated',
        description: `You are now ${checked ? 'online' : 'offline'}.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating driver online status:', error)
      toast({
        title: 'Status Update Failed',
        description: 'Could not update your online status on the server.',
        variant: 'destructive',
      })
      setIsOnline(!checked) // Revert UI on error
    }
  }

  const handleAcceptRide = async (rideId: string) => {
    try {
      const acceptedRide = await rideshareService.updateRideStatus(
        rideId,
        'active',
      )
      setCurrentRide(acceptedRide)
      setPendingRides(pendingRides.filter((r) => r.id !== rideId))
      queryClient.invalidateQueries({ queryKey: ['driverRides'] }) // Invalidate pending rides cache
      queryClient.invalidateQueries({ queryKey: ['driverStats'] }) // Refresh driver stats

      toast({
        title: 'Ride Accepted',
        description: 'You have successfully accepted the ride request.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept ride.',
        variant: 'destructive',
      })
    }
  }

  const handleDeclineRide = async (rideId: string) => {
    try {
      await rideshareService.updateRideStatus(rideId, 'cancelled')
      setPendingRides(pendingRides.filter((r) => r.id !== rideId))
      queryClient.invalidateQueries({ queryKey: ['driverRides'] }) // Invalidate pending rides cache
      queryClient.invalidateQueries({ queryKey: ['driverStats'] }) // Refresh driver stats

      toast({
        title: 'Ride Declined',
        description: 'You have declined the ride request.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline ride.',
        variant: 'destructive',
      })
    }
  }

  const handleCompleteRide = async () => {
    if (!currentRide) return

    try {
      await rideshareService.updateRideStatus(currentRide.id, 'completed')
      setCurrentRide(null)

      // Refresh stats after completing ride to reflect new earnings/rides
      queryClient.invalidateQueries({ queryKey: ['driverStats'] }) // Refresh driver stats
      queryClient.invalidateQueries({ queryKey: ['globalAdminStats'] }) // Refresh global stats that might be affected
      queryClient.invalidateQueries({ queryKey: ['driverRides'] }) // Refresh driver rides

      toast({
        title: 'Ride Completed',
        description: 'The ride has been marked as completed.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete ride.',
        variant: 'destructive',
      })
    }
  }

  const weeklyGoal = {
    target: 1500, // Example target
    current: driverStats?.weeklyEarnings || 0, // Use optional chaining as driverStats might be undefined initially
    percentage: Math.min(
      ((driverStats?.weeklyEarnings || 0) / 1500) * 100,
      100,
    ),
  }

  // Combine loading states
  const overallLoading =
    isLoadingStats ||
    isLoadingVehicle ||
    isLoadingRides ||
    isLoadingGlobalCounts

  if (overallLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userType="driver" />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle errors
  if (statsError) {
    toast({
      title: 'Error loading driver stats',
      description: statsError.message || 'Failed to fetch driver statistics.',
      variant: 'destructive',
    })
  }
  if (vehicleError) {
    toast({
      title: 'Error loading vehicle info',
      description:
        vehicleError.message || 'Failed to fetch vehicle information.',
      variant: 'destructive',
    })
  }
  if (ridesError) {
    toast({
      title: 'Error loading rides',
      description: ridesError.message || 'Failed to fetch driver rides.',
      variant: 'destructive',
    })
  }
  if (isErrorGlobalCounts) {
    toast({
      title: 'Error loading global stats',
      description:
        globalCountsError?.message || 'Failed to fetch overall counts.',
      variant: 'destructive',
    })
  }

  // If user is not authenticated or not a driver, redirect or show an error
  if (!user || user.role !== UserRole.Driver) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userType={user?.role || 'customer'} />{' '}
        {/* Show appropriate sidebar */}
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center p-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You must be logged in as a driver to access this dashboard.
            </p>
            {/* Optionally, add a link to login or switch roles */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="driver" />

      <div className="flex-1 lg:ml-0">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Driver Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your rides and track earnings
              </p>
            </div>

            {/* Online Status Toggle */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? 'Available for rides' : 'Not accepting rides'}
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={handleOnlineToggle}
                className="data-[state=checked]:bg-green-600"
                disabled={updateDriverStatusMutation.isPending}
              />
              <div
                className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Current Ride */}
          {currentRide && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Current Ride
                  </CardTitle>
                  <Badge variant="default">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {/* Assuming ride.bookings[0].user has email for avatar generation */}
                    <AvatarImage
                      src={
                        currentRide.bookings?.[0]?.user?.email
                          ? `https://api.dicebear.com/7.x/initials/svg?seed=${currentRide.bookings[0].user.email}`
                          : '/placeholder.svg'
                      }
                    />
                    <AvatarFallback>
                      {currentRide.bookings?.[0]?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {currentRide.bookings?.[0]?.user?.name || 'Customer'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {driverStats?.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      ${currentRide.fare}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentRide.type}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">
                      Pickup: {currentRide.pickUpLocation.lat},{' '}
                      {currentRide.pickUpLocation.lng}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">
                      Destination: {currentRide.dropOffLocation.lat},{' '}
                      {currentRide.dropOffLocation.lng}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCompleteRide}
                  >
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Stats (Driver-specific and Total Bookings) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Today's Earnings
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${driverStats?.todayEarnings?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Rides (Driver)
                    </p>
                    <p className="text-2xl font-bold">
                      {driverStats?.totalRides || 0}
                    </p>
                  </div>
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hours Online
                    </p>
                    <p className="text-2xl font-bold">
                      {isOnline
                        ? formatDuration(sessionOnlineDuration)
                        : `${driverStats?.hoursOnline || 0}h`}
                    </p>
                    {isOnline && (
                      <p className="text-xs text-muted-foreground">
                        Current session
                      </p>
                    )}
                  </div>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {driverStats?.rating?.toFixed(1) || 'N/A'}
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {driverStats?.completionRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Total Bookings Card - Uses globalCounts data */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Bookings (Overall)
                    </p>
                    <p className="text-2xl font-bold">
                      {globalCounts?.totalBookings || 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    ${weeklyGoal.current.toFixed(2)} / ${weeklyGoal.target}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {weeklyGoal.percentage.toFixed(1)}% complete
                  </span>
                </div>
                <Progress value={weeklyGoal.percentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  ${(weeklyGoal.target - weeklyGoal.current).toFixed(2)}{' '}
                  remaining to reach your weekly goal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ride Requests */}
          {isOnline && pendingRides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Incoming Ride Requests
                  <Badge variant="secondary">{pendingRides.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              ride.bookings?.[0]?.user?.email
                                ? `https://api.dicebear.com/7.x/initials/svg?seed=${ride.bookings[0].user.email}`
                                : '/placeholder.svg'
                            }
                          />
                          <AvatarFallback>
                            {ride.bookings?.[0]?.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {ride.bookings?.[0]?.user?.name || 'Customer'}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">
                              {driverStats?.rating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          ${ride.fare}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ride.type}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">
                          Pickup: {ride.pickUpLocation.lat},{' '}
                          {ride.pickUpLocation.lng}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm">
                          Destination: {ride.dropOffLocation.lat},{' '}
                          {ride.dropOffLocation.lng}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAcceptRide(ride.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeclineRide(ride.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Vehicle Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {driverVehicle ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {driverVehicle.model} {driverVehicle.year}
                      </span>
                      <Badge
                        variant={
                          driverVehicle.status === 'available'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {driverVehicle.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">License Plate</span>
                      <span className="text-sm font-medium">
                        {driverVehicle.licensePlate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vehicle Type</span>
                      <span className="text-sm font-medium capitalize">
                        {driverVehicle.type}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No vehicle assigned. Please contact admin.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Report Emergency
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicle Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => queryClient.invalidateQueries()} // Invalidate all queries to refresh data
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
