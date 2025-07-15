// // src/pages/DriverDashboard.tsx
// import { useState, useEffect } from 'react'
// import {
//   Car,
//   MapPin,
//   DollarSign,
//   Clock,
//   Star,
//   Users,
//   TrendingUp,
//   Zap,
//   Battery,
//   Navigation,
//   Phone,
//   MessageSquare,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   BookOpen, // For bookings
//   ClipboardList, // For reviews
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Switch } from '@/components/ui/switch'
// import { Progress } from '@/components/ui/progress'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { DashboardSidebar } from '@/components/dashboard-sidebar'

// import { ridesService } from '@/lib/rides-service'
// import { RideshareService } from '@/lib/rideshare-service' 
// import { toast } from '@/components/ui/use-toast'
// import type { DriverDashboardStats, Vehicle, Ride } from '@/lib/types'

// // Import the new useGlobalCounts hook
// import { useGlobalCounts } from '@/useHooks' // Adjust path as needed

// import { createFileRoute } from '@tanstack/react-router' // Keep this at the top as it's a route definition

// export const Route = createFileRoute('/dashboard/driver')({
//   component: DriverDashboard,
// })

// export default function DriverDashboard() {
//   const [isOnline, setIsOnline] = useState(false) // Default to offline
//   const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
//   const [currentRide, setCurrentRide] = useState<Ride | null>(null)
//   const [pendingRides, setPendingRides] = useState<Ride[]>([])
//   const [driverStats, setDriverStats] = useState<DriverDashboardStats>({
//     todayEarnings: 0,
//     weeklyEarnings: 0,
//     monthlyEarnings: 0,
//     totalRides: 0,
//     rating: 0,
//     completionRate: 0,
//     hoursOnline: 0,
//     activeRides: 0,
//   })
//   const [vehicle, setVehicle] = useState<Vehicle | null>(null)

//   // Fetch global counts using TanStack Query
//   const {
//     data: globalCounts,
//     isLoading: isLoadingGlobalCounts,
//     isError: isErrorGlobalCounts,
//     error: globalCountsError,
//   } = useGlobalCounts()

//   useEffect(() => {
//     loadDashboardData()
//   }, [])

//   // Effect for handling online status and sending coordinates
//   useEffect(() => {
//     const updateDriverLocation = async (
//       latitude: number,
//       longitude: number,
//     ) => {
//       try {
//         // Assuming you have an API service to update driver location
//         await RideshareService.updateDriverLocation(latitude, longitude)
//         console.log('Driver location updated:', latitude, longitude)
//         toast({
//           title: 'Location Updated',
//           description: 'Your current location has been sent.',
//           variant: 'success',
//         })
//       } catch (error) {
//         console.error('Error updating driver location:', error)
//         toast({
//           title: 'Location Update Failed',
//           description:
//             'Could not send your location. Please check permissions.',
//           variant: 'destructive',
//         })
//       }
//     }

//     if (isOnline) {
//       if (navigator.geolocation) {
//         navigator.geolocation.watchPosition(
//           (position) => {
//             updateDriverLocation(
//               position.coords.latitude,
//               position.coords.longitude,
//             )
//           },
//           (error) => {
//             console.error('Geolocation error:', error)
//             toast({
//               title: 'Geolocation Error',
//               description:
//                 error.message ||
//                 'Unable to retrieve your location. Please enable location services.',
//               variant: 'destructive',
//             })
//             // Optionally, set isOnline back to false if location can't be obtained
//             setIsOnline(false);
//           },
//           { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
//         )
//       } else {
//         toast({
//           title: 'Geolocation Not Supported',
//           description: 'Your browser does not support geolocation.',
//           variant: 'destructive',
//         })
//         setIsOnline(false)
//       }
//     }
//   }, [isOnline]) // Re-run when isOnline changes

//   const loadDashboardData = async () => {
//     setIsLoadingDashboard(true)
//     try {
//       const [stats, vehicleData, rides] = await Promise.all([
//         RideshareService.getDriverStats(),
//         RideshareService.getDriverVehicle(),
//         RideshareService.getDriverRides({ limit: 10, status: 'pending' }),
//       ])

//       setDriverStats(stats)
//       setVehicle(vehicleData)
//       setPendingRides(rides.data.filter((ride) => ride.status === 'pending'))

//       const activeRide = rides.data.find((ride) => ride.status === 'active')
//       if (activeRide) {
//         setCurrentRide(activeRide)
//       }
//     } catch (error: any) {
//       console.error('Error loading dashboard data:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load dashboard data. Please refresh the page.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoadingDashboard(false)
//     }
//   }

//   const handleAcceptRide = async (rideId: string) => {
//     try {
//       const acceptedRide = await ridesService.updateRideStatus(rideId, 'active')
//       setCurrentRide(acceptedRide)
//       setPendingRides(pendingRides.filter((r) => r.id !== rideId))

//       toast({
//         title: 'Ride Accepted',
//         description: 'You have successfully accepted the ride request.',
//       })
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to accept ride.',
//         variant: 'destructive',
//       })
//     }
//   }

//   const handleDeclineRide = async (rideId: string) => {
//     try {
//       await ridesService.updateRideStatus(rideId, 'cancelled')
//       setPendingRides(pendingRides.filter((r) => r.id !== rideId))

//       toast({
//         title: 'Ride Declined',
//         description: 'You have declined the ride request.',
//       })
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to decline ride.',
//         variant: 'destructive',
//       })
//     }
//   }

//   const handleCompleteRide = async () => {
//     if (!currentRide) return

//     try {
//       await ridesService.updateRideStatus(currentRide.id, 'completed')
//       setCurrentRide(null)

//       // Refresh stats after completing ride
//       // Assuming dashboardService is available, otherwise use RideshareService
//       const updatedStats = await RideshareService.getDriverStats()
//       setDriverStats(updatedStats)

//       toast({
//         title: 'Ride Completed',
//         description: 'The ride has been marked as completed.',
//       })
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to complete ride.',
//         variant: 'destructive',
//       })
//     }
//   }

//   const weeklyGoal = {
//     target: 1500,
//     current: driverStats.weeklyEarnings,
//     percentage: Math.min((driverStats.weeklyEarnings / 1500) * 100, 100),
//   }

//   // Combine loading states
//   const overallLoading = isLoadingDashboard || isLoadingGlobalCounts

//   if (overallLoading) {
//     return (
//       <div className="flex min-h-screen bg-background">
//         <DashboardSidebar userType="driver" />
//         <div className="flex-1 lg:ml-0 flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             <p className="text-muted-foreground">Loading dashboard...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Handle error for global counts
//   if (isErrorGlobalCounts) {
//     toast({
//       title: 'Error loading global stats',
//       description:
//         globalCountsError?.message || 'Failed to fetch overall counts.',
//       variant: 'destructive',
//     })
//   }

//   return (
//     <div className="flex min-h-screen bg-background">
//       <DashboardSidebar userType="driver" />

//       <div className="flex-1 lg:ml-0">
//         <div className="p-6 space-y-6">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold">Driver Dashboard</h1>
//               <p className="text-muted-foreground">
//                 Manage your rides and track earnings
//               </p>
//             </div>

//             {/* Online Status Toggle */}
//             <div className="flex items-center gap-3">
//               <div className="text-right">
//                 <p className="text-sm font-medium">
//                   {isOnline ? 'Online' : 'Offline'}
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   {isOnline ? 'Available for rides' : 'Not accepting rides'}
//                 </p>
//               </div>
//               <Switch
//                 checked={isOnline}
//                 onCheckedChange={setIsOnline}
//                 className="data-[state=checked]:bg-green-600"
//               />
//               <div
//                 className={`w-3 h-3 rounded-full ${
//                   isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
//                 }`}
//               />
//             </div>
//           </div>

//           {/* Current Ride */}
//           {currentRide && (
//             <Card className="border-primary/20 bg-primary/5">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center gap-2">
//                     <Car className="w-5 h-5" />
//                     Current Ride
//                   </CardTitle>
//                   <Badge variant="default">In Progress</Badge>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Avatar>
//                     <AvatarImage src="/placeholder.svg" />
//                     <AvatarFallback>
//                       {currentRide.bookings?.[0]?.user?.name?.charAt(0) || 'U'}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex-1">
//                     <p className="font-medium">
//                       {currentRide.bookings?.[0]?.user?.name || 'Customer'}
//                     </p>
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                       <span className="text-sm text-muted-foreground">
//                         {currentRide.driver?.rating || 'N/A'}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium text-green-600">
//                       ${currentRide.fare}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {currentRide.type}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full" />
//                     <span className="text-sm">
//                       Pickup: {currentRide.pickUpLocation.lat},{' '}
//                       {currentRide.pickUpLocation.lng}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-red-500 rounded-full" />
//                     <span className="text-sm">
//                       Destination: {currentRide.dropOffLocation.lat},{' '}
//                       {currentRide.dropOffLocation.lng}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <Button size="sm" className="flex-1">
//                     <Navigation className="w-4 h-4 mr-2" />
//                     Navigate
//                   </Button>
//                   <Button variant="outline" size="sm">
//                     <Phone className="w-4 h-4 mr-2" />
//                     Call
//                   </Button>
//                   <Button variant="outline" size="sm">
//                     <MessageSquare className="w-4 h-4 mr-2" />
//                     Chat
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     onClick={handleCompleteRide}
//                   >
//                     Complete
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Daily Stats (Driver-specific and Total Bookings) */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Today's Earnings
//                     </p>
//                     <p className="text-2xl font-bold text-green-600">
//                       ${driverStats.todayEarnings.toFixed(2)}
//                     </p>
//                   </div>
//                   <DollarSign className="w-8 h-8 text-green-600" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Total Rides (Driver)
//                     </p>
//                     <p className="text-2xl font-bold">
//                       {driverStats.totalRides}
//                     </p>
//                   </div>
//                   <Car className="w-8 h-8 text-blue-600" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Hours Online
//                     </p>
//                     <p className="text-2xl font-bold">
//                       {driverStats.hoursOnline}h
//                     </p>
//                   </div>
//                   <Clock className="w-8 h-8 text-purple-600" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Average Rating
//                     </p>
//                     <p className="text-2xl font-bold flex items-center gap-1">
//                       {driverStats.rating.toFixed(1)}
//                       <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
//                     </p>
//                   </div>
//                   <Star className="w-8 h-8 text-yellow-600" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Completion Rate
//                     </p>
//                     <p className="text-2xl font-bold text-green-600">
//                       {driverStats.completionRate.toFixed(1)}%
//                     </p>
//                   </div>
//                   <TrendingUp className="w-8 h-8 text-green-600" />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Total Bookings Card - Moved to driver stats section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Total Bookings
//                     </p>
//                     <p className="text-2xl font-bold">
//                       {globalCounts?.totalBookings || 0}
//                     </p>
//                   </div>
//                   <BookOpen className="w-8 h-8 text-purple-600" />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Weekly Goal Progress */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="w-5 h-5" />
//                 Weekly Goal Progress
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium">
//                     ${weeklyGoal.current.toFixed(2)} / ${weeklyGoal.target}
//                   </span>
//                   <span className="text-sm text-muted-foreground">
//                     {weeklyGoal.percentage.toFixed(1)}% complete
//                   </span>
//                 </div>
//                 <Progress value={weeklyGoal.percentage} className="h-3" />
//                 <p className="text-sm text-muted-foreground">
//                   ${(weeklyGoal.target - weeklyGoal.current).toFixed(2)}{' '}
//                   remaining to reach your weekly goal
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Ride Requests */}
//           {isOnline && pendingRides.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   Incoming Ride Requests
//                   <Badge variant="secondary">{pendingRides.length}</Badge>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {pendingRides.map((ride) => (
//                   <div
//                     key={ride.id}
//                     className="border border-border rounded-lg p-4 space-y-3"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <Avatar>
//                           <AvatarImage src="/placeholder.svg" />
//                           <AvatarFallback>
//                             {ride.bookings?.[0]?.user?.name?.charAt(0) || 'U'}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <p className="font-medium">
//                             {ride.bookings?.[0]?.user?.name || 'Customer'}
//                           </p>
//                           <div className="flex items-center gap-1">
//                             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                             <span className="text-sm text-muted-foreground">
//                               {ride.driver?.rating || 'N/A'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-medium text-green-600">
//                           ${ride.fare}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {ride.type}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full" />
//                         <span className="text-sm">
//                           Pickup: {ride.pickUpLocation.lat},{' '}
//                           {ride.pickUpLocation.lng}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-red-500 rounded-full" />
//                         <span className="text-sm">
//                           Destination: {ride.dropOffLocation.lat},{' '}
//                           {ride.dropOffLocation.lng}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex gap-2">
//                       <Button
//                         className="flex-1"
//                         onClick={() => handleAcceptRide(ride.id)}
//                       >
//                         <CheckCircle className="w-4 h-4 mr-2" />
//                         Accept
//                       </Button>
//                       <Button
//                         variant="outline"
//                         className="flex-1"
//                         onClick={() => handleDeclineRide(ride.id)}
//                       >
//                         <XCircle className="w-4 h-4 mr-2" />
//                         Decline
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           )}

//           {/* Vehicle Status */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Car className="w-5 h-5" />
//                   Vehicle Status
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {vehicle ? (
//                   <>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">
//                         {vehicle.model} {vehicle.year}
//                       </span>
//                       <Badge
//                         variant={
//                           vehicle.status === 'available'
//                             ? 'default'
//                             : 'secondary'
//                         }
//                       >
//                         {vehicle.status}
//                       </Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">License Plate</span>
//                       <span className="text-sm font-medium">
//                         {vehicle.licensePlate}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">Vehicle Type</span>
//                       <span className="text-sm font-medium capitalize">
//                         {vehicle.type}
//                       </span>
//                     </div>
//                   </>
//                 ) : (
//                   <p className="text-sm text-muted-foreground">
//                     No vehicle assigned. Please contact admin.
//                   </p>
//                 )}
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <AlertTriangle className="w-5 h-5" />
//                   Quick Actions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button variant="outline" className="w-full justify-start">
//                   <Zap className="w-4 h-4 mr-2" />
//                   Report Emergency
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start">
//                   <Car className="w-4 h-4 mr-2" />
//                   Vehicle Maintenance
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start">
//                   <MessageSquare className="w-4 h-4 mr-2" />
//                   Contact Support
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start"
//                   onClick={loadDashboardData}
//                 >
//                   <MapPin className="w-4 h-4 mr-2" />
//                   Refresh Data
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }